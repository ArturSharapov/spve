import type { ContextId } from '@builder.io/qwik'
import type { WebPartContext } from 'spve/context'

export const SpContext: ContextId<WebPartContext | undefined>
export function useSpContext(): WebPartContext
