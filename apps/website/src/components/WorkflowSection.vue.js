/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/props-fallback.d.ts" />
const comparisons = [
    {
        name: 'SPVE',
        accent: 'spve',
        metrics: [
            { value: 'direct', label: 'server', width: '18%' },
            { value: 'module', label: 'update', width: '9%' },
            { value: 'preserved', label: 'state', width: '13%' },
        ],
    },
    {
        name: 'Traditional SPFx',
        accent: 'classic',
        metrics: [
            { value: 'full', label: 'startup', width: '76%' },
            { value: 'bundle', label: 'rebuild', width: '91%' },
            { value: 'page', label: 'refresh', width: '68%' },
        ],
    },
];
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    id: "workflow",
    ...{ class: "relative min-h-[788px] py-20" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-[788px]']} */ ;
/** @type {__VLS_StyleScopedClasses['py-20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wide-shell" },
});
/** @type {__VLS_StyleScopedClasses['wide-shell']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mx-auto max-w-4xl text-center" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "font-display text-4xl font-bold leading-[1.7] tracking-[-0.045em] sm:text-5xl" },
});
/** @type {__VLS_StyleScopedClasses['font-display']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-[1.7]']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-[-0.045em]']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-5xl']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mx-auto mt-2 max-w-3xl text-lg leading-[1.7] text-white/65 sm:text-2xl" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-[1.7]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white/65']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-2xl']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mx-auto mt-24 max-w-[1080px] space-y-10" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-24']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[1080px]']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-10']} */ ;
for (const [comparison] of __VLS_vFor((__VLS_ctx.comparisons))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (comparison.name),
        ...{ class: "grid gap-4 sm:grid-cols-[170px_1fr] sm:items-center sm:gap-0" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:grid-cols-[170px_1fr]']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:gap-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "px-0 font-display text-[17px] font-bold leading-[1.7] sm:px-0" },
    });
    /** @type {__VLS_StyleScopedClasses['px-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-display']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[17px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['leading-[1.7]']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:px-0']} */ ;
    (comparison.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    for (const [metric] of __VLS_vFor((comparison.metrics))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (metric.label),
            ...{ class: "grid h-[18px] grid-cols-[minmax(0,1fr)_100px] items-center" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-[18px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-[minmax(0,1fr)_100px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "speed-track h-1.5 overflow-hidden rounded-full" },
        });
        /** @type {__VLS_StyleScopedClasses['speed-track']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
            ...{ class: "h-full rounded-full" },
            ...{ class: (comparison.accent === 'spve' ? 'speed-bar-spve' : 'speed-bar-classic') },
            ...{ style: ({ width: metric.width }) },
        });
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "whitespace-nowrap font-mono text-xs leading-[1.7] text-white/60" },
        });
        /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-[1.7]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white/60']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (metric.value);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "ml-2 text-white/35" },
        });
        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white/35']} */ ;
        (metric.label);
        // @ts-ignore
        [comparisons,];
    }
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mx-auto mt-13 max-w-3xl text-center text-xs leading-5 text-white/35" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-13']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white/35']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "#features",
    ...{ class: "mx-auto mt-7 flex w-fit items-center gap-2 rounded-full border border-sp-blue/60 px-6 py-3 text-sm font-bold text-white transition hover:border-sp-cyan hover:bg-sp-cyan/[0.06]" },
});
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-7']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-fit']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-sp-blue/60']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-sp-cyan']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-sp-cyan/[0.06]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    'aria-hidden': "true",
});
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
