/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useId } from 'vue'
const __VLS_props = defineProps()
const gradientId = `feature-gradient-${useId().replaceAll(':', '')}`
const __VLS_ctx = {
  ...{},
  ...{},
  ...{},
  ...{},
}
let __VLS_components
let __VLS_intrinsics
let __VLS_directives
__VLS_asFunctionalElement1(
  __VLS_intrinsics.svg,
  __VLS_intrinsics.svg,
)({
  ...{ class: 'feature-artwork overflow-visible' },
  viewBox: '0 0 180 110',
  fill: 'none',
  'aria-hidden': 'true',
})
/** @type {__VLS_StyleScopedClasses['feature-artwork']} */ /** @type {__VLS_StyleScopedClasses['overflow-visible']} */ __VLS_asFunctionalElement1(
  __VLS_intrinsics.defs,
  __VLS_intrinsics.defs,
)({})
__VLS_asFunctionalElement1(
  __VLS_intrinsics.linearGradient,
  __VLS_intrinsics.linearGradient,
)({
  id: __VLS_ctx.gradientId,
  x1: '34',
  y1: '22',
  x2: '145',
  y2: '91',
})
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
  'stop-color': '#06b6d4',
})
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
  offset: '0.5',
  'stop-color': '#2195ed',
})
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
  offset: '1',
  'stop-color': '#9b34ef',
})
if (__VLS_ctx.type === 'speed') {
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.g,
    __VLS_intrinsics.g,
  )({
    stroke: `url(#${__VLS_ctx.gradientId})`,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: 'M42 81a49 49 0 0 1 96 0',
    'stroke-width': '7',
    'stroke-dasharray': '5 8',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: 'M51 82h78',
    'stroke-width': '3',
    opacity: '.5',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: 'm90 78 27-24',
    'stroke-width': '4',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: '90',
    cy: '78',
    r: '6',
    'stroke-width': '3',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: 'M90 28v8M58 42l6 7M122 42l-6 7',
    'stroke-width': '3',
  })
} else if (__VLS_ctx.type === 'framework') {
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.g,
    __VLS_intrinsics.g,
  )({
    stroke: `url(#${__VLS_ctx.gradientId})`,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: 'M72 57 85 70l28-31',
    'stroke-width': '7',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: 'M90 17v10M90 85v10M50 56H40M140 56h-10M62 28l7 8M118 28l-7 8M62 84l7-8M118 84l-7-8',
    'stroke-width': '2.5',
    opacity: '.72',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: '90',
    cy: '56',
    r: '43',
    'stroke-width': '1.5',
    'stroke-dasharray': '1 8',
    opacity: '.38',
  })
} else if (__VLS_ctx.type === 'config') {
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.g,
    __VLS_intrinsics.g,
  )({
    stroke: `url(#${__VLS_ctx.gradientId})`,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: 'M46 27h88v58H46z',
    'stroke-width': '3',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: 'M46 42h88',
    'stroke-width': '2',
    opacity: '.55',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: '57',
    cy: '34.5',
    r: '2',
    fill: '#06b6d4',
    stroke: 'none',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: '65',
    cy: '34.5',
    r: '2',
    fill: '#2195ed',
    stroke: 'none',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: 'm76 59-10 8 10 8M104 59l10 8-10 8M95 54 85 80',
    'stroke-width': '3.5',
  })
} else {
  __VLS_asFunctionalElement1(
    __VLS_intrinsics.g,
    __VLS_intrinsics.g,
  )({
    stroke: `url(#${__VLS_ctx.gradientId})`,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: 'M43 34h42v42H43zM95 34h42v42H95z',
    'stroke-width': '3',
    opacity: '.55',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: 'M68 55h44M102 45l10 10-10 10',
    'stroke-width': '5',
  })
  __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: 'M35 27v15M35 27h15M145 83V68M145 83h-15',
    'stroke-width': '2.5',
    opacity: '.75',
  })
}
// @ts-ignore
;[gradientId, gradientId, gradientId, gradientId, gradientId, type, type, type]
const __VLS_export = (await import('vue')).defineComponent({
  __typeProps: {},
})
export default {}
