import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'vite-plus/test'
import { migrateProject, parseArgs } from '../lib/migrate.mjs'

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function createLegacyProject(root) {
  writeJson(path.join(root, 'package.json'), {
    name: 'legacy-people',
    version: '2.3.4',
    dependencies: {
      '@microsoft/sp-core-library': '1.22.0',
      '@microsoft/sp-webpart-base': '1.22.0',
      '@pnp/spfx-controls-react': '^3.24.0',
      'node-sass': '9.0.0',
      react: '17.0.1',
      'react-dom': '17.0.1',
    },
    devDependencies: {
      '@rushstack/heft': '1.1.2',
      '@types/react': '17.0.45',
      typescript: '~5.3.3',
    },
  })
  writeJson(path.join(root, 'package-lock.json'), {
    lockfileVersion: 3,
    packages: {
      'node_modules/@pnp/spfx-controls-react': {
        version: '3.24.0',
        hasInstallScript: true,
        dependencies: { swiper: '^8.0.0' },
        peerDependencies: { react: '>=16.8.0 <18.0.0' },
      },
      'node_modules/swiper': {
        version: '8.4.7',
        hasInstallScript: true,
        dependencies: { 'core-js': '^3.0.0' },
      },
      'node_modules/core-js': { version: '3.50.0', hasInstallScript: true },
      'node_modules/unrelated-build': { version: '1.0.0', hasInstallScript: true },
      'node_modules/tiny-runtime': { version: '1.2.3' },
    },
  })
  writeJson(path.join(root, 'config/package-solution.json'), {
    solution: {
      name: 'People solution',
      id: '11111111-1111-4111-8111-111111111111',
      version: '2.0.0.0',
      includeClientSideAssets: true,
      skipFeatureDeployment: true,
      webApiPermissionRequests: [{ resource: 'Microsoft Graph', scope: 'User.Read.All' }],
      features: [{ id: '22222222-2222-4222-8222-222222222222' }],
    },
  })
  writeJson(path.join(root, 'config/serve.json'), {
    port: 4321,
    initialPage: 'https://contoso.sharepoint.com/sites/people/_layouts/workbench.aspx',
  })
  writeJson(path.join(root, 'config/config.json'), {
    localizedResources: {
      PeopleWebPartStrings: 'lib/webparts/people/loc/{locale}.js',
    },
  })
  writeJson(path.join(root, 'src/webparts/people/PeopleWebPart.manifest.json'), {
    id: '33333333-3333-4333-8333-333333333333',
    alias: 'PEOPLELegacyWebpart',
    supportsFullBleed: true,
    supportedHosts: ['SharePointWebPart', 'SharePointFullPage'],
    supportsThemeVariants: true,
    preconfiguredEntries: [
      {
        groupId: '44444444-4444-4444-8444-444444444444',
        group: { default: 'Advanced' },
        title: { default: 'People' },
        description: { default: 'People directory' },
        officeFabricIconFontName: 'People',
        properties: { description: 'Hello', pageSize: 20, showPhotos: true },
      },
    ],
  })
  writeFileSync(
    path.join(root, 'src/webparts/people/PeopleWebPart.tsx'),
    `import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { People } from './components/People';

export default class PeopleWebPart extends BaseClientSideWebPart {
  public render(): void {
    const element = <div data-info={{ first: true, second: true }}><People context={this.context} title={this.properties.description} /></div>;
    ReactDom.render(element, this.domElement);
  }

  protected getPropertyPaneConfiguration(): object {
    return {};
  }
}
`,
  )
  writeJson(path.join(root, 'src/webparts/other/OtherWebPart.manifest.json'), {
    id: '55555555-5555-4555-8555-555555555555',
    alias: 'OtherWebPart',
    preconfiguredEntries: [{ title: { default: 'Other' }, properties: {} }],
  })
  writeFileSync(
    path.join(root, 'src/webparts/other/OtherWebPart.tsx'),
    `import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
export default class OtherWebPart extends BaseClientSideWebPart {
  render(): void { ReactDom.render(<p>Other</p>, this.domElement); }
}
`,
  )
  mkdirSync(path.join(root, 'src/webparts/people/components'), { recursive: true })
  writeFileSync(
    path.join(root, 'src/webparts/people/components/People.tsx'),
    `import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { formatTitle } from '../../../common/formatTitle';
import { Child, runtimeValue } from '../../../common/models';
import * as strings from 'PeopleWebPartStrings';
import { canonical } from '../../../common/canonical';
import { FileTypeIcon } from '@pnp/spfx-controls-react';
import { value } from 'tiny-runtime';
export function People({ title }: { context: WebPartContext; title?: string }) {
  const child: Child = { name: strings.Child };
  return <h1 data-name={child.name}>{formatTitle(title)} {runtimeValue} {canonical.ok} {value}</h1>;
}
`,
  )
  mkdirSync(path.join(root, 'src/webparts/people/loc'), { recursive: true })
  writeFileSync(
    path.join(root, 'src/webparts/people/loc/en-us.js'),
    `define([], function() { return { Child: 'Child' }; });\n`,
  )
  mkdirSync(path.join(root, 'src/common'), { recursive: true })
  writeFileSync(
    path.join(root, 'src/common/formatTitle.ts'),
    `export function formatTitle(title?: string): string {
  return title ?? 'People';
}
`,
  )
  mkdirSync(path.join(root, 'src/common/models'), { recursive: true })
  writeFileSync(
    path.join(root, 'src/common/models/types.ts'),
    `export interface Child { name: string }\n`,
  )
  writeFileSync(
    path.join(root, 'src/common/models/index.ts'),
    `export { Child } from './types';\nexport const runtimeValue = 'runtime';\n`,
  )
  writeFileSync(
    path.join(root, 'src/common/canonical.ts'),
    `export const canonical = require('../../external-resources/data.json');\n`,
  )
  writeFileSync(
    path.join(root, 'src/common/http.ts'),
    `import { AadHttpClient, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
export function status(response: SPHttpClientResponse): number {
  return response.status + Number(Boolean(SPHttpClient.configurations.v1)) + Number(Boolean(AadHttpClient));
}
`,
  )
  mkdirSync(path.join(root, 'external-resources'), { recursive: true })
  writeFileSync(path.join(root, 'external-resources/data.json'), '{"ok":true}\n')
}

test('migrates a legacy React SPFx project without changing its source', () => {
  const temporaryRoot = mkdtempSync(path.join(tmpdir(), 'migrate-sp-'))
  const source = path.join(temporaryRoot, 'legacy')
  const target = path.join(temporaryRoot, 'modern')
  mkdirSync(source)
  createLegacyProject(source)
  const originalEntry = readFileSync(
    path.join(source, 'src/webparts/people/PeopleWebPart.tsx'),
    'utf8',
  )

  try {
    const relativeTarget = path.relative(process.cwd(), target)
    assert.throws(() => migrateProject({ source, target: relativeTarget }), /Use --webpart/)
    const result = migrateProject({ source, target: relativeTarget, webpart: 'people' })
    assert.equal(result.title, 'People')
    assert.equal(result.targetDisplay, relativeTarget)
    assert.equal(result.requiresSharePointContext, true)
    assert.equal(
      result.diagnostics.some((item) => item.code === 'SPFX_PROPERTY_PANE'),
      true,
    )
    assert.equal(
      result.diagnostics.some((item) => item.code === 'REMAINING_SPFX_RUNTIME_IMPORT'),
      true,
    )
    assert.equal(
      result.diagnostics.some((item) => item.code === 'REACT_19_PEER_RANGE'),
      true,
    )
    assert.equal(
      readFileSync(path.join(source, 'src/webparts/people/PeopleWebPart.tsx'), 'utf8'),
      originalEntry,
    )

    const packageJson = JSON.parse(readFileSync(path.join(target, 'package.json'), 'utf8'))
    assert.equal(packageJson.packageManager, undefined)
    assert.equal(packageJson.devEngines.packageManager.name, 'pnpm')
    assert.equal(packageJson.dependencies['@azure/msal-browser'], '^2.38.2')
    assert.equal(packageJson.dependencies['@microsoft/sp-core-library'], undefined)
    assert.equal(packageJson.dependencies['@microsoft/sp-webpart-base'], undefined)
    assert.equal(packageJson.dependencies['node-sass'], undefined)
    assert.equal(packageJson.dependencies['@pnp/sp'], '^3.26.0')
    assert.equal(packageJson.dependencies.react, '^19.2.8')
    assert.equal(packageJson.dependencies['tiny-runtime'], '1.2.3')
    assert.equal(packageJson.dependencies.spve, 'npm:@spve/core@^0.0.7')
    assert.equal(packageJson.devDependencies['@rushstack/heft'], undefined)
    assert.equal(packageJson.devDependencies['@microsoft/sp-http'], '1.22.0')
    assert.equal(packageJson.devDependencies['@microsoft/sp-webpart-base'], '1.22.0')
    assert.equal(packageJson.scripts.postinstall, 'spve prepare')
    const workspace = readFileSync(path.join(target, 'pnpm-workspace.yaml'), 'utf8')
    assert.match(workspace, /"@pnp\/spfx-controls-react": true/)
    assert.match(workspace, /"core-js": true/)
    assert.match(workspace, /"swiper": true/)
    assert.doesNotMatch(workspace, /unrelated-build/)
    assert.equal(
      readFileSync(path.join(target, 'vite.config.ts'), 'utf8'),
      readFileSync(
        new URL('../../create-sp/templates/react-ts/vite.config.ts', import.meta.url),
        'utf8',
      ),
    )
    const tsconfig = JSON.parse(readFileSync(path.join(target, 'tsconfig.json'), 'utf8'))
    assert.equal(tsconfig.compilerOptions.verbatimModuleSyntax, true)
    assert.equal(tsconfig.compilerOptions.resolveJsonModule, true)
    assert.equal(tsconfig.compilerOptions.erasableSyntaxOnly, false)

    const config = readFileSync(path.join(target, 'spve.config.ts'), 'utf8')
    assert.match(config, /33333333-3333-4333-8333-333333333333/)
    assert.match(config, /11111111-1111-4111-8111-111111111111/)
    assert.match(config, /User\.Read\.All/)
    assert.match(config, /https:\/\/contoso\.sharepoint\.com\/sites\/people/)
    assert.match(config, /"spfxPort": 4321/)
    assert.match(config, /"alias": "PEOPLELegacyWebpart"/)
    assert.match(config, /"supportsFullBleed": true/)

    const main = readFileSync(path.join(target, 'src/main.ts'), 'utf8')
    assert.match(main, /import \{ defineReactApp \} from 'spve\/react'/)
    assert.match(main, /import \{ withContext \} from 'spve\/context'/)
    assert.match(main, /export default defineReactApp\(App, withContext\(\)\)/)
    assert.doesNotMatch(main, /createRoot|spve-entry|webparts/)

    const app = readFileSync(path.join(target, 'src/App.tsx'), 'utf8')
    assert.match(app, /ReactAppDefinition<AppProps, ContextServices>/)
    assert.match(app, /<People context=\{context\} title=\{props\.description\}/)
    assert.doesNotMatch(app, /BaseClientSideWebPart|defineReactApp/)
    assert.equal(existsSync(path.join(target, 'src/components/People.tsx')), true)
    const component = readFileSync(path.join(target, 'src/components/People.tsx'), 'utf8')
    assert.match(component, /import \{ type WebPartContext \} from 'spve\/context'/)
    assert.match(component, /from '\.\.\/common\/formatTitle'/)
    assert.match(component, /import \{ type Child, runtimeValue \}/)
    assert.match(component, /import strings from '\.\.\/loc\/en-us\.js'/)
    assert.match(component, /from '@pnp\/spfx-controls-react'/)
    assert.doesNotMatch(component, /lib\/controls\/fileTypeIcon/)
    const models = readFileSync(path.join(target, 'src/common/models/index.ts'), 'utf8')
    assert.match(models, /export \{ type Child \}/)
    const http = readFileSync(path.join(target, 'src/common/http.ts'), 'utf8')
    assert.match(http, /import \{ SPHttpClient, type SPHttpClientResponse \} from 'spve\/context'/)
    assert.match(http, /import \{ AadHttpClient \} from '@microsoft\/sp-http'/)
    const canonical = readFileSync(path.join(target, 'src/common/canonical.ts'), 'utf8')
    assert.match(canonical, /import __migratedAsset0 from/)
    assert.doesNotMatch(canonical, /require\(/)
    assert.match(canonical, /_migrated\/assets\/external-resources/)
    assert.equal(
      existsSync(path.join(target, 'src/_migrated/assets/external-resources/data.json')),
      true,
    )
    assert.match(
      readFileSync(path.join(target, 'src/loc/en-us.js'), 'utf8'),
      /export default strings/,
    )
    assert.equal(existsSync(path.join(target, 'src/common/formatTitle.ts')), true)
    assert.equal(existsSync(path.join(target, 'src/webparts')), false)
    assert.equal(existsSync(path.join(target, 'external-resources/data.json')), false)
    assert.equal(existsSync(path.join(target, 'MIGRATION.md')), true)
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true })
  }
})

test('parses defaults and refuses unknown options', () => {
  assert.deepEqual(parseArgs(['legacy', 'modern', '--site-url=https://example.com/sites/a']), {
    source: 'legacy',
    target: 'modern',
    siteUrl: 'https://example.com/sites/a',
  })
  assert.throws(() => parseArgs(['legacy', '--force']), /Unknown option/)
})

test('publishes with a registry-resolvable create-sp dependency and CLI bin', () => {
  const migratePackage = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  )
  const createPackage = JSON.parse(
    readFileSync(new URL('../../create-sp/package.json', import.meta.url), 'utf8'),
  )

  assert.equal(migratePackage.dependencies['create-sp'], `^${createPackage.version}`)
  assert.doesNotMatch(migratePackage.dependencies['create-sp'], /^workspace:/)
  assert.equal(migratePackage.bin['migrate-sp'], 'bin/index.mjs')
})
