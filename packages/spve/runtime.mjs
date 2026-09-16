export let sp

export function initializeSP(sharepoint) {
  sp ??= sharepoint
}

export function applyAppPlugins(app, plugins) {
  return plugins.reduceRight((current, plugin) => plugin(current), app)
}
