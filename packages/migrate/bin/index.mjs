#!/usr/bin/env node

import { styleText } from 'node:util'
import { migrateProject, parseArgs, printHelp } from '../lib/migrate.mjs'

const colors = Boolean(process.stdout.isTTY && !process.env.NO_COLOR)
const paint = (style, value) => (colors ? styleText(style, String(value)) : String(value))
const label = (value) => paint('dim', value.padEnd(12))
const command = (program, args) =>
  `${paint(['bold', 'magenta'], program)}${args ? ` ${paint('white', args)}` : ''}`

function shellQuote(value) {
  return /^[A-Za-z0-9_./@+-]+$/.test(value) ? value : `'${value.replaceAll("'", "'\\''")}'`
}

function renderResult(result) {
  const counts = { error: 0, warning: 0, info: 0 }
  for (const item of result.diagnostics) counts[item.severity]++
  const reviewColor = counts.error > 0 ? 'red' : counts.warning > 0 ? 'yellow' : 'green'
  const context = result.requiresSharePointContext
    ? 'SharePoint context enabled with withContext()'
    : 'No SharePoint context adapter required'
  const report =
    result.targetDisplay === '.'
      ? 'MIGRATION.md'
      : `${result.targetDisplay.replace(/[\\/]+$/, '')}/MIGRATION.md`
  const rows = [
    `${label('Web part')}${paint(['bold', 'white'], result.title)}`,
    `${label('Target')}${paint('cyan', result.targetDisplay)}`,
    `${label('Context')}${context}`,
    `${label('Review')}${paint(reviewColor, `${counts.error} errors · ${counts.warning} warnings · ${counts.info} info`)}`,
    `${label('Report')}${paint('dim', report)}`,
  ]

  process.stdout.write(
    [
      `${paint('green', '◇')}  ${paint(['bold', 'green'], 'Migration complete')}`,
      ...rows.map((row) => `${paint('gray', '│')}  ${row}`),
      paint('gray', '│'),
      `${paint('gray', '└')}  ${paint(['bold', 'cyan'], 'Next steps')}`,
      ...(result.targetDisplay === '.'
        ? []
        : [`   ${command('cd', shellQuote(result.targetDisplay))}`]),
      `   ${command('vp', 'i')}`,
      `   ${command('vp', 'dev -m sp')}`,
      '',
    ].join('\n'),
  )
}

try {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    printHelp()
    process.exit(0)
  }

  const result = migrateProject(options)
  renderResult(result)
} catch (error) {
  console.error(
    `${paint('red', '▲')}  ${paint(['bold', 'red'], 'Migration failed')}\n   ${error instanceof Error ? error.message : String(error)}`,
  )
  process.exit(1)
}
