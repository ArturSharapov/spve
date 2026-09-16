import { useSpveContext } from './preact.mjs'

export function useSpContext() {
  const context = useSpveContext()
  if (!context) throw new Error('SPVE: add withContext() to definePreactApp()')
  return context
}
