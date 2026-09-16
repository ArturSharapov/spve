/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/props-fallback.d.ts" />
const __VLS_props = withDefaults(defineProps(), {
    size: 36,
    showWordmark: true,
});
const __VLS_defaults = {
    size: 36,
    showWordmark: true,
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "inline-flex items-center gap-2.5" },
    'aria-label': "SPVE",
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2.5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    width: (__VLS_ctx.size),
    height: (__VLS_ctx.size),
    viewBox: "0 0 40 40",
    fill: "none",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.defs, __VLS_intrinsics.defs)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.linearGradient, __VLS_intrinsics.linearGradient)({
    id: "spve-mark-gradient",
    x1: "6",
    y1: "4",
    x2: "34",
    y2: "36",
    gradientUnits: "userSpaceOnUse",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    'stop-color': "#06B6D4",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "0.55",
    'stop-color': "#2195ED",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "1",
    'stop-color': "#8E21ED",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M20 2.5 35.2 11.25v17.5L20 37.5 4.8 28.75v-17.5L20 2.5Z",
    fill: "url(#spve-mark-gradient)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "m11.5 22.5 6.2 3.55 10.8-6.18M11.5 16.8l8.5 4.87 8.5-4.87M20 11.55v10.12",
    stroke: "white",
    'stroke-width': "2.2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "20",
    cy: "11.4",
    r: "2.2",
    fill: "white",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "11.5",
    cy: "16.8",
    r: "2.2",
    fill: "white",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "28.5",
    cy: "16.8",
    r: "2.2",
    fill: "white",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "11.5",
    cy: "22.5",
    r: "2.2",
    fill: "white",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "28.5",
    cy: "19.87",
    r: "2.2",
    fill: "white",
});
if (__VLS_ctx.showWordmark) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-display text-[1.05rem] font-extrabold tracking-[-0.045em] text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['font-display']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[1.05rem]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-[-0.045em]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
}
// @ts-ignore
[size, size, showWordmark,];
const __VLS_export = (await import('vue')).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};
