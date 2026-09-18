/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/props-fallback.d.ts" />
const frameworks = [
  { name: 'Vue', mark: 'V', color: '#42b883', body: 'Progressive and approachable.' },
  { name: 'React', mark: '⚛', color: '#61dafb', body: 'Components with Fast Refresh.' },
  { name: 'Svelte', mark: 'S', color: '#ff3e00', body: 'Compiler-first and concise.' },
  { name: 'Solid', mark: 'S', color: '#6ea8dd', body: 'Fine-grained reactivity.' },
  { name: 'Lit', mark: 'L', color: '#7c91ff', body: 'Standards-based web components.' },
  { name: 'Preact', mark: 'P', color: '#a478e8', body: 'Small and React-compatible.' },
  { name: 'Qwik', mark: 'Q', color: '#ac7ef4', body: 'Resumable client rendering.' },
  { name: 'Vanilla', mark: 'TS', color: '#f7df1e', body: 'The platform, fully typed.' },
]
const installLines = [
  { prefix: '$', text: 'npm init sp' },
  { prefix: '◇', text: 'Choose a framework  Vue' },
  { prefix: '◇', text: 'SharePoint site connected' },
  { prefix: '◆', text: 'Your web part is ready.' },
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
  id: 'frameworks',
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
  ...{ class: 'mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4' },
})
/** @type {__VLS_StyleScopedClasses['mt-14']} */ /** @type {__VLS_StyleScopedClasses['grid']} */ /** @type {__VLS_StyleScopedClasses['gap-4']} */ /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ /** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ for (const [
  framework,
] of __VLS_vFor(__VLS_ctx.frameworks)) {
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.article,
    __VLS_intrinsics.article,
  )({
    key: framework.name,
    ...{
      class:
        'framework-card group rounded-xl border border-white/9 p-5 transition-colors duration-300 hover:border-white/18',
    },
  })
  /** @type {__VLS_StyleScopedClasses['framework-card']} */ /** @type {__VLS_StyleScopedClasses['group']} */ /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ /** @type {__VLS_StyleScopedClasses['border']} */ /** @type {__VLS_StyleScopedClasses['border-white/9']} */ /** @type {__VLS_StyleScopedClasses['p-5']} */ /** @type {__VLS_StyleScopedClasses['transition-colors']} */ /** @type {__VLS_StyleScopedClasses['duration-300']} */ /** @type {__VLS_StyleScopedClasses['hover:border-white/18']} */ __VLS_asFunctionalElement1(
    __VLS_intrinsics.div,
    __VLS_intrinsics.div,
  )({
    ...{ class: 'flex items-center gap-4' },
  })
  /** @type {__VLS_StyleScopedClasses['flex']} */ /** @type {__VLS_StyleScopedClasses['items-center']} */ /** @type {__VLS_StyleScopedClasses['gap-4']} */ __VLS_asFunctionalElement1(
    __VLS_intrinsics.span,
    __VLS_intrinsics.span,
  )({
    ...{
      class:
        'grid size-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/20 font-display text-sm font-extrabold',
    },
    ...{ style: { color: framework.color } },
  })
  /** @type {__VLS_StyleScopedClasses['grid']} */ /** @type {__VLS_StyleScopedClasses['size-12']} */ /** @type {__VLS_StyleScopedClasses['shrink-0']} */ /** @type {__VLS_StyleScopedClasses['place-items-center']} */ /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ /** @type {__VLS_StyleScopedClasses['border']} */ /** @type {__VLS_StyleScopedClasses['border-white/10']} */ /** @type {__VLS_StyleScopedClasses['bg-black/20']} */ /** @type {__VLS_StyleScopedClasses['font-display']} */ /** @type {__VLS_StyleScopedClasses['text-sm']} */ /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ framework.mark
  __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({})
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.h3,
    __VLS_intrinsics.h3,
  )({
    ...{ class: 'font-display text-lg font-bold' },
  })
  /** @type {__VLS_StyleScopedClasses['font-display']} */ /** @type {__VLS_StyleScopedClasses['text-lg']} */ /** @type {__VLS_StyleScopedClasses['font-bold']} */ framework.name
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.p,
    __VLS_intrinsics.p,
  )({
    ...{ class: 'mt-1 text-xs text-mist' },
  })
  /** @type {__VLS_StyleScopedClasses['mt-1']} */ /** @type {__VLS_StyleScopedClasses['text-xs']} */ /** @type {__VLS_StyleScopedClasses['text-mist']} */ framework.body
  // @ts-ignore
  ;[frameworks]
}
__VLS_asFunctionalElement1(
  __VLS_intrinsics.div,
  __VLS_intrinsics.div,
)({
  id: 'quickstart',
  ...{
    class:
      'quickstart-panel relative mt-28 overflow-hidden rounded-3xl border border-white/10 bg-panel px-6 py-16 text-center sm:px-12 sm:py-22',
  },
})
/** @type {__VLS_StyleScopedClasses['quickstart-panel']} */ /** @type {__VLS_StyleScopedClasses['relative']} */ /** @type {__VLS_StyleScopedClasses['mt-28']} */ /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ /** @type {__VLS_StyleScopedClasses['border']} */ /** @type {__VLS_StyleScopedClasses['border-white/10']} */ /** @type {__VLS_StyleScopedClasses['bg-panel']} */ /** @type {__VLS_StyleScopedClasses['px-6']} */ /** @type {__VLS_StyleScopedClasses['py-16']} */ /** @type {__VLS_StyleScopedClasses['text-center']} */ /** @type {__VLS_StyleScopedClasses['sm:px-12']} */ /** @type {__VLS_StyleScopedClasses['sm:py-22']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.div,
)({
  ...{
    class:
      'absolute inset-0 [background:radial-gradient(circle_at_50%_0%,rgba(33,149,237,.20),transparent_44%)]',
  },
})
/** @type {__VLS_StyleScopedClasses['absolute']} */ /** @type {__VLS_StyleScopedClasses['inset-0']} */ /** @type {__VLS_StyleScopedClasses['[background:radial-gradient(circle_at_50%_0%,rgba(33,149,237,.20),transparent_44%)]']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.div,
)({
  ...{ class: 'hero-grid absolute inset-0 opacity-25' },
})
/** @type {__VLS_StyleScopedClasses['hero-grid']} */ /** @type {__VLS_StyleScopedClasses['absolute']} */ /** @type {__VLS_StyleScopedClasses['inset-0']} */ /** @type {__VLS_StyleScopedClasses['opacity-25']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.div,
  __VLS_intrinsics.div,
)({
  ...{ class: 'relative' },
})
/** @type {__VLS_StyleScopedClasses['relative']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.h2,
  __VLS_intrinsics.h2,
)({
  ...{ class: 'font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl' },
})
/** @type {__VLS_StyleScopedClasses['font-display']} */ /** @type {__VLS_StyleScopedClasses['text-4xl']} */ /** @type {__VLS_StyleScopedClasses['font-bold']} */ /** @type {__VLS_StyleScopedClasses['tracking-[-0.045em]']} */ /** @type {__VLS_StyleScopedClasses['sm:text-5xl']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.p,
  __VLS_intrinsics.p,
)({
  ...{ class: 'mx-auto mt-5 max-w-2xl text-base leading-7 text-mist sm:text-lg' },
})
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ /** @type {__VLS_StyleScopedClasses['mt-5']} */ /** @type {__VLS_StyleScopedClasses['max-w-2xl']} */ /** @type {__VLS_StyleScopedClasses['text-base']} */ /** @type {__VLS_StyleScopedClasses['leading-7']} */ /** @type {__VLS_StyleScopedClasses['text-mist']} */ /** @type {__VLS_StyleScopedClasses['sm:text-lg']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.div,
  __VLS_intrinsics.div,
)({
  ...{
    class:
      'mx-auto mt-9 max-w-xl overflow-hidden rounded-xl border border-white/10 bg-[#061018] text-left shadow-2xl',
  },
})
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ /** @type {__VLS_StyleScopedClasses['mt-9']} */ /** @type {__VLS_StyleScopedClasses['max-w-xl']} */ /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ /** @type {__VLS_StyleScopedClasses['border']} */ /** @type {__VLS_StyleScopedClasses['border-white/10']} */ /** @type {__VLS_StyleScopedClasses['bg-[#061018]']} */ /** @type {__VLS_StyleScopedClasses['text-left']} */ /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.div,
  __VLS_intrinsics.div,
)({
  ...{ class: 'flex items-center gap-2 border-b border-white/8 px-4 py-3' },
})
/** @type {__VLS_StyleScopedClasses['flex']} */ /** @type {__VLS_StyleScopedClasses['items-center']} */ /** @type {__VLS_StyleScopedClasses['gap-2']} */ /** @type {__VLS_StyleScopedClasses['border-b']} */ /** @type {__VLS_StyleScopedClasses['border-white/8']} */ /** @type {__VLS_StyleScopedClasses['px-4']} */ /** @type {__VLS_StyleScopedClasses['py-3']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.span,
)({
  ...{ class: 'size-2 rounded-full bg-[#ff6b6b]' },
})
/** @type {__VLS_StyleScopedClasses['size-2']} */ /** @type {__VLS_StyleScopedClasses['rounded-full']} */ /** @type {__VLS_StyleScopedClasses['bg-[#ff6b6b]']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.span,
)({
  ...{ class: 'size-2 rounded-full bg-[#ffd166]' },
})
/** @type {__VLS_StyleScopedClasses['size-2']} */ /** @type {__VLS_StyleScopedClasses['rounded-full']} */ /** @type {__VLS_StyleScopedClasses['bg-[#ffd166]']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.span,
)({
  ...{ class: 'size-2 rounded-full bg-[#42d392]' },
})
/** @type {__VLS_StyleScopedClasses['size-2']} */ /** @type {__VLS_StyleScopedClasses['rounded-full']} */ /** @type {__VLS_StyleScopedClasses['bg-[#42d392]']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.span,
  __VLS_intrinsics.span,
)({
  ...{ class: 'ml-2 font-mono text-[0.62rem] text-mist/55' },
})
/** @type {__VLS_StyleScopedClasses['ml-2']} */ /** @type {__VLS_StyleScopedClasses['font-mono']} */ /** @type {__VLS_StyleScopedClasses['text-[0.62rem]']} */ /** @type {__VLS_StyleScopedClasses['text-mist/55']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.div,
  __VLS_intrinsics.div,
)({
  ...{ class: 'space-y-1 p-4 font-mono text-[0.7rem] leading-6 sm:p-5 sm:text-xs' },
})
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ /** @type {__VLS_StyleScopedClasses['p-4']} */ /** @type {__VLS_StyleScopedClasses['font-mono']} */ /** @type {__VLS_StyleScopedClasses['text-[0.7rem]']} */ /** @type {__VLS_StyleScopedClasses['leading-6']} */ /** @type {__VLS_StyleScopedClasses['sm:p-5']} */ /** @type {__VLS_StyleScopedClasses['sm:text-xs']} */ for (const [
  line,
  index,
] of __VLS_vFor(__VLS_ctx.installLines)) {
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.div,
    __VLS_intrinsics.div,
  )({
    key: line.text,
    ...{ class: index === 3 ? 'pt-2 text-white' : 'text-mist' },
  })
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.span,
    __VLS_intrinsics.span,
  )({
    ...{
      class: index === 0 ? 'text-sp-cyan' : index === 3 ? 'text-[#42d392]' : 'text-vite-bright',
    },
  })
  line.prefix
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.span,
    __VLS_intrinsics.span,
  )({
    ...{ class: 'ml-3' },
  })
  /** @type {__VLS_StyleScopedClasses['ml-3']} */ line.text
  // @ts-ignore
  ;[installLines]
}
// @ts-ignore
;[]
const __VLS_export = (await import('vue')).defineComponent({})
export default {}
