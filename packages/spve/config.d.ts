export type SpveJsonValue =
  | string
  | number
  | boolean
  | null
  | readonly SpveJsonValue[]
  | { readonly [key: string]: SpveJsonValue }

type SpvePropertyRequirement<TValue> =
  | {
      required: true
      default: TValue
    }
  | {
      required?: false
      default?: TValue
    }

type SpvePropertyBase<TType extends string, TValue> = {
  type: TType
  label?: string
} & SpvePropertyRequirement<TValue>

export interface SpveCustomControl {
  type: 'custom'
  editor: string
  disabled?: boolean
}

interface SpveAccessibleControl {
  ariaLabel?: string
  disabled?: boolean
}

export interface SpveTextControl extends SpveAccessibleControl {
  type: 'text'
  description?: string
  multiline?: boolean
  readOnly?: boolean
  resizable?: boolean
  underlined?: boolean
  placeholder?: string
  rows?: number
  maxLength?: number
  errorMessage?: string
  deferredValidationTime?: number
  validateOnFocusIn?: boolean
  validateOnFocusOut?: boolean
  logName?: {
    moduleName: string
    controlName: string
  }
}

export interface SpveDropdownValueOption<TValue extends string | number> {
  value: TValue
  label?: string
  header?: string
  dividerBefore?: boolean
  dividerAfter?: boolean
}

export type SpveDropdownOption<TValue extends string | number> = SpveDropdownValueOption<TValue>

export interface SpveDropdownControl<TValue extends string | number> extends SpveAccessibleControl {
  type: 'dropdown'
  options: readonly SpveDropdownOption<TValue>[]
  ariaDescription?: string
  ariaPositionInSet?: number
  ariaSetSize?: number
  calloutMaxHeight?: number
}

export interface SpveChoiceOption<TValue extends string | number> {
  value: TValue
  label: string
  icon?: string
  imageSrc?: string
  selectedImageSrc?: string
  imageAlt?: string
  imageSize?: {
    width: number
    height: number
  }
  disabled?: boolean
  ariaLabel?: string
}

export interface SpveChoiceGroupControl<TValue extends string | number> {
  type: 'choiceGroup'
  options: readonly SpveChoiceOption<TValue>[]
}

export interface SpveSliderControl extends SpveAccessibleControl {
  type: 'slider'
  min?: number
  max?: number
  step?: number
  showValue?: boolean
}

export interface SpveToggleControl extends SpveAccessibleControl {
  type: 'toggle'
  onText?: string
  offText?: string
  onAriaLabel?: string
  offAriaLabel?: string
  inlineLabel?: boolean
}

export interface SpveCheckboxControl extends SpveAccessibleControl {
  type: 'checkbox'
}

export type SpveStringProperty = SpvePropertyBase<'string', string> & {
  control?:
    | SpveCustomControl
    | SpveTextControl
    | SpveDropdownControl<string>
    | SpveChoiceGroupControl<string>
}

export type SpveNumberProperty = SpvePropertyBase<'number', number> & {
  control?:
    | SpveCustomControl
    | SpveSliderControl
    | SpveDropdownControl<number>
    | SpveChoiceGroupControl<number>
}

export type SpveBooleanProperty = SpvePropertyBase<'boolean', boolean> & {
  control?: SpveCustomControl | SpveToggleControl | SpveCheckboxControl
}

export type SpveJsonProperty = SpvePropertyBase<'json', SpveJsonValue> & {
  parser?: { module: string; export: string }
  control?: SpveCustomControl
}

export type SpveProperty =
  | SpveStringProperty
  | SpveNumberProperty
  | SpveBooleanProperty
  | SpveJsonProperty

export type SpveSupportedHost =
  | 'SharePointFullPage'
  | 'SharePointWebPart'
  | 'TeamsTab'
  | 'TeamsPersonalApp'
  | 'TeamsMeetingApp'

export interface SpveConfig {
  name: string
  title: string
  description?: string
  version: string
  ids: {
    component: string
    solution: string
    feature: string
  }
  dev: {
    siteUrl: string
    vitePort: number
    spfxPort: number
  }
  webpart: {
    alias: string
    icon?: string
    group?: string
    groupId?: string
    supportedHosts?: readonly SpveSupportedHost[]
    supportsFullBleed?: boolean
    supportsThemeVariants?: boolean
    requiresCustomScript?: boolean
    properties?: Readonly<Record<string, SpveProperty>>
    pane?: {
      reactive?: boolean
      pages?: readonly {
        description?: string
        groups: readonly { name: string; fields: readonly string[] }[]
      }[]
    }
  }
  solution?: {
    includeClientSideAssets?: boolean
    skipFeatureDeployment?: boolean
    permissions?: readonly {
      resource: string
      scope: string
    }[]
  }
}
