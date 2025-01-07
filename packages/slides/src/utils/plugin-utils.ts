export function runPluginFn(isPowerpoint, run, fn, ...args) {
  if (isPowerpoint) {
    return fn(...args);
  }
  return run(fn.name, ...args);
}
