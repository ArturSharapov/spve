import { SpContext, useSpveContext } from './qwik.mjs'

export { SpContext }

export function useSpContext() {
  const context = useSpveContext()
  if (!context) throw new Error('SPVE: add withContext() to defineQwikApp()')
  return context
}
