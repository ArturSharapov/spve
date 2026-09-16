/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import SpveMark from './SpveMark.vue';
const menuOpen = ref(false);
const searchOpen = ref(false);
const searchQuery = ref('');
const searchInput = ref(null);
const links = [
    { label: 'Guide', href: '#quickstart', description: 'Create your first SPVE project' },
    { label: 'Config', href: '#workflow', description: 'Typed configuration and generated output' },
    { label: 'Features', href: '#features', description: 'Everything included with SPVE' },
    {
        label: 'Adapters',
        href: '#frameworks',
        description: 'Framework adapters for Vue, React, Svelte, and more',
    },
];
const filteredLinks = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    if (!query)
        return links;
    return links.filter((link) => link.label.toLowerCase().includes(query) || link.description.toLowerCase().includes(query));
});
async function openSearch() {
    searchOpen.value = true;
    await nextTick();
    searchInput.value?.focus();
}
function closeSearch() {
    searchOpen.value = false;
    searchQuery.value = '';
}
function onKeydown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        void openSearch();
    }
    if (event.key === 'Escape')
        closeSearch();
}
onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "fixed inset-x-0 top-0 z-50 bg-ink/24" },
});
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-x-0']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-ink/24']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wide-shell flex h-16 items-center gap-6" },
});
/** @type {__VLS_StyleScopedClasses['wide-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "#top",
    ...{ class: "shrink-0 rounded-md" },
    'aria-label': "SPVE home",
});
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
const __VLS_0 = SpveMark;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    size: (34),
}));
const __VLS_2 = __VLS_1({
    size: (34),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.openSearch) },
    type: "button",
    ...{ class: "ml-auto hidden h-9 w-40 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-sm text-mist transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white lg:flex" },
    'aria-label': "Search (Meta+k)",
});
/** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['h-9']} */ ;
/** @type {__VLS_StyleScopedClasses['w-40']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white/[0.035]']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-mist']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-white/20']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-white/[0.06]']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    width: "15",
    height: "15",
    viewBox: "0 0 16 16",
    fill: "none",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "7",
    cy: "7",
    r: "4.5",
    stroke: "currentColor",
    'stroke-width': "1.3",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "m10.5 10.5 3 3",
    stroke: "currentColor",
    'stroke-width': "1.3",
    'stroke-linecap': "round",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.kbd, __VLS_intrinsics.kbd)({
    ...{ class: "ml-auto rounded border border-white/10 px-1.5 py-0.5 font-mono text-[0.62rem] text-mist/70" },
});
/** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[0.62rem]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-mist/70']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "hidden items-center gap-7 lg:flex" },
    'aria-label': "Main navigation",
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-7']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:flex']} */ ;
for (const [link] of __VLS_vFor((__VLS_ctx.links))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        key: (link.href),
        href: (link.href),
        ...{ class: "text-sm font-medium text-white/82 transition-colors hover:text-sp-cyan" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white/82']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-sp-cyan']} */ ;
    (link.label);
    // @ts-ignore
    [openSearch, links,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "#quickstart",
    ...{ class: "hidden items-center gap-1.5 text-sm font-medium text-white/82 transition hover:text-sp-cyan sm:flex" },
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white/82']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-sp-cyan']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "m3.5 4.75 2.5 2.5 2.5-2.5",
    stroke: "currentColor",
    'stroke-width': "1.2",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.menuOpen = !__VLS_ctx.menuOpen);
            // @ts-ignore
            [menuOpen, menuOpen,];
        } },
    type: "button",
    ...{ class: "ml-auto grid size-10 place-items-center rounded-lg text-white lg:hidden" },
    'aria-expanded': (__VLS_ctx.menuOpen),
    'aria-controls': "mobile-menu",
    'aria-label': "Toggle navigation",
});
/** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['size-10']} */ ;
/** @type {__VLS_StyleScopedClasses['place-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:hidden']} */ ;
if (!__VLS_ctx.menuOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M3.5 5.5h13M3.5 10h13M3.5 14.5h13",
        stroke: "currentColor",
        'stroke-width': "1.6",
        'stroke-linecap': "round",
    });
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "m5 5 10 10m0-10L5 15",
        stroke: "currentColor",
        'stroke-width': "1.6",
        'stroke-linecap': "round",
    });
}
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    id: "mobile-menu",
    ...{ class: "wide-shell border-t border-white/8 py-3 lg:hidden" },
    'aria-label': "Mobile navigation",
});
__VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.menuOpen), }, null, null);
/** @type {__VLS_StyleScopedClasses['wide-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/8']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.openSearch) },
    type: "button",
    ...{ class: "mb-2 flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-3 text-sm text-mist" },
});
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white/[0.035]']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-mist']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    width: "15",
    height: "15",
    viewBox: "0 0 16 16",
    fill: "none",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "7",
    cy: "7",
    r: "4.5",
    stroke: "currentColor",
    'stroke-width': "1.3",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "m10.5 10.5 3 3",
    stroke: "currentColor",
    'stroke-width': "1.3",
    'stroke-linecap': "round",
});
for (const [link] of __VLS_vFor((__VLS_ctx.links))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        ...{ onClick: (...[$event]) => {
                return (__VLS_ctx.menuOpen = false);
                // @ts-ignore
                [openSearch, links, menuOpen, menuOpen, menuOpen, menuOpen,];
            } },
        key: (link.href),
        href: (link.href),
        ...{ class: "block rounded-lg px-2 py-3 text-sm font-medium text-mist hover:bg-white/5 hover:text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-mist']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-white/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    (link.label);
    // @ts-ignore
    [];
}
let __VLS_5;
/** @ts-ignore @type { | typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    to: "body",
}));
const __VLS_7 = __VLS_6({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const { default: __VLS_10 } = __VLS_8.slots;
if (__VLS_ctx.searchOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.closeSearch) },
        ...{ class: "fixed inset-0 z-[100] flex items-start justify-center bg-black/65 px-4 pt-[14vh] backdrop-blur-sm" },
        role: "dialog",
        'aria-modal': "true",
        'aria-label': "Search SPVE",
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-[100]']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/65']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-[14vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-full max-w-lg overflow-hidden rounded-xl border border-white/14 bg-[#0c1822] shadow-2xl" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/14']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#0c1822]']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-3 border-b border-white/10 px-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        width: "18",
        height: "18",
        viewBox: "0 0 18 18",
        fill: "none",
        ...{ class: "text-mist" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['text-mist']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "8",
        cy: "8",
        r: "5",
        stroke: "currentColor",
        'stroke-width': "1.4",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "m11.8 11.8 3.2 3.2",
        stroke: "currentColor",
        'stroke-width': "1.4",
        'stroke-linecap': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ref: "searchInput",
        type: "search",
        ...{ class: "h-14 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-mist/55" },
        placeholder: "Search the SPVE site",
    });
    (__VLS_ctx.searchQuery);
    /** @type {__VLS_StyleScopedClasses['h-14']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['placeholder:text-mist/55']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closeSearch) },
        type: "button",
        ...{ class: "rounded border border-white/10 px-2 py-1 font-mono text-[0.62rem] text-mist" },
    });
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[0.62rem]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-mist']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-2" },
    });
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    for (const [link] of __VLS_vFor((__VLS_ctx.filteredLinks))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            ...{ onClick: (__VLS_ctx.closeSearch) },
            key: (link.href),
            href: (link.href),
            ...{ class: "group flex items-center justify-between rounded-lg px-3 py-3 hover:bg-white/[0.055]" },
        });
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-white/[0.055]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "block text-sm font-semibold text-white" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        (link.label);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "mt-0.5 block text-xs text-mist" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-mist']} */ ;
        (link.description);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-mist transition-colors group-hover:text-sp-cyan" },
        });
        /** @type {__VLS_StyleScopedClasses['text-mist']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['group-hover:text-sp-cyan']} */ ;
        // @ts-ignore
        [searchOpen, closeSearch, closeSearch, closeSearch, searchQuery, filteredLinks,];
    }
    if (__VLS_ctx.filteredLinks.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "px-3 py-8 text-center text-sm text-mist" },
        });
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-mist']} */ ;
    }
}
// @ts-ignore
[filteredLinks,];
var __VLS_8;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
