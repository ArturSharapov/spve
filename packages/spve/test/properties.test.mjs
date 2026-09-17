import { expect, test } from 'vite-plus/test'
import { parseProperty } from '../properties.mjs'

test('parsers preserve inputs and reject promises and non-JSON output', () => {
  const saved = { views: [] }
  const parsed = parseProperty('settings', saved, (value) => {
    value.views.push('added')
    return value
  })
  expect(saved).toEqual({ views: [] })
  expect(parsed).toEqual({ views: ['added'] })
  expect(() =>
    parseProperty('settings', saved, async () => {
      throw new Error('async failure')
    }),
  ).toThrow(/synchronously/)
  for (const value of [Promise.resolve([]), undefined, NaN, new Map()]) {
    expect(() => parseProperty('settings', saved, () => value)).toThrow(
      /property settings.*synchronously/,
    )
  }
})
