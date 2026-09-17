import { Version } from '@microsoft/sp-core-library'
/* __SPVE_PROPERTY_PANE_IMPORTS__ */
import { BaseClientSideWebPart, type WebPartContext } from '@microsoft/sp-webpart-base'
import { type SPFI, SPFx, spfi } from '@pnp/sp'
import '@pnp/sp/presets/all'
import {
  PropertyPaneFieldType,
  type IPropertyPaneField,
  type IPropertyPaneCustomFieldProps,
} from '@microsoft/sp-property-pane'
import type { SpveApp, SpveInstance, SpveEditorProps } from 'spve'

declare const __SPVE_DEV__: boolean

type Services = { sp: SPFI; context: WebPartContext }
type App = SpveApp<ISpveWebPartProps, Services>
type Instance = SpveInstance<ISpveWebPartProps>
type EditorProps = SpveEditorProps<unknown, ISpveWebPartProps>
type AppModule = { default: App; editors?: Record<string, SpveApp<EditorProps, Services>> }
let modulePromise: Promise<AppModule> | undefined
let sharedSharePoint: SPFI | undefined

function loadModule(): Promise<AppModule> {
  if (modulePromise) return modulePromise

  modulePromise = __SPVE_DEV__
    ? import('./devServer').then((module) => module.loadModule())
    : Promise.all([
        import('../../lib/appcode/index.js'),
        import('../../lib/appcode/index.css'),
      ]).then(([module]) => module as unknown as AppModule)

  return modulePromise
}

export interface ISpveWebPartProps extends Record<string, unknown> {
  /* __SPVE_PROPERTIES_TYPE__ */
}

export default class SpveWebPart extends BaseClientSideWebPart<ISpveWebPartProps> {
  private mountingTimer?: ReturnType<typeof setTimeout>
  private renderVersion = 0
  private app?: Instance
  private sharepoint!: SPFI
  private committedProps?: ISpveWebPartProps

  private propertySnapshot(): ISpveWebPartProps {
    const names: string[] = /* __SPVE_PROPERTY_NAMES__ */ []
    return JSON.parse(
      JSON.stringify(Object.fromEntries(names.map((name) => [name, this.properties[name]]))),
    )
  }

  protected get disableReactivePropertyChanges(): boolean {
    return /* __SPVE_REACTIVE__ */ false
  }

  protected onPropertyPaneConfigurationStart(): void {
    this.committedProps = this.propertySnapshot()
  }

  protected onAfterPropertyPaneChangesApplied(): void {
    this.committedProps = this.propertySnapshot()
  }

  protected onPropertyPaneConfigurationComplete(): void {
    this.committedProps = undefined
  }

  protected onPropertyPaneFieldChanged(): void {
    this.context.propertyPane.refresh()
  }

  private module?: AppModule
  private editors = new Map<HTMLElement, SpveInstance<EditorProps>>()

  protected async loadPropertyPaneResources(): Promise<void> {
    this.module = await loadModule()
  }

  private editorField(
    name: string,
    editor: string,
    disabled: boolean,
  ): IPropertyPaneField<IPropertyPaneCustomFieldProps> {
    return {
      type: PropertyPaneFieldType.Custom,
      targetProperty: name,
      properties: {
        key: name,
        onRender: (element, _context, change) => {
          const app = this.module?.editors?.[editor]
          if (!app) throw new Error(`SPVE: editor ${editor} for property ${name} is not exported`)
          const properties = this.propertySnapshot()
          const props: EditorProps = {
            value: properties[name],
            properties,
            disabled,
            onChange: (value, valid = true) => change?.(name, value, valid),
          }
          const instance = this.editors.get(element)
          if (instance) instance.setProps(props)
          else
            this.editors.set(
              element,
              app.mount({
                element,
                props,
                services: { sp: this.sharepoint, context: this.context },
              }),
            )
        },
        onDispose: (element) => {
          this.editors.get(element)?.unmount()
          this.editors.delete(element)
        },
      },
    }
  }

  protected async onInit(): Promise<void> {
    await super.onInit()
    sharedSharePoint ??= spfi().using(SPFx(this.context))
    this.sharepoint = sharedSharePoint
  }

  public render(): void {
    const version = ++this.renderVersion
    const props =
      this.disableReactivePropertyChanges && this.committedProps
        ? this.committedProps
        : this.propertySnapshot()

    if (this.mountingTimer) clearTimeout(this.mountingTimer)
    this.mountingTimer = setTimeout(async () => {
      if (this.app) {
        this.app.setProps(props)
        return
      }

      const module = await loadModule()
      if (version !== this.renderVersion) return

      const element = document.createElement('div')
      this.domElement.replaceChildren(element)
      const app = module.default.mount({
        element,
        props,
        services: { sp: this.sharepoint, context: this.context },
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
    for (const editor of this.editors.values()) editor.unmount()
    this.editors.clear()
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0')
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [/* __SPVE_PROPERTY_PAGES__ */],
    }
  }
}
