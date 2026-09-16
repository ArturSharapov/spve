import { getSpveContext } from './svelte.mjs'

export function getSpContext() {
  const context = getSpveContext()
  if (!context) throw new Error('SPVE: add withContext() to defineSvelteApp()')
  return context
}
