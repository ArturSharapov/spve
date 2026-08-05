import { existsSync, readFileSync } from 'node:fs'
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

const publicSharePoint = fileURLToPath(new URL('./sp.mjs', import.meta.url))
const virtualStandalone = 'virtual:spve-standalone'
const resolvedVirtualStandalone = `\0${virtualStandalone}`
const virtualSharePoint = '/__spve-sharepoint'
const resolvedVirtualSharePoint = '\0virtual:spve-sharepoint'

const projectDefaults = {
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
  let createHeftLogger
  let sharePointOrigin
  let applicationEntry = '/src/main.ts'
  let packageWebpartOnClose = false

  return {
    name: 'spve',
    enforce: 'pre',

    async config(config, environment) {
      const root = path.resolve(config.root ?? process.cwd())
      const settings = JSON.parse(readFileSync(path.join(root, 'spve.config.json'), 'utf8'))
      const entry = ['src/main.ts', 'src/main.tsx', 'src/main.js', 'src/main.jsx'].find(
        (candidate) => existsSync(path.join(root, candidate)),
      )
      if (!entry)
        throw new Error('SPVE: expected src/main.ts, src/main.tsx, src/main.js, or src/main.jsx')
      applicationEntry = `/${entry}`
      spMode = environment.mode === 'sp'
      const vitePlus = createRequire(path.join(root, 'package.json'))('vite-plus')
      const { loadEnv } = vitePlus
      createHeftLogger = vitePlus.createLogger
      const siteUrl = loadEnv(environment.mode, root, '').VITE_SP_SITE_URL
      sharePointOrigin = siteUrl ? new URL(siteUrl).origin : undefined
      if (spMode && environment.command === 'serve' && !siteUrl) {
        throw new Error('SPVE: VITE_SP_SITE_URL is required for `vp dev -m sp`')
      }
      if (spMode) webpart = prepareWebpart(root, settings, siteUrl)
      const spDevelopment = spMode && environment.command === 'serve'
      packageWebpartOnClose = spMode && environment.command === 'build'
      const https = spDevelopment ? await ensureDevCertificate(webpart) : undefined

      return {
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
      if (!spMode || !webpart) return

      const controller = new AbortController()
      const heftLogger = createHeftLogger(server.config.logLevel, {
        prefix: '[heft]',
        allowClearScreen: false,
      })
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
    },

    load(id) {
      if (id === resolvedVirtualStandalone) {
        return `
          import app from ${JSON.stringify(applicationEntry)}
          import { createMsalSP } from 'spve/internal/msal'
          app.mount({
            element: document.querySelector('#spve-local'),
            props: { description: 'Standalone Vite+ development mode' },
            services: { sp: await createMsalSP() },
          })
        `
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
      await packageWebpart(webpart)
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
