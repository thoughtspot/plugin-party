export function runPluginFn(isPowerpoint, run, fn, fnName, ...args) {
  if (isPowerpoint) {
    return fn(...args);
  }
  return run(fnName, ...args);
}
