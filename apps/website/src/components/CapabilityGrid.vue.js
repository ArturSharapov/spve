/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/props-fallback.d.ts" />
const capabilities = [
  {
    title: 'Typed App Properties',
    body: 'Generate strongly typed props directly from your SPVE configuration.',
    icon: '<>',
  },
  {
    title: 'Property Pane',
    body: 'Create standard SPFx property controls without duplicate definitions.',
    icon: '▤',
  },
  {
    title: 'Framework Adapters',
    body: 'Mount applications through first-class adapters for modern UI frameworks.',
    icon: '◇',
  },
  {
    title: 'SharePoint Context',
    body: 'Use native WebPartContext when your application needs platform access.',
    icon: 'SP',
  },
  {
    title: 'Authenticated Clients',
    body: 'Work with SharePoint and Microsoft APIs in standalone development.',
    icon: '↗',
  },
  {
    title: 'Hosted Workbench',
    body: 'Preview the real web part on the SharePoint site you already use.',
    icon: '▣',
  },
  {
    title: 'Shared Toolchain',
    body: 'Install the heavy SPFx dependencies once and safely reuse them.',
    icon: '∞',
  },
  {
    title: 'Dev Certificates',
    body: 'Reuse the trusted SPFx certificate for the entire development loop.',
    icon: '⌁',
  },
  {
    title: 'Production Packages',
    body: 'Build the application and emit a deployable SharePoint package.',
    icon: '▧',
  },
  {
    title: 'Generated Manifests',
    body: 'Keep SharePoint metadata synchronized with your project config.',
    icon: '{}',
  },
  {
    title: 'Fast Refresh',
    body: 'Preserve framework state while React and compatible adapters update.',
    icon: '↯',
  },
  {
    title: 'Disposable State',
    body: 'Regenerate hidden SPFx output whenever the source configuration changes.',
    icon: '⟳',
  },
]
const __VLS_ctx = {
  ...{},
  ...{},
}
let __VLS_components
let __VLS_intrinsics
let __VLS_directives
__VLS_asFunctionalElement1(
  __VLS_intrinsics.section,
  __VLS_intrinsics.section,
)({
  id: 'features',
  ...{ class: 'relative py-20' },
})
/** @type {__VLS_StyleScopedClasses['relative']} */ /** @type {__VLS_StyleScopedClasses['py-20']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.div,
  __VLS_intrinsics.div,
)({
  ...{ class: 'wide-shell' },
})
/** @type {__VLS_StyleScopedClasses['wide-shell']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.div,
  __VLS_intrinsics.div,
)({
  ...{ class: 'mx-auto max-w-4xl text-center' },
})
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ /** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ /** @type {__VLS_StyleScopedClasses['text-center']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.h2,
  __VLS_intrinsics.h2,
)({
  ...{ class: 'font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl' },
})
/** @type {__VLS_StyleScopedClasses['font-display']} */ /** @type {__VLS_StyleScopedClasses['text-4xl']} */ /** @type {__VLS_StyleScopedClasses['font-bold']} */ /** @type {__VLS_StyleScopedClasses['tracking-[-0.045em]']} */ /** @type {__VLS_StyleScopedClasses['sm:text-5xl']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.p,
  __VLS_intrinsics.p,
)({
  ...{ class: 'mx-auto mt-2 max-w-3xl text-lg leading-[1.7] text-white/65 sm:text-2xl' },
})
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ /** @type {__VLS_StyleScopedClasses['mt-2']} */ /** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ /** @type {__VLS_StyleScopedClasses['text-lg']} */ /** @type {__VLS_StyleScopedClasses['leading-[1.7]']} */ /** @type {__VLS_StyleScopedClasses['text-white/65']} */ /** @type {__VLS_StyleScopedClasses['sm:text-2xl']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.div,
  __VLS_intrinsics.div,
)({
  ...{ class: 'mt-20 grid gap-x-9 gap-y-11 sm:grid-cols-2 lg:grid-cols-4' },
})
/** @type {__VLS_StyleScopedClasses['mt-20']} */ /** @type {__VLS_StyleScopedClasses['grid']} */ /** @type {__VLS_StyleScopedClasses['gap-x-9']} */ /** @type {__VLS_StyleScopedClasses['gap-y-11']} */ /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ /** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ for (const [
  capability,
] of __VLS_vFor(__VLS_ctx.capabilities)) {
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.article,
    __VLS_intrinsics.article,
  )({
    key: capability.title,
  })
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.div,
    __VLS_intrinsics.div,
  )({
    ...{ class: 'flex items-center gap-3' },
  })
  /** @type {__VLS_StyleScopedClasses['flex']} */ /** @type {__VLS_StyleScopedClasses['items-center']} */ /** @type {__VLS_StyleScopedClasses['gap-3']} */ __VLS_asFunctionalElement1(
    __VLS_intrinsics.span,
    __VLS_intrinsics.span,
  )({
    ...{ class: 'grid size-8 shrink-0 place-items-center font-mono text-sm font-bold text-white' },
    'aria-hidden': 'true',
  })
  /** @type {__VLS_StyleScopedClasses['grid']} */ /** @type {__VLS_StyleScopedClasses['size-8']} */ /** @type {__VLS_StyleScopedClasses['shrink-0']} */ /** @type {__VLS_StyleScopedClasses['place-items-center']} */ /** @type {__VLS_StyleScopedClasses['font-mono']} */ /** @type {__VLS_StyleScopedClasses['text-sm']} */ /** @type {__VLS_StyleScopedClasses['font-bold']} */ /** @type {__VLS_StyleScopedClasses['text-white']} */ capability.icon
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.h3,
    __VLS_intrinsics.h3,
  )({
    ...{ class: 'font-display text-lg font-bold tracking-[-0.025em]' },
  })
  /** @type {__VLS_StyleScopedClasses['font-display']} */ /** @type {__VLS_StyleScopedClasses['text-lg']} */ /** @type {__VLS_StyleScopedClasses['font-bold']} */ /** @type {__VLS_StyleScopedClasses['tracking-[-0.025em]']} */ capability.title
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.p,
    __VLS_intrinsics.p,
  )({
    ...{ class: 'mt-3 pl-11 text-sm leading-6 text-mist' },
  })
  /** @type {__VLS_StyleScopedClasses['mt-3']} */ /** @type {__VLS_StyleScopedClasses['pl-11']} */ /** @type {__VLS_StyleScopedClasses['text-sm']} */ /** @type {__VLS_StyleScopedClasses['leading-6']} */ /** @type {__VLS_StyleScopedClasses['text-mist']} */ capability.body
  // @ts-ignore
  ;[capabilities]
}
// @ts-ignore
;[]
const __VLS_export = (await import('vue')).defineComponent({})
export default {}
