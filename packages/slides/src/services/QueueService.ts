/**
 * Queue to manage sequential operations in PowerPoint.
 * Ensures that operations like image insertions are executed one after another
 * to prevent race conditions and unexpected behavior.
 */
let operationQueue = Promise.resolve();

const linksInQueue = new Set<string>();

/**
 * Queues an image operation if the link is not already in the queue.
 * If the link is already in the queue, does nothing.
 *
 * @param link - The image URL to check and queue
 * @param operation - Function that returns a promise with the operation to execute
 * @returns Promise that resolves with the operation's result
 */
export function enqueueUniqueLink<T>(
  link: string,
  operation: () => Promise<T>
) {
  // If link is already in the queue, don't add it again and do nothing
  if (linksInQueue.has(link)) {
    console.log(`Link already in queue: ${link}`);
    return undefined;
  }

  // Add link to the set
  linksInQueue.add(link);

  // Queue the operation and remove the link when done
  const queuedPromise = operationQueue.then(async () => {
    try {
      return await operation();
    } finally {
      linksInQueue.delete(link);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  operationQueue = queuedPromise.then(() => {});

  return queuedPromise;
}
