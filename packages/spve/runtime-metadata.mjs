const runtimes = new WeakMap()

export function registerStandaloneRuntime(sharepoint, runtime) {
  runtimes.set(sharepoint, runtime)
}

export function getStandaloneRuntime(sharepoint) {
  return runtimes.get(sharepoint)
}
