export function isJsonValue(value, ancestors = new Set()) {
  if (value === null || ['string', 'boolean'].includes(typeof value)) return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value !== 'object' || ancestors.has(value)) return false
  if (!Array.isArray(value)) {
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return false
  }
  ancestors.add(value)
  const valid = Array.isArray(value)
    ? value.every((entry) => isJsonValue(entry, ancestors))
    : Object.values(value).every((entry) => isJsonValue(entry, ancestors))
  ancestors.delete(value)
  return valid
}

export function parseProperty(name, value, parser) {
  try {
    const parsed = parser(structuredClone(value))
    if (!isJsonValue(parsed))
      throw new Error('parser must synchronously return a JSON-compatible value')
    return parsed
  } catch (error) {
    throw new Error(`SPVE: property ${name}: ${error.message}`, { cause: error })
  }
}
