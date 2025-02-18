/**
 * Queue to manage sequential operations in PowerPoint.
 * Ensures that operations like image insertions are executed one after another
 * to prevent race conditions and unexpected behavior.
 */
let operationQueue = Promise.resolve();

/**
 * Queues an operation to be executed after all previous operations complete.
 *
 * @param operation - Function that returns a promise with the operation to execute
 * @returns Promise that resolves with the operation's result
 */
export function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const queuedPromise = operationQueue.then(() => operation());

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  operationQueue = queuedPromise.then(() => {});

  return queuedPromise;
}
