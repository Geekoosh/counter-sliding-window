export interface SlidingWindowCounter {
  add(count: number): Promise<number> | number;
  get(): Promise<number> | number;
}
