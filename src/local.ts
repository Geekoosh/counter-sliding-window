import { SlidingWindowCounter } from './counter';

export class SlidingWindowCounterLocal implements SlidingWindowCounter {
  private counters = new Map<number, number>();
  private bucketInMS: number;
  private periodInMS: number;

  constructor(
    private period: number,
    private bucketBy: 'seconds' | 'minutes' | 'hours'
  ) {
    switch (this.bucketBy) {
      case 'seconds':
        this.bucketInMS = 1000;
        break;
      case 'minutes':
        this.bucketInMS = 60 * 1000;
        break;
      case 'hours':
        this.bucketInMS = 60 * 60 * 1000;
        break;
    }
    this.periodInMS = period * this.bucketInMS;
  }

  private getCounter(ms: number): number {
    return Math.floor(ms / this.bucketInMS) * this.bucketInMS;
  }

  private windowStart(now: number = Date.now()): number {
    return now - this.periodInMS;
  }

  private clearValues(now: number) {
    const start = this.windowStart(now);
    for (const counter of this.counters) {
      if (counter[0] < start) {
        this.counters.delete(counter[0]);
      }
    }
  }

  add(count: number): number {
    const now = Date.now();
    this.clearValues(now);
    const counter = this.getCounter(now);
    const currCounterValue = this.counters.get(counter) || 0;
    this.counters.set(counter, count + currCounterValue);
    return 0;
  }

  get(): number {
    const now = Date.now();
    this.clearValues(now);
    let sum = 0;
    for (const counter of this.counters) {
      sum += counter[1];
    }
    return sum;
  }
}
