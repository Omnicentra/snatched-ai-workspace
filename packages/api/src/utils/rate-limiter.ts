import { LRUCache } from 'lru-cache';

interface RateLimiterConfig {
  maxQueueSize: number;
  cacheSize: number;
}

type CacheValue = Record<string, unknown>;

class RateLimiter {
  private readonly capacity: number;
  private tokens: number;
  private readonly queue: { fn: () => Promise<unknown>; cacheKey: string; resolve: (v: unknown) => void; reject: (e: unknown) => void }[];
  private readonly refillIntervalMs: number;
  private readonly cache: LRUCache<string, CacheValue>;
  private readonly refillTimer: ReturnType<typeof setInterval>;

  constructor(config: RateLimiterConfig) {
    this.capacity = config.maxQueueSize;
    this.tokens = this.capacity;
    this.cache = new LRUCache<string, CacheValue>({
      max: config.cacheSize,
      ttl: 1000 * 60 * 60, // Cache for 1 hour
    });
    this.queue = [];
    this.refillIntervalMs = 60000 / this.capacity;
    this.refillTimer = setInterval(() => this.refillAndDispatch(), this.refillIntervalMs);
  }



  private refillAndDispatch() {
    if (this.tokens < this.capacity) {
      this.tokens++;
    }
    if (this.tokens > 0 && this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) return;
      this.tokens--;
      job.fn()
        .then(res => {
          this.cache.set(job.cacheKey, { value: res });
          job.resolve(res);
        })
        .catch(err => {
          const error = err instanceof Error ? err : new Error(String(err));
          job.reject(error);
        });
    }
  }

  /**
   * Schedule a call to `fn(...args)` under the rate limit.
   * Returns a Promise matching `fn`'s return type.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enqueue<Fn extends (...args: any[]) => Promise<any>>(
    fn: Fn,
    ...args: Parameters<Fn>
  ): ReturnType<Fn> {
    const cacheKey = JSON.stringify({ fn: fn.toString(), args });
    const cached = this.cache.get(cacheKey);
    if (cached) {
      // cached.value is the resolved value; wrap back into Promise<...>
      return Promise.resolve(
        cached.value as Awaited<ReturnType<Fn>>
      ) as ReturnType<Fn>;
    }

    const executor = (
      resolve: (value: Awaited<ReturnType<Fn>>) => void,
      reject: (reason?: unknown) => void
    ) => {
      const task = () => fn(...args);
      if (this.tokens > 0) {
        this.tokens--;
        task()
          .then((res) => {
            this.cache.set(cacheKey, { value: res });
            resolve(res as Awaited<ReturnType<Fn>>);
          })
          .catch((err) => {
            const error = err instanceof Error ? err : new Error(String(err));
            reject(error);
          });
      } else {
        if (this.queue.length >= this.capacity) {
          reject(new Error('Rate limiter queue is full'));
        } else {
          this.queue.push({
            fn: task,
            cacheKey,
            resolve: resolve as (v: unknown) => void,
            reject: reject as (e: unknown) => void,
          });
        }
      }
    };

    return new Promise<Awaited<ReturnType<Fn>>>(executor) as ReturnType<Fn>;
  }
}

// Create instances for Gemini and OpenAI
export const geminiVisionQueue = new RateLimiter({
  maxQueueSize: 10,
  cacheSize: 1000,
});

export const openaiImageQueue = new RateLimiter({
  maxQueueSize: 5,
  cacheSize: 1000,
}); 