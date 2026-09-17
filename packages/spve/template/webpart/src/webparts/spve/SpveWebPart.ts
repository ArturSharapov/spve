import type { IReadonlyTheme } from '@microsoft/sp-component-base'
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
import type { SpveApp, SpveInstance, SpveEditorProps, SpveHostState } from 'spve'

declare const __SPVE_DEV__: boolean

type Services = { sp: SPFI; context: WebPartContext; host: SpveHostState }
type App = SpveApp<ISpveWebPartProps, Services>
type Instance = SpveInstance<ISpveWebPartProps, Services>
type EditorProps = SpveEditorProps<unknown, ISpveWebPartProps>
type AppModule = {
  parseProperties?(props: ISpveWebPartProps): ISpveWebPartProps
  parseProperty?(name: string, value: unknown): unknown
  default: App
  editors?: Record<string, SpveApp<EditorProps, Services>>
}
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
  private label(value: Record<string, string>): string {
    const culture = this.context.pageContext.cultureInfo.currentUICultureName.toLowerCase()
    const values: Record<string, string> = Object.create(null)
    for (const key of Object.keys(value)) values[key.toLowerCase()] = value[key]
    return values[culture] ?? values[culture.split('-')[0]] ?? value.default
  }

  private theme?: SpveHostState['theme']

  protected onThemeChanged(theme: IReadonlyTheme | undefined): void {
    this.theme = theme
      ? {
          isInverted: theme.isInverted,
          palette: { ...theme.palette },
          semanticColors: { ...theme.semanticColors },
        }
      : undefined
  }

  private appServices(): Services {
    const culture = this.context.pageContext.cultureInfo
    return {
      sp: this.sharepoint,
      context: this.context,
      host: {
        theme: this.theme,
        displayMode: this.displayMode === 2 ? 'edit' : 'read',
        locale: culture.currentUICultureName,
        direction: culture.isRightToLeft ? 'rtl' : 'ltr',
      },
    }
  }

  private committedProps?: ISpveWebPartProps

  private propertySnapshot(): ISpveWebPartProps {
    const names: string[] = /* __SPVE_PROPERTY_NAMES__ */ []
    const properties: Record<string, unknown> = Object.create(null)
    for (const name of names) properties[name] = this.properties[name]
    return JSON.parse(JSON.stringify(properties))
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
  private editors = new Map<HTMLElement, SpveInstance<EditorProps, Services>>()

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
            onChange: (value, valid = true) => {
              try {
                const parsed =
                  valid && this.module?.parseProperty
                    ? this.module.parseProperty(name, value)
                    : value
                change?.(name, parsed, valid)
              } catch (error) {
                change?.(name, this.properties[name], false)
                throw error
              }
            },
          }
          const instance = this.editors.get(element)
          if (instance?.update) instance.update(props, this.appServices())
          else if (instance) instance.setProps(props)
          else
            this.editors.set(
              element,
              app.mount({
                element,
                props,
                services: this.appServices(),
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
        const next = this.module?.parseProperties?.(props) ?? props
        if (this.app.update) this.app.update(next, this.appServices())
        else this.app.setProps(next)
        return
      }

      const module = await loadModule()
      this.module = module
      if (version !== this.renderVersion) return

      const element = document.createElement('div')
      this.domElement.replaceChildren(element)
      const app = module.default.mount({
        element,
        props: module.parseProperties?.(props) ?? props,
        services: this.appServices(),
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
    this.editors.forEach((editor) => editor.unmount())
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
