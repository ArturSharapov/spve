import { useSpveContext } from './vue.mjs'

export function useSpContext() {
  const context = useSpveContext()
  if (!context) throw new Error('SPVE: add withContext() to defineVueApp()')
  return context
}
