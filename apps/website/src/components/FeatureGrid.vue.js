/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { onBeforeUnmount, onMounted, ref } from 'vue';
const comparisonSection = ref(null);
let revealObserver = null;
const spveLoop = [
    { eyebrow: '01', value: 'direct', label: 'server' },
    { eyebrow: '02', value: 'module', label: 'update' },
    { eyebrow: '03', value: 'preserved', label: 'state' },
];
const classicLoop = [
    { eyebrow: '01', value: 'full', label: 'startup' },
    { eyebrow: '02', value: 'bundle', label: 'rebuild' },
    { eyebrow: '03', value: 'page', label: 'refresh' },
];
const frameworks = [
    { name: 'React 19.2.8', icon: 'react.svg', position: 'framework-node-react' },
    { name: 'Vue', icon: 'vue.svg', position: 'framework-node-vue' },
    { name: 'Preact', icon: 'preact.svg', position: 'framework-node-preact' },
    { name: 'Lit', icon: 'lit.svg', position: 'framework-node-lit' },
    { name: 'Svelte', icon: 'svelte.svg', position: 'framework-node-svelte' },
    { name: 'Solid', icon: 'solid.svg', position: 'framework-node-solid' },
    { name: 'Qwik', icon: 'qwik.svg', position: 'framework-node-qwik' },
];
const spveFiles = [
    { name: 'src', type: 'folder', indent: 0 },
    { name: 'App.tsx', type: 'tsx', indent: 1 },
    { name: 'main.ts', type: 'ts', indent: 1 },
    { name: 'spve.config.ts', type: 'config', indent: 0 },
];
const classicFiles = [
    { name: 'config', type: 'folder', indent: 0 },
    { name: 'package-solution.json', type: 'json', indent: 1 },
    { name: 'serve.json', type: 'json', indent: 1 },
    { name: 'src/webparts', type: 'folder', indent: 0 },
    { name: 'loc', type: 'folder', indent: 1 },
    { name: 'manifest.json', type: 'json', indent: 1 },
    { name: 'gulpfile.js', type: 'js', indent: 0 },
    { name: 'tsconfig.json', type: 'json', indent: 0 },
];
onMounted(() => {
    const section = comparisonSection.value;
    if (!section)
        return;
    const items = section.querySelectorAll('[data-showcase-reveal]');
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        items.forEach((item) => item.classList.add('is-visible'));
        return;
    }
    section.classList.add('showcase-reveal-ready');
    revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting)
                return;
            entry.target.classList.add('is-visible');
            revealObserver?.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((item) => revealObserver?.observe(item));
});
onBeforeUnmount(() => revealObserver?.disconnect());
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    id: "why-spve",
    ref: "comparisonSection",
    ...{ class: "experience-section relative py-28" },
});
/** @type {__VLS_StyleScopedClasses['experience-section']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['py-28']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wide-shell" },
});
/** @type {__VLS_StyleScopedClasses['wide-shell']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "experience-intro" },
    'data-showcase-reveal': true,
});
/** @type {__VLS_StyleScopedClasses['experience-intro']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "experience-kicker" },
});
/** @type {__VLS_StyleScopedClasses['experience-kicker']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "experience-stack" },
});
/** @type {__VLS_StyleScopedClasses['experience-stack']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
    id: "workflow",
    ...{ class: "showcase-block showcase-startup" },
    'data-showcase-reveal': true,
});
/** @type {__VLS_StyleScopedClasses['showcase-block']} */ ;
/** @type {__VLS_StyleScopedClasses['showcase-startup']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "showcase-copy" },
});
/** @type {__VLS_StyleScopedClasses['showcase-copy']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "showcase-number" },
});
/** @type {__VLS_StyleScopedClasses['showcase-number']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "loop-canvas" },
    'aria-label': "SPVE and Classic SPFx development-loop comparison",
});
/** @type {__VLS_StyleScopedClasses['loop-canvas']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "loop-toolbar" },
});
/** @type {__VLS_StyleScopedClasses['loop-toolbar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "window-dots" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['window-dots']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "loop-live" },
});
/** @type {__VLS_StyleScopedClasses['loop-live']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    ...{ class: "loop-signal-map" },
    viewBox: "0 0 920 332",
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['loop-signal-map']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.defs, __VLS_intrinsics.defs)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.linearGradient, __VLS_intrinsics.linearGradient)({
    id: "signal-spve",
    x1: "130",
    y1: "0",
    x2: "790",
    y2: "0",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    'stop-color': "#13D8D1",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: ".52",
    'stop-color': "#2C91FF",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "1",
    'stop-color': "#9E4DFF",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.filter, __VLS_intrinsics.filter)({
    id: "signal-glow",
    x: "-20%",
    y: "-100%",
    width: "140%",
    height: "300%",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.feGaussianBlur)({
    stdDeviation: "5",
    result: "blur",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.feMerge, __VLS_intrinsics.feMerge)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.feMergeNode)({
    in: "blur",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.feMergeNode)({
    in: "SourceGraphic",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    ...{ class: "signal-grid" },
    d: "M130 78H790M130 114H790M130 218H790M130 254H790",
});
/** @type {__VLS_StyleScopedClasses['signal-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    ...{ class: "signal-path signal-path-fast" },
    d: "M130 96C230 96 218 82 304 82S391 110 466 96 566 90 626 96 718 96 790 96",
});
/** @type {__VLS_StyleScopedClasses['signal-path']} */ ;
/** @type {__VLS_StyleScopedClasses['signal-path-fast']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    ...{ class: "signal-path signal-path-slow" },
    d: "M130 236H270C300 236 300 202 330 202H460C490 202 490 266 520 266H650C680 266 680 236 710 236H790",
});
/** @type {__VLS_StyleScopedClasses['signal-path']} */ ;
/** @type {__VLS_StyleScopedClasses['signal-path-slow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    ...{ class: "signal-packet signal-packet-one" },
    cx: "0",
    cy: "0",
    r: "4",
});
/** @type {__VLS_StyleScopedClasses['signal-packet']} */ ;
/** @type {__VLS_StyleScopedClasses['signal-packet-one']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    ...{ class: "signal-packet signal-packet-two" },
    cx: "0",
    cy: "0",
    r: "3",
});
/** @type {__VLS_StyleScopedClasses['signal-packet']} */ ;
/** @type {__VLS_StyleScopedClasses['signal-packet-two']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "loop-lane loop-lane-spve" },
});
/** @type {__VLS_StyleScopedClasses['loop-lane']} */ ;
/** @type {__VLS_StyleScopedClasses['loop-lane-spve']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "loop-lane-label" },
});
/** @type {__VLS_StyleScopedClasses['loop-lane-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "loop-path loop-path-spve" },
});
/** @type {__VLS_StyleScopedClasses['loop-path']} */ ;
/** @type {__VLS_StyleScopedClasses['loop-path-spve']} */ ;
for (const [step] of __VLS_vFor((__VLS_ctx.spveLoop))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (step.label),
        ...{ class: "loop-step" },
    });
    /** @type {__VLS_StyleScopedClasses['loop-step']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (step.eyebrow);
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (step.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
    (step.label);
    // @ts-ignore
    [spveLoop,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.span)({
    ...{ class: "loop-pulse" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['loop-pulse']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "loop-result loop-result-spve" },
});
/** @type {__VLS_StyleScopedClasses['loop-result']} */ ;
/** @type {__VLS_StyleScopedClasses['loop-result-spve']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "result-ring" },
});
/** @type {__VLS_StyleScopedClasses['result-ring']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "loop-lane loop-lane-classic" },
});
/** @type {__VLS_StyleScopedClasses['loop-lane']} */ ;
/** @type {__VLS_StyleScopedClasses['loop-lane-classic']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "loop-lane-label" },
});
/** @type {__VLS_StyleScopedClasses['loop-lane-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "loop-path loop-path-classic" },
});
/** @type {__VLS_StyleScopedClasses['loop-path']} */ ;
/** @type {__VLS_StyleScopedClasses['loop-path-classic']} */ ;
for (const [step] of __VLS_vFor((__VLS_ctx.classicLoop))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (step.label),
        ...{ class: "loop-step" },
    });
    /** @type {__VLS_StyleScopedClasses['loop-step']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (step.eyebrow);
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (step.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
    (step.label);
    // @ts-ignore
    [classicLoop,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "loop-result loop-result-classic" },
});
/** @type {__VLS_StyleScopedClasses['loop-result']} */ ;
/** @type {__VLS_StyleScopedClasses['loop-result-classic']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "result-ring" },
});
/** @type {__VLS_StyleScopedClasses['result-ring']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "loop-footnote" },
});
/** @type {__VLS_StyleScopedClasses['loop-footnote']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "comparison-notes comparison-notes-startup" },
});
/** @type {__VLS_StyleScopedClasses['comparison-notes']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-notes-startup']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({
    ...{ class: "positive" },
});
/** @type {__VLS_StyleScopedClasses['positive']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({
    ...{ class: "negative" },
});
/** @type {__VLS_StyleScopedClasses['negative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({
    ...{ class: "positive" },
});
/** @type {__VLS_StyleScopedClasses['positive']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({
    ...{ class: "negative" },
});
/** @type {__VLS_StyleScopedClasses['negative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
    id: "frameworks",
    ...{ class: "showcase-block showcase-frameworks" },
    'data-showcase-reveal': true,
});
/** @type {__VLS_StyleScopedClasses['showcase-block']} */ ;
/** @type {__VLS_StyleScopedClasses['showcase-frameworks']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "framework-visual" },
});
/** @type {__VLS_StyleScopedClasses['framework-visual']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "constellation constellation-spve" },
    'aria-label': "SPVE supported frameworks",
});
/** @type {__VLS_StyleScopedClasses['constellation']} */ ;
/** @type {__VLS_StyleScopedClasses['constellation-spve']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    viewBox: "0 0 620 430",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M310 214 115 92M310 214 117 328M310 214 235 60M310 214 389 60M310 214 508 110M310 214 492 322M310 214 262 370",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "310",
    cy: "214",
    r: "112",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "310",
    cy: "214",
    r: "178",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "framework-core" },
});
/** @type {__VLS_StyleScopedClasses['framework-core']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
for (const [framework] of __VLS_vFor((__VLS_ctx.frameworks))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (framework.name),
        ...{ class: "framework-node" },
        ...{ class: (framework.position) },
    });
    /** @type {__VLS_StyleScopedClasses['framework-node']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (`/assets/frameworks/${framework.icon}`),
        alt: "",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (framework.name);
    // @ts-ignore
    [frameworks,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "constellation-classic" },
    'aria-label': "Classic SPFx supports React only",
});
/** @type {__VLS_StyleScopedClasses['constellation-classic']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span)({
    ...{ class: "classic-orbit" },
});
/** @type {__VLS_StyleScopedClasses['classic-orbit']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "/assets/frameworks/react-classic.svg",
    alt: "",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "showcase-copy showcase-copy-right" },
});
/** @type {__VLS_StyleScopedClasses['showcase-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['showcase-copy-right']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "showcase-number" },
});
/** @type {__VLS_StyleScopedClasses['showcase-number']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "copy-contrast" },
});
/** @type {__VLS_StyleScopedClasses['copy-contrast']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
    id: "features",
    ...{ class: "showcase-block showcase-installation" },
    'data-showcase-reveal': true,
});
/** @type {__VLS_StyleScopedClasses['showcase-block']} */ ;
/** @type {__VLS_StyleScopedClasses['showcase-installation']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "showcase-copy" },
});
/** @type {__VLS_StyleScopedClasses['showcase-copy']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "showcase-number" },
});
/** @type {__VLS_StyleScopedClasses['showcase-number']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "copy-contrast" },
});
/** @type {__VLS_StyleScopedClasses['copy-contrast']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "install-inspector" },
});
/** @type {__VLS_StyleScopedClasses['install-inspector']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    ...{ class: "install-topology" },
    viewBox: "0 0 760 420",
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['install-topology']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.defs, __VLS_intrinsics.defs)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.linearGradient, __VLS_intrinsics.linearGradient)({
    id: "topology-line",
    x1: "170",
    y1: "50",
    x2: "585",
    y2: "370",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    'stop-color': "#16D7D1",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: ".5",
    'stop-color': "#2F90FA",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "1",
    'stop-color': "#A550F5",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.g, __VLS_intrinsics.g)({
    ...{ class: "topology-grid" },
});
/** @type {__VLS_StyleScopedClasses['topology-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M64 65H696M64 145H696M64 225H696M64 305H696M64 385H696",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M100 35V400M220 35V400M340 35V400M460 35V400M580 35V400M700 35V400",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.g, __VLS_intrinsics.g)({
    ...{ class: "topology-links" },
});
/** @type {__VLS_StyleScopedClasses['topology-links']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M155 98 272 160 380 102 496 174 606 116",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M272 160 281 285 422 320 496 174",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M380 102 422 320 606 116",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.g, __VLS_intrinsics.g)({
    ...{ class: "topology-nodes" },
});
/** @type {__VLS_StyleScopedClasses['topology-nodes']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "155",
    cy: "98",
    r: "8",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "272",
    cy: "160",
    r: "6",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "380",
    cy: "102",
    r: "10",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "496",
    cy: "174",
    r: "7",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "606",
    cy: "116",
    r: "9",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "281",
    cy: "285",
    r: "7",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "422",
    cy: "320",
    r: "9",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "terminal-card terminal-card-spve" },
});
/** @type {__VLS_StyleScopedClasses['terminal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['terminal-card-spve']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "window-dots" },
});
/** @type {__VLS_StyleScopedClasses['window-dots']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "terminal-body" },
});
/** @type {__VLS_StyleScopedClasses['terminal-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "terminal-success" },
});
/** @type {__VLS_StyleScopedClasses['terminal-success']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "terminal-card terminal-card-classic" },
});
/** @type {__VLS_StyleScopedClasses['terminal-card']} */ ;
/** @type {__VLS_StyleScopedClasses['terminal-card-classic']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "window-dots" },
});
/** @type {__VLS_StyleScopedClasses['window-dots']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dependency-list" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['dependency-list']} */ ;
for (const [index] of __VLS_vFor((7))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (index),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
        ...{ style: ({ width: `${42 + ((index * 17) % 44)}%` }) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
    (index % 2 === 0 ? 'duplicate' : 'dependency');
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
    ...{ class: "showcase-block showcase-project" },
    'data-showcase-reveal': true,
});
/** @type {__VLS_StyleScopedClasses['showcase-block']} */ ;
/** @type {__VLS_StyleScopedClasses['showcase-project']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "project-surfaces" },
});
/** @type {__VLS_StyleScopedClasses['project-surfaces']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    ...{ class: "project-data-map" },
    viewBox: "0 0 900 420",
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['project-data-map']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.defs, __VLS_intrinsics.defs)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.linearGradient, __VLS_intrinsics.linearGradient)({
    id: "project-flow",
    x1: "80",
    y1: "0",
    x2: "820",
    y2: "0",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    'stop-color': "#18D5CA",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: ".58",
    'stop-color': "#388CF7",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "1",
    'stop-color': "#A94BF0",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    ...{ class: "project-flow-line" },
    d: "M92 205H258C300 205 302 123 347 123H552C602 123 596 205 646 205H808",
});
/** @type {__VLS_StyleScopedClasses['project-flow-line']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    ...{ class: "project-flow-branch" },
    d: "M347 123V73M552 123V73M347 123V173M552 123V173",
});
/** @type {__VLS_StyleScopedClasses['project-flow-branch']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.g, __VLS_intrinsics.g)({
    ...{ class: "project-flow-nodes" },
});
/** @type {__VLS_StyleScopedClasses['project-flow-nodes']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "92",
    cy: "205",
    r: "7",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "347",
    cy: "123",
    r: "7",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "552",
    cy: "123",
    r: "7",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "808",
    cy: "205",
    r: "7",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "editor-surface editor-spve" },
});
/** @type {__VLS_StyleScopedClasses['editor-surface']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-spve']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "editor-layout" },
});
/** @type {__VLS_StyleScopedClasses['editor-layout']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "file-tree" },
});
/** @type {__VLS_StyleScopedClasses['file-tree']} */ ;
for (const [file] of __VLS_vFor((__VLS_ctx.spveFiles))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        key: (file.name),
        ...{ style: ({ paddingLeft: `${file.indent * 18}px` }) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: (`file-${file.type}`) },
    });
    (file.type === 'folder' ? '⌄' : '◆');
    (file.name);
    // @ts-ignore
    [spveFiles,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "code-pane" },
});
/** @type {__VLS_StyleScopedClasses['code-pane']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "code-purple" },
});
/** @type {__VLS_StyleScopedClasses['code-purple']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "code-green" },
});
/** @type {__VLS_StyleScopedClasses['code-green']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "code-blue" },
});
/** @type {__VLS_StyleScopedClasses['code-blue']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "editor-surface editor-classic" },
});
/** @type {__VLS_StyleScopedClasses['editor-surface']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-classic']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "editor-layout" },
});
/** @type {__VLS_StyleScopedClasses['editor-layout']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "file-tree" },
});
/** @type {__VLS_StyleScopedClasses['file-tree']} */ ;
for (const [file] of __VLS_vFor((__VLS_ctx.classicFiles))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        key: (file.name),
        ...{ style: ({ paddingLeft: `${file.indent * 18}px` }) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: (`file-${file.type}`) },
    });
    (file.type === 'folder' ? '⌄' : '◆');
    (file.name);
    // @ts-ignore
    [classicFiles,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "config-stack" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['config-stack']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "showcase-copy showcase-copy-right" },
});
/** @type {__VLS_StyleScopedClasses['showcase-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['showcase-copy-right']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "showcase-number" },
});
/** @type {__VLS_StyleScopedClasses['showcase-number']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "copy-contrast" },
});
/** @type {__VLS_StyleScopedClasses['copy-contrast']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
    ...{ class: "showcase-block showcase-runtime" },
    'data-showcase-reveal': true,
});
/** @type {__VLS_StyleScopedClasses['showcase-block']} */ ;
/** @type {__VLS_StyleScopedClasses['showcase-runtime']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "showcase-copy" },
});
/** @type {__VLS_StyleScopedClasses['showcase-copy']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "showcase-number" },
});
/** @type {__VLS_StyleScopedClasses['showcase-number']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "copy-contrast" },
});
/** @type {__VLS_StyleScopedClasses['copy-contrast']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "runtime-browser" },
});
/** @type {__VLS_StyleScopedClasses['runtime-browser']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "browser-chrome" },
});
/** @type {__VLS_StyleScopedClasses['browser-chrome']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "window-dots" },
});
/** @type {__VLS_StyleScopedClasses['window-dots']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "browser-address" },
});
/** @type {__VLS_StyleScopedClasses['browser-address']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "browser-status" },
});
/** @type {__VLS_StyleScopedClasses['browser-status']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "environment-switcher" },
});
/** @type {__VLS_StyleScopedClasses['environment-switcher']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ class: "is-selected" },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['is-selected']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    type: "button",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "runtime-canvas" },
});
/** @type {__VLS_StyleScopedClasses['runtime-canvas']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "tenant-mark" },
});
/** @type {__VLS_StyleScopedClasses['tenant-mark']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-breadcrumb" },
});
/** @type {__VLS_StyleScopedClasses['page-breadcrumb']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "webpart-frame" },
});
/** @type {__VLS_StyleScopedClasses['webpart-frame']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "webpart-label" },
});
/** @type {__VLS_StyleScopedClasses['webpart-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "webpart-content" },
});
/** @type {__VLS_StyleScopedClasses['webpart-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "api-panel" },
});
/** @type {__VLS_StyleScopedClasses['api-panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    id: "quickstart",
    ...{ class: "experience-quickstart" },
    'data-showcase-reveal': true,
});
/** @type {__VLS_StyleScopedClasses['experience-quickstart']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "showcase-number" },
});
/** @type {__VLS_StyleScopedClasses['showcase-number']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "quickstart-command" },
});
/** @type {__VLS_StyleScopedClasses['quickstart-command']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    type: "button",
    'aria-label': "Copy npm init sp",
});
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
