<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import ComparisonParty from './ComparisonParty.vue'
import FrameworkArtifacts from './FrameworkArtifacts.vue'

const comparisonSection = ref<HTMLElement | null>(null)
const installationProgressPair = ref<HTMLElement | null>(null)
const commandCopied = ref(false)
let scrollHeadings: HTMLElement[] = []
let frameworkTextRows: HTMLElement[] = []
let scrollRevealItems: HTMLElement[] = []
let scrollOpacityFrame: number | null = null
let initialScrollSyncFrame: number | null = null
let installationProgressObserver: IntersectionObserver | null = null
let copyResetTimer: number | null = null

const copyInitCommand = async () => {
  await navigator.clipboard.writeText('npm init sp')
  commandCopied.value = true
  if (copyResetTimer !== null) window.clearTimeout(copyResetTimer)
  copyResetTimer = window.setTimeout(() => {
    commandCopied.value = false
    copyResetTimer = null
  }, 1800)
}

const updateScrollOpacities = () => {
  scrollOpacityFrame = null

  scrollHeadings.forEach((heading) => {
    const words = heading.querySelectorAll<HTMLElement>('[data-scroll-word]')
    const headingTop = heading.getBoundingClientRect().top
    const revealStart = window.innerHeight * 0.88
    const revealEnd = window.innerHeight * 0.32
    const progress = Math.min(
      1,
      Math.max(0, (revealStart - headingTop) / (revealStart - revealEnd)),
    )

    words.forEach((word, index) => {
      const configuredOpacity = Number.parseFloat(
        window.getComputedStyle(word).getPropertyValue('--word-target-opacity'),
      )
      const targetOpacity = Number.isFinite(configuredOpacity) ? configuredOpacity : 1
      const wordProgress = Math.min(1, Math.max(0, progress * words.length - index))
      const easedProgress = wordProgress * wordProgress * (3 - 2 * wordProgress)
      const opacity = 0.18 + (targetOpacity - 0.18) * easedProgress

      word.style.setProperty('--word-scroll-opacity', opacity.toFixed(4))
    })
  })

  frameworkTextRows.forEach((row) => {
    const rowTop = row.getBoundingClientRect().top
    const revealStart = window.innerHeight * 0.8
    const revealEnd = window.innerHeight * 0.54
    const progress = Math.min(1, Math.max(0, (revealStart - rowTop) / (revealStart - revealEnd)))
    const easedProgress = progress * progress * (3 - 2 * progress)
    const opacity = 0.18 + 0.82 * easedProgress

    row.style.setProperty('--framework-text-scroll-opacity', opacity.toFixed(4))
  })

  scrollRevealItems.forEach((item) => {
    const itemTop = item.getBoundingClientRect().top
    const triggerLine = window.innerHeight * 0.94

    item.classList.toggle('is-visible', itemTop <= triggerLine)
  })
}

const scheduleScrollOpacities = () => {
  if (scrollOpacityFrame !== null) return
  scrollOpacityFrame = window.requestAnimationFrame(updateScrollOpacities)
}

const syncInitialScrollState = () => {
  if (initialScrollSyncFrame !== null) window.cancelAnimationFrame(initialScrollSyncFrame)
  initialScrollSyncFrame = window.requestAnimationFrame(() => {
    initialScrollSyncFrame = window.requestAnimationFrame(() => {
      initialScrollSyncFrame = null
      updateScrollOpacities()
    })
  })
}

const frameworkRows = [
  { spve: 'Any framework', classic: 'React only' },
  { spve: 'React 19.2.8', classic: 'React 17.0.1' },
  { spve: 'Vue', classic: '—' },
  { spve: 'Preact', classic: '—' },
  { spve: 'Lit', classic: '—' },
  { spve: 'Svelte', classic: '—' },
  { spve: 'Solid', classic: '—' },
  { spve: 'Qwik', classic: '—' },
] as const

const projectLabels = ['Project A', 'Project B', 'Project C'] as const

onMounted(() => {
  const section = comparisonSection.value
  if (!section) return

  scrollHeadings = Array.from(section.querySelectorAll<HTMLElement>('[data-scroll-heading]'))
  frameworkTextRows = Array.from(
    section.querySelectorAll<HTMLElement>('[data-scroll-framework-row]'),
  )
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scrollRevealItems = Array.from(section.querySelectorAll<HTMLElement>('[data-modern-reveal]'))
    section.classList.add('modern-reveal-ready')

    const progressPair = installationProgressPair.value
    if (progressPair) {
      installationProgressObserver = new IntersectionObserver(
        ([entry]) => {
          progressPair.classList.toggle('is-progress-running', entry?.isIntersecting === true)
        },
        { threshold: 0.01 },
      )
      installationProgressObserver.observe(progressPair)
    }
  }
  updateScrollOpacities()
  syncInitialScrollState()
  window.addEventListener('scroll', scheduleScrollOpacities, { passive: true })
  window.addEventListener('resize', scheduleScrollOpacities)
  window.addEventListener('load', syncInitialScrollState)
  window.addEventListener('pageshow', syncInitialScrollState)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleScrollOpacities)
  window.removeEventListener('resize', scheduleScrollOpacities)
  window.removeEventListener('load', syncInitialScrollState)
  window.removeEventListener('pageshow', syncInitialScrollState)
  installationProgressObserver?.disconnect()
  installationProgressObserver = null
  if (copyResetTimer !== null) window.clearTimeout(copyResetTimer)
  if (scrollOpacityFrame !== null) window.cancelAnimationFrame(scrollOpacityFrame)
  if (initialScrollSyncFrame !== null) window.cancelAnimationFrame(initialScrollSyncFrame)
  scrollHeadings = []
  frameworkTextRows = []
  scrollRevealItems = []
})
</script>

<template>
  <section id="why-spve" ref="comparisonSection" class="modern-comparison relative py-28">
    <div class="wide-shell">
      <article id="workflow" class="modern-chapter modern-chapter-startup" data-modern-reveal>
        <header class="modern-chapter-heading">
          <h2 data-scroll-heading aria-label="Never waste time again.">
            <span data-scroll-word aria-hidden="true">Never</span>
            <span data-scroll-word aria-hidden="true">waste</span>
            <span data-scroll-word aria-hidden="true">time</span>
            <span data-scroll-word aria-hidden="true">again.</span>
          </h2>
        </header>

        <div class="startup-composition">
          <div class="startup-change-label">Every time a change is made...</div>
          <div class="startup-pair startup-pair-response">
            <section class="startup-lane startup-lane-spve startup-lane-response">
              <ComparisonParty label="Using SPVE" />
              <div class="startup-speed-tag">
                <strong>
                  <svg
                    class="startup-speed-icon startup-speed-icon-spve"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="m13.4 1.8-8 11h5.3l-.8 9.4 8.7-12.4h-5.4l.2-8Z" />
                  </svg>
                  milliseconds
                </strong>
              </div>
              <h3 class="startup-primary-claim">See changes instantly</h3>
              <div class="startup-live-scene" aria-hidden="true">
                <div class="startup-editor-mini">
                  <header><i /><i /><i /></header>
                  <span /><span class="startup-changed-line"><i /></span><span /><span />
                </div>
                <div class="startup-update-indicator"><span /></div>
                <div class="startup-preview-mini startup-preview-preserved">
                  <header><i /><span /></header>
                  <div class="preview-component">
                    <span class="preview-heading" />
                    <span class="preview-input is-populated is-updated"><i /></span>
                    <span class="preview-selection"><i class="is-selected" /><i /><i /></span>
                    <span class="preview-toggle is-on"><i /></span>
                  </div>
                </div>
              </div>
            </section>

            <section class="startup-lane startup-lane-classic startup-lane-response">
              <ComparisonParty label="Classic SPFx" />
              <div class="startup-speed-tag">
                <strong>
                  <svg
                    v-for="_ in 3"
                    class="startup-speed-icon startup-speed-icon-classic"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="10" cy="12" r="6" />
                    <path
                      d="M10 9a3 3 0 1 1-3 3 2 2 0 1 1 2-2M3 17.5h15c2 0 3-1.1 3-2.7 0-1.8-1.2-3-3-3h-1.5M18 11.8V8m2.2 4V9M18 8l-1-1m3.2 2 1-1"
                    />
                  </svg>
                  minutes
                </strong>
              </div>
              <ol class="startup-reload-stages">
                <li><i /><strong>Wait for page reload to begin</strong></li>
                <li><i /><strong>Wait for page to fully load</strong></li>
                <li><i /><strong>Wait for webpart to mount</strong></li>
              </ol>
              <div class="startup-wait-pipeline" aria-hidden="true">
                <svg
                  class="startup-wait-surface startup-wait-surface-clock"
                  viewBox="0 0 70 56"
                  fill="none"
                >
                  <rect class="wait-browser" x="0.75" y="0.75" width="68.5" height="54.5" rx="6" />
                  <path class="wait-browser-bar" d="M1 12.5H69" />
                  <circle class="wait-browser-dot" cx="6.5" cy="6.5" r="1.5" />
                  <circle class="wait-clock-face" cx="35" cy="34" r="12.5" />
                  <path class="wait-clock-hands" d="M35 27.5V34l5 3" />
                </svg>
                <span />
                <svg
                  class="startup-wait-surface startup-wait-surface-reload"
                  viewBox="0 0 70 56"
                  fill="none"
                >
                  <rect class="wait-browser" x="0.75" y="0.75" width="68.5" height="54.5" rx="6" />
                  <path class="wait-browser-bar" d="M1 12.5H69" />
                  <circle class="wait-browser-dot" cx="6.5" cy="6.5" r="1.5" />
                  <rect class="wait-reload-page" x="9" y="18" width="52" height="31" rx="3" />
                  <path
                    class="wait-reload-arc"
                    d="M45.5 25.5a11 11 0 1 0 1.4 14"
                    transform="translate(35 34) scale(.84) translate(-35 -34)"
                  />
                  <path
                    class="wait-reload-head"
                    d="m46.9 34.5v5l-4.8-1.5"
                    transform="translate(35 34) scale(.84) translate(-35 -34)"
                  />
                </svg>
                <span />
                <svg
                  class="startup-wait-surface startup-wait-surface-component"
                  viewBox="0 0 70 56"
                  fill="none"
                >
                  <rect class="wait-browser" x="0.75" y="0.75" width="68.5" height="54.5" rx="6" />
                  <path class="wait-browser-bar" d="M1 12.5H69" />
                  <circle class="wait-browser-dot" cx="6.5" cy="6.5" r="1.5" />
                  <rect
                    class="wait-component-placeholder"
                    x="9"
                    y="18"
                    width="52"
                    height="31"
                    rx="3"
                  />
                  <rect class="wait-component-ghost" x="14" y="23" width="32" height="18" rx="3" />
                  <path class="wait-component-lines" d="M19 29h14M19 34h20" />
                  <circle class="wait-component-clock" cx="52" cy="40" r="10" />
                  <path class="wait-component-clock-hands" d="M52 34.5V40l4 2.5" />
                </svg>
              </div>
            </section>
          </div>

          <div class="startup-pair startup-pair-state">
            <section class="startup-lane startup-lane-spve startup-lane-state">
              <div class="startup-state-scene" aria-hidden="true">
                <div class="startup-preview-mini startup-preview-preserved">
                  <header><i /><span /></header>
                  <div class="preview-component">
                    <span class="preview-heading is-customized"
                      ><span class="preview-entered-text">42</span><i class="preview-value-caret"
                    /></span>
                    <span class="preview-input is-populated"
                      ><span class="preview-entered-text">hello</span
                      ><i class="preview-value-caret"
                    /></span>
                    <span class="preview-selection"
                      ><i>A</i><i>B</i><i class="is-selected">C</i></span
                    >
                  </div>
                </div>
              </div>
              <ul class="startup-outcomes">
                <li><i class="literal-check" /><strong>State is preserved</strong></li>
                <li><i class="literal-check" /><strong>User input is preserved</strong></li>
              </ul>
            </section>

            <section class="startup-lane startup-lane-classic startup-lane-state">
              <div class="startup-state-scene" aria-hidden="true">
                <div class="startup-preview-mini startup-preview-reset">
                  <header><i /><span /></header>
                  <div class="preview-component">
                    <span class="preview-heading is-reset"><i class="preview-value-caret" /></span>
                    <span class="preview-input is-empty"><i class="preview-value-caret" /></span>
                    <span class="preview-selection"><i>A</i><i>B</i><i>C</i></span>
                  </div>
                </div>
              </div>
              <ul class="startup-outcomes startup-outcomes-lost">
                <li><i class="literal-cross" /><strong>State is lost</strong></li>
                <li>
                  <i class="literal-cross" /><strong
                    >User input is lost (forms, selections, etc.)</strong
                  >
                </li>
              </ul>
            </section>
          </div>
        </div>
      </article>

      <section
        id="frameworks"
        class="modern-frameworks comparison-group comparison-group-frameworks"
        data-modern-reveal
      >
        <FrameworkArtifacts />

        <div class="comparison-heading grid grid-cols-2">
          <div class="comparison-heading-side"><h2>Using SPVE</h2></div>
          <div class="comparison-heading-side"><h2>Classic SPFx</h2></div>
        </div>

        <div class="comparison-group-heading is-active">
          <h3><span>Frameworks</span></h3>
        </div>

        <ul class="comparison-group-list">
          <li
            v-for="(item, index) in frameworkRows"
            :key="item.spve"
            class="comparison-row grid is-visible is-active"
            :class="index === 0 ? 'comparison-row-primary' : 'comparison-row-subitem'"
            data-scroll-framework-row
          >
            <div class="comparison-side comparison-side-spve">
              <span class="comparison-label"
                ><span class="comparison-label-line" data-scroll-framework-text>{{
                  item.spve
                }}</span></span
              >
              <span class="comparison-mark comparison-mark-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="m6.5 12.5 3.3 3.3 7.7-8"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
            <div class="comparison-divider" aria-hidden="true" />
            <div class="comparison-side comparison-side-classic">
              <span class="comparison-mark comparison-mark-cross" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="m8 8 8 8m0-8-8 8"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
              <span class="comparison-label"
                ><span class="comparison-label-line" data-scroll-framework-text>{{
                  item.classic
                }}</span></span
              >
            </div>
          </li>
        </ul>
      </section>

      <article
        id="features"
        class="modern-chapter modern-chapter-installation modern-chapter-reverse"
        data-modern-reveal
      >
        <header class="modern-chapter-heading">
          <h2 data-scroll-heading aria-label="Dependencies Managed Right.">
            <span data-scroll-word aria-hidden="true">Dependencies</span>
            <span data-scroll-word aria-hidden="true">Managed</span>
            <span data-scroll-word aria-hidden="true">Right.</span>
          </h2>
        </header>

        <div class="installation-composition">
          <div ref="installationProgressPair" class="installation-pair installation-pair-speed">
            <section class="install-surface install-surface-spve install-surface-speed">
              <ComparisonParty label="Using SPVE" />
              <dl class="install-claim install-claim-speed">
                <div>
                  <dt>Quick installation</dt>
                  <dd aria-hidden="true"><span class="install-delivery-signal" /></dd>
                </div>
              </dl>
            </section>

            <section class="install-surface install-surface-classic install-surface-speed">
              <ComparisonParty label="Classic SPFx" />
              <dl class="install-claim install-claim-speed">
                <div>
                  <dt>Long wait times</dt>
                  <dd aria-hidden="true"><span class="install-delivery-signal" /></dd>
                </div>
              </dl>
            </section>
          </div>

          <div class="installation-pair installation-pair-footprint">
            <section class="install-surface install-surface-spve install-surface-footprint">
              <div class="install-footprint install-footprint-spve" aria-hidden="true">
                <div class="install-footprint-spve-art">
                  <div class="install-shared-store"><i v-for="index in 6" :key="index" /></div>
                  <svg viewBox="0 0 100 132" preserveAspectRatio="none" fill="none">
                    <path pathLength="100" d="M0 66C38 66 62 29.2 100 29.2" />
                    <path pathLength="100" d="M0 66C38 66 62 71.8 100 71.8" />
                    <path pathLength="100" d="M0 66C38 66 62 114.5 100 114.5" />
                  </svg>
                  <div class="install-shared-projects">
                    <div
                      v-for="label in projectLabels"
                      :key="label"
                      class="install-project-entry install-project-entry-spve"
                    >
                      <span class="install-project-label">{{ label }}</span>
                      <div class="install-local-project" />
                    </div>
                  </div>
                </div>
              </div>
              <dl class="install-claim install-claim-footprint">
                <div>
                  <dt>Zero overhead</dt>
                  <dd><span /></dd>
                </div>
              </dl>
            </section>

            <section class="install-surface install-surface-classic install-surface-footprint">
              <div class="install-footprint install-footprint-classic" aria-hidden="true">
                <div class="install-classic-projects">
                  <div
                    v-for="label in projectLabels"
                    :key="label"
                    class="install-project-entry install-project-entry-classic"
                  >
                    <span class="install-project-label">{{ label }}</span>
                    <div class="install-classic-project">
                      <i v-for="brick in 6" :key="brick" />
                    </div>
                  </div>
                </div>
              </div>
              <dl class="install-claim install-claim-footprint">
                <div>
                  <dt>Gigabytes of disk space per project</dt>
                  <dd><span /></dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </article>

      <article id="project-setup" class="modern-chapter modern-chapter-project" data-modern-reveal>
        <header class="modern-chapter-heading">
          <h2 data-scroll-heading aria-label="Simplify.">
            <span data-scroll-word aria-hidden="true">Simplify.</span>
          </h2>
        </header>

        <div class="project-composition">
          <section class="workspace-surface workspace-surface-spve">
            <ComparisonParty label="Using SPVE" />
            <div class="workspace-body">
              <div class="workspace-tree" aria-hidden="true"><i /><i /><i /><i /></div>
              <ul>
                <li>Clean app workspace</li>
                <li>One configuration</li>
                <li>Application code only</li>
              </ul>
            </div>
          </section>
          <section class="workspace-surface workspace-surface-classic">
            <ComparisonParty label="Classic SPFx" />
            <div class="workspace-body">
              <div class="workspace-tree" aria-hidden="true">
                <i v-for="index in 10" :key="index" />
              </div>
              <ul>
                <li>SPFx boilerplate</li>
                <li>Many config files</li>
                <li>Bloat of complex folders and files</li>
              </ul>
            </div>
          </section>
        </div>
      </article>

      <article
        id="runtime"
        class="modern-chapter modern-chapter-runtime modern-chapter-reverse"
        data-modern-reveal
      >
        <header class="modern-chapter-heading">
          <h2 data-scroll-heading aria-label="Run everywhere.">
            <span data-scroll-word aria-hidden="true">Run</span>
            <span data-scroll-word aria-hidden="true">everywhere.</span>
          </h2>
        </header>

        <div class="runtime-composition">
          <section class="runtime-surface runtime-surface-spve">
            <ComparisonParty label="Using SPVE" />
            <h3>Inside or outside Microsoft products</h3>
            <div class="runtime-infra-scene runtime-infra-scene-spve">
              <svg viewBox="0 0 720 320" aria-hidden="true">
                <defs>
                  <radialGradient id="runtimeSpvePlatform" cx="50%" cy="48%" r="62%">
                    <stop stop-color="#57a6dc" stop-opacity=".45" />
                    <stop offset=".36" stop-color="#2a5b88" stop-opacity=".32" />
                    <stop offset=".7" stop-color="#1a3557" stop-opacity=".22" />
                    <stop offset="1" stop-color="#102138" stop-opacity=".16" />
                  </radialGradient>
                  <linearGradient id="runtimeSpveMarkPanel" x1="0" y1=".1" x2="1" y2=".9">
                    <stop stop-color="#daf0ff" />
                    <stop offset=".48" stop-color="#bde8ff" />
                    <stop offset="1" stop-color="#94c8fb" />
                  </linearGradient>
                  <radialGradient id="runtimeSpveArtifactAura">
                    <stop stop-color="#4aa7cf" stop-opacity=".15" />
                    <stop offset=".48" stop-color="#246f91" stop-opacity=".06" />
                    <stop offset="1" stop-color="#071824" stop-opacity="0" />
                  </radialGradient>
                  <radialGradient id="runtimeSpveNodeGlow">
                    <stop stop-color="#76b9ef" stop-opacity=".74" />
                    <stop offset=".42" stop-color="#4786ba" stop-opacity=".31" />
                    <stop offset=".75" stop-color="#405972" stop-opacity=".12" />
                    <stop offset="1" stop-color="#071824" stop-opacity="0" />
                  </radialGradient>
                  <radialGradient id="runtimeOrbitPlane" cx="50%" cy="44%" rx="58%" ry="62%">
                    <stop stop-color="#315f7a" stop-opacity=".09" />
                    <stop offset=".48" stop-color="#203d52" stop-opacity=".035" />
                    <stop offset="1" stop-color="#03111b" stop-opacity="0" />
                  </radialGradient>
                  <linearGradient id="runtimeOrbitSheen" x1="0" y1="0" x2="1" y2="1">
                    <stop stop-color="#477792" stop-opacity="0" />
                    <stop offset=".48" stop-color="#477792" stop-opacity=".05" />
                    <stop offset="1" stop-color="#263f55" stop-opacity="0" />
                  </linearGradient>
                  <filter id="runtimeSpveSoftGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="8" />
                  </filter>
                  <filter id="runtimeSpveSmallGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="4.2" />
                  </filter>
                  <filter id="runtimeOrbitHaze" x="-30%" y="-80%" width="160%" height="260%">
                    <feGaussianBlur stdDeviation="7" />
                  </filter>
                  <filter id="runtimeWaveHaze" x="-60%" y="-120%" width="220%" height="340%">
                    <feGaussianBlur stdDeviation="8" />
                  </filter>
                  <filter id="runtimeNodeBloom" x="-150%" y="-150%" width="400%" height="400%">
                    <feGaussianBlur stdDeviation="2.2" />
                  </filter>
                  <filter
                    id="runtimeSpvePlatformDepth"
                    x="-40%"
                    y="-50%"
                    width="180%"
                    height="220%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="9"
                      stdDeviation="6"
                      flood-color="#02080d"
                      flood-opacity=".72"
                    />
                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation="4"
                      flood-color="#279bd0"
                      flood-opacity=".18"
                    />
                  </filter>
                  <filter id="runtimeSpveCubeDepth" x="-60%" y="-50%" width="220%" height="220%">
                    <feDropShadow
                      dx="0"
                      dy="8"
                      stdDeviation="7"
                      flood-color="#02080d"
                      flood-opacity=".52"
                    />
                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation="8.5"
                      flood-color="#35b4ed"
                      flood-opacity=".24"
                    />
                  </filter>
                  <symbol id="runtimeHostVercel" viewBox="-4 -4 32 32">
                    <path d="m12 1.608 12 20.784H0Z" />
                  </symbol>
                  <symbol id="runtimeHostCloudflare" viewBox="-4 -4 32 32">
                    <path
                      d="M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.499-1.0615-.5205l-8.6592-.1123a.1559.1559 0 0 1-.1333-.0713c-.0283-.042-.0351-.0986-.021-.1553.0278-.084.1123-.1484.2036-.1562l8.7359-.1123c1.0351-.0489 2.1601-.8868 2.5537-1.9136l.499-1.3013c.0215-.0561.0293-.1128.0147-.168-.5625-2.5463-2.835-4.4453-5.5499-4.4453-2.5039 0-4.6284 1.6177-5.3876 3.8614-.4927-.3658-1.1187-.5625-1.794-.499-1.2026.119-2.1665 1.083-2.2861 2.2856-.0283.31-.0069.6128.0635.894C1.5683 13.171 0 14.7754 0 16.752c0 .1748.0142.3515.0352.5273.0141.083.0844.1475.1689.1475h15.9814c.0909 0 .1758-.0645.2032-.1553l.12-.4268zm2.7568-5.5634c-.0771 0-.1611 0-.2383.0112-.0566 0-.1054.0415-.127.0976l-.3378 1.1744c-.1475.5068-.0918.9707.1543 1.3164.2256.3164.6055.498 1.0625.5195l1.8437.1133c.0557 0 .1055.0263.1329.0703.0283.043.0351.1074.0214.1562-.0283.084-.1132.1485-.204.1553l-1.921.1123c-1.041.0488-2.1582.8867-2.5527 1.914l-.1406.3585c-.0283.0713.0215.1416.0986.1416h6.5977c.0771 0 .1474-.0489.169-.126.1122-.4082.1757-.837.1757-1.2803 0-2.6025-2.125-4.727-4.7344-4.727"
                    />
                  </symbol>
                  <symbol id="runtimeHostAzure" viewBox="-4 -4 32 32">
                    <path
                      d="M5.483 21.3H24L14.025 4.013l-3.038 8.347 5.836 6.938L5.483 21.3zM13.23 2.7L6.105 8.677 0 19.253h5.505v.001L13.23 2.7z"
                    />
                  </symbol>
                  <symbol id="runtimeHostDeno" viewBox="-4 -4 32 32">
                    <path
                      d="M1.105 18.02A11.9 11.9 0 0 1 0 12.985q0-.698.078-1.376a12 12 0 0 1 .231-1.34A12 12 0 0 1 4.025 4.02a12 12 0 0 1 5.46-2.771 12 12 0 0 1 3.428-.23c1.452.112 2.825.477 4.077 1.05a12 12 0 0 1 2.78 1.774 12.02 12.02 0 0 1 4.053 7.078A12 12 0 0 1 24 12.985q0 .454-.036.914a12 12 0 0 1-.728 3.305 12 12 0 0 1-2.38 3.875c-1.33 1.357-3.02 1.962-4.43 1.936a4.4 4.4 0 0 1-2.724-1.024c-.99-.853-1.391-1.83-1.53-2.919a5 5 0 0 1 .128-1.518c.105-.38.37-1.116.76-1.437-.455-.197-1.04-.624-1.226-.829-.045-.05-.04-.13 0-.183a.155.155 0 0 1 .177-.053c.392.134.869.267 1.372.35.66.111 1.484.25 2.317.292 2.03.1 4.153-.813 4.812-2.627s.403-3.609-1.96-4.685-3.454-2.356-5.363-3.128c-1.247-.505-2.636-.205-4.06.582-3.838 2.121-7.277 8.822-5.69 15.032a.191.191 0 0 1-.315.19 12 12 0 0 1-1.25-1.634 12 12 0 0 1-.769-1.404M11.57 6.087c.649-.051 1.214.501 1.31 1.236.13.979-.228 1.99-1.41 2.013-1.01.02-1.315-.997-1.248-1.614.066-.616.574-1.575 1.35-1.635"
                    />
                  </symbol>
                  <symbol id="runtimeHostNetlify" viewBox="-4 -4 32 32">
                    <path
                      d="M6.49 19.04h-.23L5.13 17.9v-.23l1.73-1.71h1.2l.15.15v1.2L6.5 19.04ZM5.13 6.31V6.1l1.13-1.13h.23L8.2 6.68v1.2l-.15.15h-1.2L5.13 6.31Zm9.96 9.09h-1.65l-.14-.13v-3.83c0-.68-.27-1.2-1.1-1.23-.42 0-.9 0-1.43.02l-.07.08v4.96l-.14.14H8.9l-.13-.14V8.73l.13-.14h3.7a2.6 2.6 0 0 1 2.61 2.6v4.08l-.13.14Zm-8.37-2.44H.14L0 12.82v-1.64l.14-.14h6.58l.14.14v1.64l-.14.14Zm17.14 0h-6.58l-.14-.14v-1.64l.14-.14h6.58l.14.14v1.64l-.14.14ZM11.05 6.55V1.64l.14-.14h1.65l.14.14v4.9l-.14.14h-1.65l-.14-.13Zm0 15.81v-4.9l.14-.14h1.65l.14.13v4.91l-.14.14h-1.65l-.14-.14Z"
                    />
                  </symbol>
                  <symbol id="runtimeHostDigitalOcean" viewBox="-4 -4 32 32">
                    <path
                      d="M12.04 0C5.408-.02.005 5.37.005 11.992h4.638c0-4.923 4.882-8.731 10.064-6.855a6.95 6.95 0 014.147 4.148c1.889 5.177-1.924 10.055-6.84 10.064v-4.61H7.391v4.623h4.61V24c7.86 0 13.967-7.588 11.397-15.83-1.115-3.59-3.985-6.446-7.575-7.575A12.8 12.8 0 0012.039 0zM7.39 19.362H3.828v3.564H7.39zm-3.563 0v-2.978H.85v2.978z"
                    />
                  </symbol>
                  <symbol id="runtimeHostFly" viewBox="-4 -4 32 32">
                    <path
                      d="M11.987 0c-2.45-.01-5.002.925-6.541 2.897-1.17 1.502-1.664 3.474-1.49 5.356.29 2.112 1.476 3.96 2.676 5.672a41.5 41.5 0 0 0 4.216 4.831c-1.063.832-1.943 2.286-1.357 3.644.821 2.32 4.665 2.05 5.122-.372.39-1.288-.694-2.533-1.428-3.309 2.388-2.431 4.706-5.036 6.17-8.145.595-1.32.902-2.802.614-4.24-.28-2.341-1.823-4.473-3.967-5.46C14.76.266 13.364.016 11.987 0m-.236 1.577v15.534C9.881 13.483 7.724 9.266 8.73 5.069c.35-1.539 1.253-3.309 3.02-3.492m1.996.04c1.534.357 3.031 1.096 3.906 2.48 1.3 1.93 1.318 4.55.1 6.521-1.268 2.395-3.06 4.463-4.916 6.415 1.472-2.974 3.074-6.106 3.182-9.5-.043-2.08-.438-4.612-2.272-5.916M11.97 20.103c.848.342 1.597 1.983.153 2.173-.664.15-1.367-.599-.995-1.222.213-.355.488-.73.842-.95"
                    />
                  </symbol>
                  <symbol id="runtimeHostRailway" viewBox="-4 -4 32 32">
                    <path
                      d="M.113 10.27A13.026 13.026 0 000 11.48h18.23c-.064-.125-.15-.237-.235-.347-3.117-4.027-4.793-3.677-7.19-3.78-.8-.034-1.34-.048-4.524-.048-1.704 0-3.555.005-5.358.01-.234.63-.459 1.24-.567 1.737h9.342v1.216H.113v.002zm18.26 2.426H.009c.02.326.05.645.094.961h16.955c.754 0 1.179-.429 1.315-.96zm-17.318 4.28s2.81 6.902 10.93 7.024c4.855 0 9.027-2.883 10.92-7.024H1.056zM11.988 0C7.5 0 3.593 2.466 1.531 6.108l4.75-.005v-.002c3.71 0 3.849.016 4.573.047l.448.016c1.563.052 3.485.22 4.996 1.364.82.621 2.007 1.99 2.712 2.965.654.902.842 1.94.396 2.934-.408.914-1.289 1.458-2.353 1.458H.391s.099.42.249.886h22.748A12.026 12.026 0 0024 12.005C24 5.377 18.621 0 11.988 0z"
                    />
                  </symbol>
                  <symbol id="runtimeHostGitHub" viewBox="-4 -4 32 32">
                    <path
                      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                    />
                  </symbol>
                  <symbol id="runtimeHostAmplify" viewBox="-4 -4 32 32">
                    <path
                      d="M5.223 17.905h6.76l1.731 3.047H0l4.815-8.344 2.018-3.494 1.733 3.002zm2.52-10.371L9.408 4.65l9.415 16.301h-3.334zm2.59-4.486h3.33L24 20.952h-3.334z"
                    />
                  </symbol>
                  <symbol id="runtimeHostFirebase" viewBox="-4 -4 32 32">
                    <path
                      d="M19.455 8.369c-.538-.748-1.778-2.285-3.681-4.569-.826-.991-1.535-1.832-1.884-2.245a146 146 0 0 0-.488-.576l-.207-.245-.113-.133-.022-.032-.01-.005L12.57 0l-.609.488c-1.555 1.246-2.828 2.851-3.681 4.64-.523 1.064-.864 2.105-1.043 3.176-.047.241-.088.489-.121.738-.209-.017-.421-.028-.632-.033-.018-.001-.035-.002-.059-.003a7.46 7.46 0 0 0-2.28.274l-.317.089-.163.286c-.765 1.342-1.198 2.869-1.252 4.416-.07 2.01.477 3.954 1.583 5.625 1.082 1.633 2.61 2.882 4.42 3.611l.236.095.071.025.003-.001a9.59 9.59 0 0 0 2.941.568q.171.006.342.006c1.273 0 2.513-.249 3.69-.742l.008.004.313-.145a9.63 9.63 0 0 0 3.927-3.335c1.01-1.49 1.577-3.234 1.641-5.042.075-2.161-.643-4.304-2.133-6.371m-7.083 6.695c.328 1.244.264 2.44-.191 3.558-1.135-1.12-1.967-2.352-2.475-3.665-.543-1.404-.87-2.74-.974-3.975.48.157.922.366 1.315.622 1.132.737 1.914 1.902 2.325 3.461zm.207 6.022c.482.368.99.712 1.513 1.028-.771.21-1.565.302-2.369.273a8 8 0 0 1-.373-.022c.458-.394.869-.823 1.228-1.279zm1.347-6.431c-.516-1.957-1.527-3.437-3.002-4.398-.647-.421-1.385-.741-2.194-.95.011-.134.026-.268.043-.4.014-.113.03-.216.046-.313.133-.689.332-1.37.589-2.025.099-.25.206-.499.321-.74l.004-.008c.177-.358.376-.719.61-1.105l.092-.152-.003-.001c.544-.851 1.197-1.627 1.942-2.311l.288.341c.672.796 1.304 1.548 1.878 2.237 1.291 1.549 2.966 3.583 3.612 4.48 1.277 1.771 1.893 3.579 1.83 5.375-.049 1.395-.461 2.755-1.195 3.933-.694 1.116-1.661 2.05-2.8 2.708-.636-.318-1.559-.839-2.539-1.599.79-1.575.952-3.28.479-5.072zm-2.575 5.397c-.725.939-1.587 1.55-2.09 1.856-.081-.029-.163-.06-.243-.093l-.065-.026c-1.49-.616-2.747-1.656-3.635-3.01-.907-1.384-1.356-2.993-1.298-4.653.041-1.19.338-2.327.882-3.379.316-.07.638-.114.96-.131l.084-.002c.162-.003.324-.003.478 0 .227.011.454.035.677.07.073 1.513.445 3.145 1.105 4.852.637 1.644 1.694 3.162 3.144 4.515z"
                    />
                  </symbol>
                  <symbol id="runtimeHostRender" viewBox="-4 -4 32 32">
                    <path
                      d="M18.263.007c-3.121-.147-5.744 2.109-6.192 5.082-.018.138-.045.272-.067.405-.696 3.703-3.936 6.507-7.827 6.507-1.388 0-2.691-.356-3.825-.979a.2024.2024 0 0 0-.302.178V24H12v-8.999c0-1.656 1.338-3 2.987-3h2.988c3.382 0 6.103-2.817 5.97-6.244-.12-3.084-2.61-5.603-5.682-5.75"
                    />
                  </symbol>
                  <symbol id="runtimeHostHetzner" viewBox="-4 -4 32 32">
                    <path
                      d="M0 0v24h24V0H0zm4.602 4.025h2.244c.509 0 .716.215.716.717v5.64h8.883v-5.64c0-.509.215-.717.717-.717h2.229c.5 0 .71.23.724.717v14.516c0 .509-.215.717-.717.717h-2.23c-.51 0-.717-.215-.717-.717v-5.735H7.562v5.735c0 .516-.215.717-.716.717H4.602c-.51 0-.717-.208-.717-.717V4.742c0-.509.207-.717.717-.717z"
                    />
                  </symbol>
                  <symbol id="runtimeHostSelfHosted" viewBox="-4 -4 32 32">
                    <path
                      fill-rule="evenodd"
                      d="M3 2h18a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 11h18a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2ZM5 5.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Zm0 11a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"
                    />
                  </symbol>
                  <symbol id="runtimeHostSharePoint" viewBox="-4 -4 32 32">
                    <path
                      d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"
                    />
                  </symbol>
                </defs>
                <g class="runtime-orbit-depth">
                  <ellipse cx="363" cy="146" rx="318" ry="121" fill="url(#runtimeOrbitPlane)" />
                  <ellipse
                    cx="363"
                    cy="158"
                    rx="288"
                    ry="88"
                    fill="url(#runtimeOrbitSheen)"
                    filter="url(#runtimeOrbitHaze)"
                  />
                  <path
                    d="M58 189C164 114 278 86 409 93c126 6 225 49 278 111C574 157 473 143 356 146 239 149 144 161 58 189Z"
                    fill="url(#runtimeOrbitSheen)"
                  />
                </g>
                <g class="runtime-orbit-waves" filter="url(#runtimeWaveHaze)">
                  <path d="M58 140A306 111 0 0 1 284 43" />
                  <path d="M337 44.4A298 106 0 0 1 591.3 81.9" />
                  <path d="M654.3 111.7A310 112 0 0 1 631.5 206" />
                  <path d="M510.5 240.1A295 104 0 0 1 173.4 229.7" />
                  <path d="M155.2 190A240 80 0 0 1 137.4 122.6" />
                  <path d="M363 218A150 50 0 0 1 233.1 193" />
                  <path d="M443 113.2A160 54 0 0 1 520.6 150.6" />
                  <path d="M75.5 112A306 111 0 0 1 166.3 65" />
                  <path d="M567.8 202.5A250 88 0 0 1 427.7 237" />
                </g>
                <g class="runtime-orbit-glow" filter="url(#runtimeSpveSmallGlow)">
                  <ellipse cx="363" cy="146" rx="321" ry="121" />
                  <ellipse cx="363" cy="150" rx="290" ry="102" />
                  <ellipse cx="363" cy="160" rx="215" ry="70" />
                </g>
                <g class="runtime-orbit-field">
                  <ellipse class="runtime-orbit-major" cx="364" cy="145.5" rx="326" ry="120.5" />
                  <ellipse cx="363" cy="150" rx="290" ry="102" />
                  <ellipse cx="363" cy="154" rx="251" ry="84" />
                  <ellipse class="runtime-orbit-dashed" cx="363" cy="160" rx="215" ry="70" />
                  <ellipse cx="363" cy="166" rx="178" ry="53" />
                  <ellipse class="runtime-orbit-core" cx="363" cy="172" rx="128" ry="43" />
                  <path
                    d="M42 195C151 108 286 77 430 85c111 6 197 43 254 109M59 229c118-83 244-98 368-76 96 17 177 53 236 108M103 91c114 55 202 70 319 57 97-11 168-3 243 35"
                  />
                  <path
                    class="runtime-orbit-faint"
                    d="M37 174C154 139 284 122 431 130c112 6 202 30 263 67M76 258c126-51 253-63 378-45 87 13 156 35 201 65M152 58c80 57 177 90 286 87 92-3 166 9 229 48"
                  />
                  <path
                    class="runtime-orbit-partial"
                    d="M116 196c67 51 184 69 284 55 64-9 117-30 159-56M171 90c83-30 192-35 281-7 55 17 99 47 119 79"
                  />
                  <path
                    class="runtime-orbit-near"
                    d="M76 232c110 63 258 72 383 43 64-15 119-41 161-73M115 204c79 42 190 57 289 42 53-8 101-25 139-48"
                  />
                </g>
                <g class="runtime-orbit-stars">
                  <circle cx="47" cy="174" r=".7" />
                  <circle cx="71" cy="209" r="1" />
                  <circle cx="84" cy="139" r=".65" />
                  <circle cx="105" cy="252" r=".8" />
                  <circle cx="125" cy="78" r="1.4" />
                  <circle cx="145" cy="184" r=".65" />
                  <circle cx="166" cy="110" r=".8" />
                  <circle cx="181" cy="257" r=".6" />
                  <circle cx="207" cy="236" r="1" />
                  <circle cx="226" cy="151" r=".65" />
                  <circle cx="244" cy="286" r=".75" />
                  <circle cx="260" cy="112" r=".6" />
                  <circle cx="277" cy="87" r="1.5" />
                  <circle cx="296" cy="202" r=".8" />
                  <circle cx="318" cy="67" r=".65" />
                  <circle cx="338" cy="252" r=".8" />
                  <circle cx="353" cy="109" r=".55" />
                  <circle cx="373" cy="283" r="1.1" />
                  <circle cx="391" cy="78" r=".7" />
                  <circle cx="413" cy="226" r=".65" />
                  <circle cx="431" cy="117" r=".8" />
                  <circle cx="447" cy="48" r="1.2" />
                  <circle cx="468" cy="273" r=".7" />
                  <circle cx="489" cy="160" r=".55" />
                  <circle cx="506" cy="94" r=".75" />
                  <circle cx="523" cy="226" r="1.4" />
                  <circle cx="544" cy="133" r=".65" />
                  <circle cx="569" cy="72" r="1" />
                  <circle cx="586" cy="187" r=".75" />
                  <circle cx="603" cy="240" r=".65" />
                  <circle cx="618" cy="265" r="1.5" />
                  <circle cx="636" cy="99" r=".7" />
                  <circle cx="657" cy="132" r="1.1" />
                  <circle cx="674" cy="220" r=".65" />
                </g>
                <g class="runtime-orbit-dust">
                  <circle cx="39" cy="142" r=".38" />
                  <circle cx="53" cy="217" r=".52" />
                  <circle cx="68" cy="103" r=".34" />
                  <circle cx="82" cy="236" r=".45" />
                  <circle cx="97" cy="61" r=".42" />
                  <circle cx="113" cy="194" r=".31" />
                  <circle cx="131" cy="122" r=".47" />
                  <circle cx="147" cy="247" r=".39" />
                  <circle cx="159" cy="44" r=".34" />
                  <circle cx="173" cy="205" r=".52" />
                  <circle cx="188" cy="95" r=".37" />
                  <circle cx="202" cy="279" r=".46" />
                  <circle cx="218" cy="134" r=".31" />
                  <circle cx="231" cy="56" r=".43" />
                  <circle cx="247" cy="219" r=".35" />
                  <circle cx="264" cy="165" r=".49" />
                  <circle cx="279" cy="291" r=".4" />
                  <circle cx="292" cy="119" r=".32" />
                  <circle cx="306" cy="39" r=".46" />
                  <circle cx="321" cy="233" r=".36" />
                  <circle cx="335" cy="145" r=".52" />
                  <circle cx="349" cy="298" r=".38" />
                  <circle cx="365" cy="61" r=".31" />
                  <circle cx="381" cy="245" r=".47" />
                  <circle cx="396" cy="129" r=".36" />
                  <circle cx="411" cy="43" r=".51" />
                  <circle cx="425" cy="285" r=".33" />
                  <circle cx="439" cy="179" r=".44" />
                  <circle cx="454" cy="103" r=".39" />
                  <circle cx="469" cy="260" r=".5" />
                  <circle cx="485" cy="51" r=".35" />
                  <circle cx="499" cy="202" r=".42" />
                  <circle cx="515" cy="151" r=".31" />
                  <circle cx="531" cy="293" r=".46" />
                  <circle cx="547" cy="116" r=".38" />
                  <circle cx="562" cy="37" r=".51" />
                  <circle cx="578" cy="221" r=".34" />
                  <circle cx="593" cy="158" r=".48" />
                  <circle cx="609" cy="290" r=".37" />
                  <circle cx="624" cy="73" r=".44" />
                  <circle cx="640" cy="190" r=".32" />
                  <circle cx="653" cy="244" r=".5" />
                  <circle cx="668" cy="111" r=".36" />
                  <circle cx="684" cy="169" r=".43" />
                  <circle cx="92" cy="158" r=".31" />
                  <circle cx="153" cy="157" r=".36" />
                  <circle cx="210" cy="178" r=".43" />
                  <circle cx="252" cy="104" r=".31" />
                  <circle cx="301" cy="265" r=".48" />
                  <circle cx="414" cy="210" r=".35" />
                  <circle cx="474" cy="145" r=".42" />
                  <circle cx="538" cy="247" r=".31" />
                  <circle cx="612" cy="205" r=".45" />
                  <circle cx="692" cy="147" r=".34" />
                  <circle cx="118" cy="178" r=".3" />
                  <circle cx="142" cy="210" r=".42" />
                  <circle cx="178" cy="138" r=".34" />
                  <circle cx="193" cy="223" r=".29" />
                  <circle cx="235" cy="188" r=".4" />
                  <circle cx="273" cy="143" r=".31" />
                  <circle cx="316" cy="179" r=".36" />
                  <circle cx="389" cy="189" r=".3" />
                  <circle cx="426" cy="151" r=".42" />
                  <circle cx="457" cy="222" r=".33" />
                  <circle cx="497" cy="182" r=".29" />
                  <circle cx="528" cy="199" r=".38" />
                  <circle cx="566" cy="173" r=".31" />
                  <circle cx="603" cy="194" r=".4" />
                  <circle cx="631" cy="154" r=".28" />
                </g>
                <g class="runtime-inner-dust">
                  <circle cx="250" cy="145" r=".36" />
                  <circle cx="274" cy="161" r=".48" />
                  <circle cx="299" cy="126" r=".32" />
                  <circle cx="324" cy="181" r=".42" />
                  <circle cx="344" cy="137" r=".3" />
                  <circle cx="381" cy="149" r=".44" />
                  <circle cx="405" cy="125" r=".34" />
                  <circle cx="430" cy="167" r=".51" />
                  <circle cx="454" cy="146" r=".33" />
                  <circle cx="475" cy="181" r=".4" />
                  <circle cx="282" cy="195" r=".38" />
                  <circle cx="315" cy="215" r=".5" />
                  <circle cx="350" cy="202" r=".32" />
                  <circle cx="395" cy="218" r=".43" />
                  <circle cx="438" cy="198" r=".35" />
                </g>
                <g class="runtime-orbit-beads">
                  <circle cx="216" cy="43" r="1" />
                  <circle cx="252" cy="33" r=".7" />
                  <circle cx="309" cy="26" r=".8" />
                  <circle cx="397" cy="26" r=".65" />
                  <circle cx="457" cy="35" r="1.15" />
                  <circle cx="571" cy="67" r=".7" />
                  <circle cx="49" cy="207" r=".75" />
                  <circle cx="73" cy="238" r="1" />
                  <circle cx="166" cy="293" r=".8" />
                  <circle cx="224" cy="312" r=".65" />
                  <circle cx="342" cy="323" r=".95" />
                  <circle cx="397" cy="322" r=".7" />
                  <circle cx="480" cy="307" r="1" />
                  <circle cx="637" cy="252" r=".75" />
                  <circle cx="683" cy="186" r=".65" />
                  <circle cx="164" cy="107" r=".7" />
                  <circle cx="204" cy="230" r=".8" />
                  <circle cx="248" cy="117" r=".65" />
                  <circle cx="472" cy="111" r=".85" />
                  <circle cx="533" cy="224" r=".7" />
                  <circle cx="590" cy="148" r=".65" />
                  <circle cx="108" cy="219" r=".55" />
                  <circle cx="144" cy="244" r=".82" />
                  <circle cx="186" cy="258" r=".48" />
                  <circle cx="236" cy="276" r=".7" />
                  <circle cx="279" cy="283" r=".46" />
                  <circle cx="321" cy="286" r=".9" />
                  <circle cx="367" cy="283" r=".52" />
                  <circle cx="414" cy="275" r=".74" />
                  <circle cx="459" cy="265" r=".5" />
                  <circle cx="501" cy="246" r=".8" />
                  <circle cx="539" cy="226" r=".46" />
                  <circle cx="218" cy="213" r=".65" />
                  <circle cx="269" cy="226" r=".44" />
                  <circle cx="447" cy="221" r=".68" />
                  <circle cx="487" cy="207" r=".5" />
                </g>

                <ellipse
                  class="runtime-artifact-aura"
                  cx="371"
                  cy="148"
                  rx="112"
                  ry="96"
                  fill="url(#runtimeSpveArtifactAura)"
                  filter="url(#runtimeSpveSoftGlow)"
                />
                <g class="runtime-hologram-platform" filter="url(#runtimeSpvePlatformDepth)">
                  <ellipse class="runtime-platform-shadow" cx="371.5" cy="209" rx="126" ry="25" />
                  <path
                    class="runtime-platform-side"
                    d="M278.5 187.3 371.5 206.2V217.5L278.5 198.6Z"
                  />
                  <path
                    class="runtime-platform-front"
                    d="M371.5 206.2 460.5 185.4V196.7L371.5 217.5Z"
                  />
                  <path
                    class="runtime-platform-top"
                    fill="url(#runtimeSpvePlatform)"
                    d="M278.5 187.3 371.5 168 460.5 185.4 371.5 206.2Z"
                  />
                  <path
                    class="runtime-platform-inset"
                    d="M308 187.2 371.5 173.6 432.5 185.7 371.5 199.8Z"
                  />
                  <path
                    class="runtime-platform-pad"
                    d="M342 187.2 371.5 181 400.5 186.6 371.5 193.3Z"
                  />
                  <path
                    class="runtime-platform-circuit"
                    d="M342 187.2l-24 .4m82.5-1 26-.5M371.5 193.3v6.5m0-25.8v7"
                  />
                  <ellipse
                    class="runtime-platform-emitter-glow"
                    cx="371.5"
                    cy="187.3"
                    rx="16"
                    ry="5.8"
                    filter="url(#runtimeSpveSmallGlow)"
                  />
                  <circle class="runtime-platform-spark" cx="435" cy="196.5" r="1" />
                </g>

                <g class="runtime-sharepoint-cube" filter="url(#runtimeSpveCubeDepth)">
                  <ellipse class="runtime-cube-orbit" cx="371.5" cy="131.5" rx="64" ry="18" />
                  <ellipse
                    class="runtime-cube-orbit runtime-cube-orbit-echo"
                    cx="371.5"
                    cy="132"
                    rx="52"
                    ry="14"
                  />
                  <path class="runtime-hologram-beam" d="M371.5 163.5V187" />
                  <ellipse
                    class="runtime-cube-haze"
                    cx="367"
                    cy="130"
                    rx="27"
                    ry="23"
                    fill="url(#runtimeSpveNodeGlow)"
                  />
                  <g class="runtime-sharepoint-mark">
                    <g class="runtime-sharepoint-cloud">
                      <circle
                        class="runtime-sharepoint-lobe runtime-sharepoint-lobe-top"
                        cx="365.81"
                        cy="121.65"
                        r="20.4"
                      />
                      <circle
                        class="runtime-sharepoint-lobe runtime-sharepoint-lobe-right"
                        cx="392.16"
                        cy="142.56"
                        r="17.85"
                      />
                      <circle
                        class="runtime-sharepoint-lobe runtime-sharepoint-lobe-lower"
                        cx="371.76"
                        cy="160.24"
                        r="15.98"
                      />
                    </g>
                    <rect
                      class="runtime-sharepoint-mark-panel"
                      fill="url(#runtimeSpveMarkPanel)"
                      x="334.36"
                      y="117.4"
                      width="35.7"
                      height="37.4"
                      rx="5.95"
                    />
                    <path
                      class="runtime-sharepoint-s"
                      transform="translate(352.21 136.44) scale(1.615) translate(-352.5 -208.9)"
                      d="M356.8 202.3C354.8 200.9 350.5 200.7 348.2 202.2C345.8 203.8 346.2 206.6 349.2 208.1L353.4 210C354.6 210.6 354.9 211.6 354.1 212.5C353 213.7 350.5 213.2 348.5 211.4L345.9 214.4C348.8 217.2 353.5 218.1 356.7 215.7C359.5 213.6 359 210 355.5 208.3L351.3 206.4C350.2 205.9 350 205.1 350.7 204.4C351.8 203.4 354.1 203.8 355.6 205Z"
                    />
                  </g>
                </g>

                <!-- One shared caption rule: centered at an equal distance beneath every mark. -->
                <g
                  class="runtime-orbit-node runtime-orbit-node-host"
                  transform="translate(130 58) scale(1.95)"
                >
                  <ellipse class="runtime-node-base" cx="0" cy="15" rx="23" ry="5.5" />
                  <use href="#runtimeHostSelfHosted" x="-9" y="-9" width="18" height="18" />
                  <line class="runtime-node-tether" x1="0" y1="9" x2="0" y2="11.5" />
                  <text class="runtime-node-label" x="0" y="15.5" text-anchor="middle">
                    <tspan x="0" y="15.5">Custom</tspan>
                    <tspan x="0" dy="7.2">Provider</tspan>
                  </text>
                </g>
                <g
                  class="runtime-orbit-node runtime-orbit-node-host"
                  transform="translate(236 105) scale(1.95)"
                >
                  <ellipse class="runtime-node-base" cx="0" cy="15" rx="23" ry="5.5" />
                  <use href="#runtimeHostCloudflare" x="-9" y="-9" width="18" height="18" />
                  <line class="runtime-node-tether" x1="0" y1="9" x2="0" y2="11.5" />
                  <text class="runtime-node-label" x="0" y="15.5" text-anchor="middle">
                    Cloudflare
                  </text>
                </g>
                <g
                  class="runtime-orbit-node runtime-orbit-node-host"
                  transform="translate(74 150) scale(1.95)"
                >
                  <ellipse class="runtime-node-base" cx="0" cy="15" rx="23" ry="5.5" />
                  <use href="#runtimeHostNetlify" x="-9" y="-9" width="18" height="18" />
                  <line class="runtime-node-tether" x1="0" y1="9" x2="0" y2="11.5" />
                  <text class="runtime-node-label" x="0" y="15.5" text-anchor="middle">
                    Netlify
                  </text>
                </g>
                <g
                  class="runtime-orbit-node runtime-orbit-node-host"
                  transform="translate(229 246) scale(1.95)"
                >
                  <ellipse class="runtime-node-base" cx="0" cy="15" rx="23" ry="5.5" />
                  <use href="#runtimeHostFly" x="-9" y="-9" width="18" height="18" />
                  <line class="runtime-node-tether" x1="0" y1="9" x2="0" y2="11.5" />
                  <text class="runtime-node-label" x="0" y="15.5" text-anchor="middle">Fly.io</text>
                </g>
                <g
                  class="runtime-orbit-node runtime-orbit-node-host"
                  transform="translate(370 260) scale(1.95)"
                >
                  <ellipse class="runtime-node-base" cx="0" cy="15" rx="23" ry="5.5" />
                  <use href="#runtimeHostSharePoint" x="-9" y="-9" width="18" height="18" />
                  <line class="runtime-node-tether" x1="0" y1="9" x2="0" y2="11.5" />
                  <text class="runtime-node-label" x="0" y="15.5" text-anchor="middle">
                    <tspan x="0" y="15.5">SharePoint</tspan>
                    <tspan x="0" dy="7.2">WebPart</tspan>
                  </text>
                </g>
                <g
                  class="runtime-orbit-node runtime-orbit-node-host"
                  transform="translate(615 200) scale(1.95)"
                >
                  <ellipse class="runtime-node-base" cx="0" cy="15" rx="23" ry="5.5" />
                  <use href="#runtimeHostDigitalOcean" x="-9" y="-9" width="18" height="18" />
                  <line class="runtime-node-tether" x1="0" y1="9" x2="0" y2="11.5" />
                  <text class="runtime-node-label" x="0" y="15.5" text-anchor="middle">
                    DigitalOcean
                  </text>
                </g>
                <g
                  class="runtime-orbit-node runtime-orbit-node-host"
                  transform="translate(539 31) scale(1.95)"
                >
                  <ellipse class="runtime-node-base" cx="0" cy="15" rx="23" ry="5.5" />
                  <use href="#runtimeHostDeno" x="-9" y="-9" width="18" height="18" />
                  <line class="runtime-node-tether" x1="0" y1="9" x2="0" y2="11.5" />
                  <text class="runtime-node-label" x="0" y="15.5" text-anchor="middle">
                    Deno Deploy
                  </text>
                </g>
                <g
                  class="runtime-orbit-node runtime-orbit-node-host"
                  transform="translate(287 17) scale(1.95)"
                >
                  <ellipse class="runtime-node-base" cx="0" cy="15" rx="23" ry="5.5" />
                  <use href="#runtimeHostAzure" x="-9" y="-9" width="18" height="18" />
                  <line class="runtime-node-tether" x1="0" y1="9" x2="0" y2="11.5" />
                  <text class="runtime-node-label" x="0" y="15.5" text-anchor="middle">Azure</text>
                </g>
                <g
                  class="runtime-orbit-node runtime-orbit-node-host"
                  transform="translate(415 42) scale(1.95)"
                >
                  <ellipse class="runtime-node-base" cx="0" cy="15" rx="23" ry="5.5" />
                  <use href="#runtimeHostVercel" x="-9" y="-9" width="18" height="18" />
                  <line class="runtime-node-tether" x1="0" y1="9" x2="0" y2="11.5" />
                  <text class="runtime-node-label" x="0" y="15.5" text-anchor="middle">Vercel</text>
                </g>
                <g
                  class="runtime-orbit-node runtime-orbit-node-host"
                  transform="translate(158 176) scale(1.95)"
                >
                  <ellipse class="runtime-node-base" cx="0" cy="15" rx="23" ry="5.5" />
                  <use href="#runtimeHostAmplify" x="-9" y="-9" width="18" height="18" />
                  <line class="runtime-node-tether" x1="0" y1="9" x2="0" y2="11.5" />
                  <text class="runtime-node-label" x="0" y="15.5" text-anchor="middle">
                    AWS Amplify
                  </text>
                </g>
                <g
                  class="runtime-orbit-node runtime-orbit-node-host"
                  transform="translate(502 248) scale(1.95)"
                >
                  <ellipse class="runtime-node-base" cx="0" cy="15" rx="23" ry="5.5" />
                  <use href="#runtimeHostFirebase" x="-9" y="-9" width="18" height="18" />
                  <line class="runtime-node-tether" x1="0" y1="9" x2="0" y2="11.5" />
                  <text class="runtime-node-label" x="0" y="15.5" text-anchor="middle">
                    Firebase
                  </text>
                </g>
                <g
                  class="runtime-orbit-node runtime-orbit-node-host"
                  transform="translate(650 117) scale(1.95)"
                >
                  <ellipse class="runtime-node-base" cx="0" cy="15" rx="23" ry="5.5" />
                  <use href="#runtimeHostRender" x="-9" y="-9" width="18" height="18" />
                  <line class="runtime-node-tether" x1="0" y1="9" x2="0" y2="11.5" />
                  <text class="runtime-node-label" x="0" y="15.5" text-anchor="middle">Render</text>
                </g>
                <g
                  class="runtime-orbit-node runtime-orbit-node-host"
                  transform="translate(553 127) scale(1.95)"
                >
                  <ellipse class="runtime-node-base" cx="0" cy="15" rx="23" ry="5.5" />
                  <use href="#runtimeHostHetzner" x="-9" y="-9" width="18" height="18" />
                  <line class="runtime-node-tether" x1="0" y1="9" x2="0" y2="11.5" />
                  <text class="runtime-node-label" x="0" y="15.5" text-anchor="middle">
                    Hetzner
                  </text>
                </g>
              </svg>
              <strong class="runtime-infra-label-spve">
                <i class="literal-check" aria-hidden="true" />
                <span>Pack and run as regular WebPart across MS 365+</span>
              </strong>
              <strong class="runtime-infra-label-spve">
                <i class="literal-check" aria-hidden="true" />
                <span>Deploy as standalone web app</span>
              </strong>
              <strong class="runtime-infra-label-spve">
                <i class="literal-check" aria-hidden="true" />
                <span>Same API and access to MS 365+ everywhere</span>
              </strong>
            </div>
          </section>

          <section class="runtime-surface runtime-surface-classic">
            <ComparisonParty label="Classic SPFx" />
            <h3>Inside Microsoft products only</h3>
            <div class="runtime-infra-scene runtime-infra-scene-classic">
              <svg viewBox="0 0 520 320" aria-hidden="true">
                <defs>
                  <linearGradient id="runtimeClassicPluginSurface" x1="0" y1="0" x2="1" y2="1">
                    <stop stop-color="#38202c" />
                    <stop offset="1" stop-color="#2a1a24" />
                  </linearGradient>
                  <radialGradient id="runtimeClassicSceneGlow">
                    <stop stop-color="#db6485" stop-opacity=".26" />
                    <stop offset=".5" stop-color="#8f3e57" stop-opacity=".09" />
                    <stop offset="1" stop-color="#150f16" stop-opacity="0" />
                  </radialGradient>
                  <filter
                    id="runtimeClassicSoftGlow"
                    x="-100%"
                    y="-100%"
                    width="300%"
                    height="300%"
                  >
                    <feGaussianBlur stdDeviation="10" />
                  </filter>
                </defs>
                <ellipse
                  class="runtime-classic-scene-glow"
                  fill="url(#runtimeClassicSceneGlow)"
                  cx="260"
                  cy="192"
                  rx="210"
                  ry="126"
                  filter="url(#runtimeClassicSoftGlow)"
                />
                <g class="runtime-classic-browser-shell">
                  <rect x="55" y="36" width="410" height="226" rx="17" />
                  <path d="M55 79h410M104 79v183" />
                  <path class="runtime-classic-browser-address" d="M128 54h302" />
                  <circle cx="92" cy="58" r="3" />
                  <circle cx="104" cy="58" r="3" />
                  <circle cx="116" cy="58" r="3" />
                  <circle class="runtime-classic-nav-active" cx="80" cy="105" r="10" />
                  <path
                    class="runtime-classic-nav-lines"
                    d="M70 137h20M70 158h20M70 179h20M70 200h20"
                  />
                  <g class="runtime-classic-sharepoint-mini" transform="translate(77 58)">
                    <circle cx="5" cy="0" r="8" />
                    <circle cx="11" cy="6" r="7" />
                    <path d="M-8-9 4-6v20l-12-3Z" />
                    <text x="-2" y="5" text-anchor="middle">S</text>
                  </g>
                </g>

                <g
                  class="runtime-classic-plugin"
                  aria-hidden="true"
                  transform="translate(214.5 102) scale(5.6)"
                >
                  <path
                    class="runtime-classic-plugin-face"
                    fill="url(#runtimeClassicPluginSurface)"
                    d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"
                    vector-effect="non-scaling-stroke"
                  />
                </g>
              </svg>
              <strong class="runtime-infra-label-single">
                <i class="literal-cross" aria-hidden="true" />
                <span>Tied to MS 365+ platforms only</span>
              </strong>
            </div>
          </section>
        </div>
      </article>

      <section id="quickstart" class="experience-quickstart" data-modern-reveal>
        <span class="showcase-number"><span>One command</span> is all it takes</span>
        <h2>Quick start</h2>

        <div class="quickstart-command">
          <span aria-hidden="true">$</span>
          <code><strong>npm</strong> init sp</code>
          <button
            type="button"
            :class="{ 'is-copied': commandCopied }"
            :aria-label="commandCopied ? 'Copied npm init sp' : 'Copy npm init sp'"
            :title="commandCopied ? 'Copied' : 'Copy command'"
            @click="copyInitCommand"
          >
            <svg v-if="commandCopied" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m3.5 8.4 2.8 2.8 6.2-6.4" />
            </svg>
            <svg v-else viewBox="0 0 16 16" aria-hidden="true">
              <rect x="5.2" y="4.8" width="7.2" height="7.2" rx="1.3" />
              <path
                d="M10.6 4.8V3.9a1.3 1.3 0 0 0-1.3-1.3H3.9a1.3 1.3 0 0 0-1.3 1.3v5.4a1.3 1.3 0 0 0 1.3 1.3h1.3"
              />
            </svg>
          </button>
        </div>
        <p class="quickstart-hint">
          Create a project, choose your framework, and start developing for SharePoint.
        </p>
      </section>
    </div>
  </section>
</template>
