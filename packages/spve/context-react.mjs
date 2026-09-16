import { useSpveContext } from './react.mjs'

export function useSpContext() {
  const context = useSpveContext()
  if (!context) throw new Error('SPVE: add withContext() to defineReactApp()')
  return context
}
