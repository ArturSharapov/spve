import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { lazyPlugins } from 'vite-plus'
import {
  ensureDevCertificate,
  packageWebpart,
  prepareWebpart,
  startWebpart,
  stopWebpart,
} from './spfx.mjs'
import { loadSpveConfig, normalizeConfig } from './project.mjs'

const publicSharePoint = fileURLToPath(new URL('./sp.mjs', import.meta.url))
const publicVueAdapter = fileURLToPath(new URL('./vue.mjs', import.meta.url))
const privateMsal = fileURLToPath(new URL('./msal.mjs', import.meta.url))
const virtualStandalone = 'virtual:spve-standalone'
const resolvedVirtualStandalone = `\0${virtualStandalone}`
const virtualSharePoint = '/__spve-sharepoint'
const resolvedVirtualSharePoint = '\0virtual:spve-sharepoint'
const virtualVueProperties = 'spve/vue'
const resolvedVirtualVueProperties = '\0virtual:spve-vue-properties'
const virtualReactPreamble = 'virtual:spve-react-preamble'
const resolvedVirtualReactPreamble = `\0${virtualReactPreamble}`

function conciseError(message) {
  const error = new Error(message)
  error.stack = `Error: ${message}`
  return error
}

const projectDefaults = {
  optimizeDeps: {
    // The React adapter imports plugin-react's virtual preamble module, which must be resolved by
    // Vite rather than dependency-prebundled as ordinary package source.
    exclude: ['spve/react', '@spve/core/react', 'spve/react/context', '@spve/core/react/context'],
  },
  fmt: {
    ignorePatterns: ['.spve/**', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'],
    semi: false,
    singleQuote: true,
  },
  lint: {
    ignorePatterns: ['.spve/**'],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
}

function spvePlugin() {
  let spMode = false
  let webpart
  let heftLogger
  let sharePointOrigin
  let sharePointSiteUrl
  let applicationEntry = '/src/main.ts'
  let applicationProps = {}
  let vueProperties = {}
  let projectConfigFile
  let packageWebpartOnClose = false

  return {
    name: 'spve',
    enforce: 'pre',

    async config(config, environment) {
      const root = path.resolve(config.root ?? process.cwd())
      const require = createRequire(path.join(root, 'package.json'))
      let reactClient = false
      try {
        require.resolve('react-dom/client')
        reactClient = true
      } catch (error) {
        if (error.code !== 'MODULE_NOT_FOUND') throw error
      }
      projectConfigFile = path.join(root, 'spve.config.ts')
      const settings = await loadSpveConfig(root)
      if (!settings.dev?.siteUrl) {
        throw conciseError(
          [
            'SPVE: SharePoint site URL is not configured.',
            '',
            'Add it to spve.config.ts:',
            "  dev: { siteUrl: 'https://contoso.sharepoint.com/sites/example', ... }",
          ].join('\n'),
        )
      }
      const normalized = normalizeConfig(settings)
      const entry = ['src/main.ts', 'src/main.tsx', 'src/main.js', 'src/main.jsx'].find(
        (candidate) => existsSync(path.join(root, candidate)),
      )
      if (!entry)
        throw new Error('SPVE: expected src/main.ts, src/main.tsx, src/main.js, or src/main.jsx')
      applicationEntry = `/${entry}`
      spMode = environment.mode === 'sp'
      const vitePlus = createRequire(path.join(root, 'package.json'))('vite-plus')
      heftLogger = vitePlus.createLogger(config.logLevel, {
        prefix: '[heft]',
        allowClearScreen: false,
      })
      sharePointSiteUrl = normalized.dev.siteUrl
      sharePointOrigin = new URL(sharePointSiteUrl).origin
      applicationProps = Object.fromEntries(
        Object.entries(normalized.webpart.properties)
          .filter(([, property]) => property.default !== undefined)
          .map(([name, property]) => [name, property.default]),
      )
      vueProperties = Object.fromEntries(
        Object.entries(normalized.webpart.properties).map(([name, property]) => [
          name,
          { type: null, required: Boolean(property.required) },
        ]),
      )
      webpart = prepareWebpart(root, settings)
      const spDevelopment = spMode && environment.command === 'serve'
      packageWebpartOnClose = spMode && environment.command === 'build'
      const https = spDevelopment
        ? await ensureDevCertificate(webpart, undefined, heftLogger)
        : undefined

      return {
        optimizeDeps: { include: reactClient ? ['react-dom/client'] : [] },
        base: spDevelopment ? '/__spve/' : undefined,
        resolve: {
          alias: {
            sp: publicSharePoint,
          },
          dedupe: ['@azure/msal-browser', '@pnp/sp'],
        },
        server: {
          cors: spMode ? { origin: sharePointOrigin } : undefined,
          headers: spMode ? { 'Access-Control-Allow-Private-Network': 'true' } : undefined,
          host: 'localhost',
          https,
          port: settings.dev.vitePort,
          strictPort: true,
          watch: { ignored: ['**/.spve/**'] },
          ws: spDevelopment ? { path: '/__spve-hmr' } : undefined,
        },
        build:
          spMode && environment.command === 'build'
            ? {
                copyPublicDir: false,
                emptyOutDir: true,
                outDir: '.spve/webpart/src/lib/appcode',
                lib: {
                  entry,
                  formats: ['es'],
                  fileName: 'index',
                },
                rollupOptions: {
                  output: {
                    assetFileNames: (asset) =>
                      asset.name?.endsWith('.css') ? 'index.css' : '[name][extname]',
                  },
                },
              }
            : undefined,
      }
    },

    configureServer(server) {
      server.watcher.add(projectConfigFile)
      server.watcher.on('change', (file) => {
        if (path.resolve(file) === projectConfigFile) void server.restart()
      })

      if (!spMode || !webpart) return

      const controller = new AbortController()
      let heftProcess
      let started = false
      let stopped = false
      const stopOnExit = () => {
        controller.abort()
        stopWebpart(heftProcess, 'SIGKILL')
      }
      const stop = () => {
        if (stopped) return
        stopped = true
        controller.abort()
        stopWebpart(heftProcess, 'SIGKILL')
        process.off('exit', stopOnExit)
        process.off('SIGINT', stopOnInterrupt)
        process.off('SIGTERM', stopOnTermination)
      }
      const stopOnInterrupt = () => {
        process.off('exit', stopOnExit)
        stopOnExit()
        process.exit(130)
      }
      const stopOnTermination = () => {
        process.off('exit', stopOnExit)
        stopOnExit()
        process.exit(143)
      }

      const fail = (error) => {
        if (controller.signal.aborted) return
        heftLogger.error(error.message, { timestamp: true })
        void server.close()
      }
      const start = () => {
        if (started || controller.signal.aborted) return
        started = true
        void startWebpart(webpart, controller.signal, heftLogger)
          .then((child) => {
            heftProcess = child
            child.once('error', fail)
            child.once('exit', (code) => {
              if (!controller.signal.aborted) {
                fail(new Error(`Heft exited with code ${code ?? 'unknown'}`))
              }
            })
            if (controller.signal.aborted) {
              stopWebpart(child, 'SIGKILL')
            }
          })
          .catch(fail)
      }

      // Heft is detached so its complete webpack tree can be managed as one group.
      // Stop that group before exiting instead of entering Heft's interactive
      // graceful-shutdown path, which otherwise waits for more terminal input.
      process.once('exit', stopOnExit)
      process.once('SIGINT', stopOnInterrupt)
      process.once('SIGTERM', stopOnTermination)
      server.httpServer?.once('close', stop)
      if (server.httpServer?.listening) start()
      else server.httpServer?.once('listening', start)
    },

    resolveId(id) {
      if (id === virtualStandalone) return resolvedVirtualStandalone
      if (id === virtualSharePoint) return resolvedVirtualSharePoint
      if (id === virtualVueProperties) return resolvedVirtualVueProperties
      if (id === virtualReactPreamble) return resolvedVirtualReactPreamble
    },

    load(id) {
      if (id === resolvedVirtualStandalone) {
        return `
          import app from ${JSON.stringify(applicationEntry)}
          import { createMsalSP } from ${JSON.stringify(privateMsal)}
          app.mount({
            element: document.querySelector('#spve-local'),
            props: ${JSON.stringify(applicationProps)},
            services: { sp: await createMsalSP(${JSON.stringify(sharePointSiteUrl)}) },
          })
        `
      }

      if (id === resolvedVirtualVueProperties) {
        return `
          export { defineVueApp } from ${JSON.stringify(publicVueAdapter)}
          export default ${JSON.stringify(vueProperties)}
        `
      }

      if (id === resolvedVirtualReactPreamble) {
        return spMode ? `import '@vitejs/plugin-react/preamble'` : ''
      }

      if (id === resolvedVirtualSharePoint) {
        return `
          import initialModule from ${JSON.stringify(applicationEntry)}

          let currentModule = initialModule
          const mounts = new Set()

          const app = {
            mount(context) {
              const mount = {
                context,
                instance: currentModule.mount(context),
              }
              mounts.add(mount)

              return {
                setProps(props) {
                  mount.context = { ...mount.context, props }
                  mount.instance.setProps(props)
                },
                unmount() {
                  mounts.delete(mount)
                  mount.instance.unmount()
                },
              }
            },
          }

          if (import.meta.hot && location.origin === ${JSON.stringify(sharePointOrigin)}) {
            import.meta.hot.on('vite:beforeUpdate', () => {
              document.querySelectorAll('vite-error-overlay').forEach(overlay => overlay.remove())
            })

            import.meta.hot.accept(${JSON.stringify(applicationEntry)}, module => {
              if (!module?.default) return
              currentModule = module.default

              for (const mount of mounts) {
                mount.instance.unmount()
                mount.instance = currentModule.mount(mount.context)
              }
            })
          }

          export default app
        `
      }
    },

    transformIndexHtml: {
      order: 'pre',
      handler() {
        // if (spMode) return
        return [
          {
            tag: 'script',
            attrs: { type: 'module' },
            children: `import '${virtualStandalone}'`,
            injectTo: 'body',
          },
        ]
      },
    },

    async closeBundle() {
      if (!packageWebpartOnClose || !webpart) return
      await packageWebpart(webpart, undefined, heftLogger)
    },
  }
}

export function spve() {
  return {
    ...projectDefaults,
    plugins: lazyPlugins(() => [spvePlugin()]),
  }
}

export default spve
