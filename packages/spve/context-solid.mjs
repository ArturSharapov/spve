import { useSpveContext } from './solid.mjs'

export function useSpContext() {
  const context = useSpveContext()
  if (!context) throw new Error('SPVE: add withContext() to defineSolidApp()')
  return context
}
