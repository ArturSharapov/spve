import { Version } from '@microsoft/sp-core-library'
/* __SPVE_PROPERTY_PANE_IMPORTS__ */
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base'
import { type SPFI, SPFx, spfi } from '@pnp/sp'
import '@pnp/sp/presets/all'
import type { SpveInstance, SpveModule } from 'spve'

declare const __SPVE_DEV__: boolean

type Services = { sp: SPFI }
type App = SpveInstance<ISpveWebPartProps>
type Module = SpveModule<ISpveWebPartProps, Services>
let modulePromise: Promise<Module> | undefined
let sharedSharePoint: SPFI | undefined

function loadModule(): Promise<Module> {
  if (modulePromise) return modulePromise

  modulePromise = __SPVE_DEV__
    ? import('./devServer').then((module) => module.loadModule())
    : Promise.all([
        import('../../lib/appcode/index.js'),
        import('../../lib/appcode/index.css'),
      ]).then(([module]) => module.default as Module)

  return modulePromise
}

export interface ISpveWebPartProps extends Record<string, unknown> {
  /* __SPVE_PROPERTIES_TYPE__ */
}

export default class SpveWebPart extends BaseClientSideWebPart<ISpveWebPartProps> {
  private mountingTimer?: ReturnType<typeof setTimeout>
  private renderVersion = 0
  private app?: App
  private sharepoint!: SPFI

  protected async onInit(): Promise<void> {
    await super.onInit()
    sharedSharePoint ??= spfi().using(SPFx(this.context))
    this.sharepoint = sharedSharePoint
  }

  public render(): void {
    const version = ++this.renderVersion

    if (this.mountingTimer) clearTimeout(this.mountingTimer)
    this.mountingTimer = setTimeout(async () => {
      if (this.app) {
        this.app.setProps(this.properties)
        return
      }

      const module = await loadModule()
      if (version !== this.renderVersion) return

      const element = document.createElement('div')
      this.domElement.replaceChildren(element)
      const app = module.mount({
        element,
        props: this.properties,
        services: { sp: this.sharepoint },
      })
      if (version !== this.renderVersion) {
        app.unmount()
        return
      }
      this.app = app
    }, 100)
  }

  protected onDispose(): void {
    ++this.renderVersion
    if (this.mountingTimer) clearTimeout(this.mountingTimer)
    this.app?.unmount()
    this.app = undefined
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0')
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Web part settings' },
          groups: [
            {
              groupName: 'Web part properties',
              groupFields: [/* __SPVE_PROPERTY_FIELDS__ */],
            },
          ],
        },
      ],
    }
  }
}
