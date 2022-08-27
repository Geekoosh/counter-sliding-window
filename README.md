# counter-sliding-window

[![Build Status](https://github.com/Geekoosh/counter-sliding-window/workflows/tests/badge.svg)](https://github.com/Geekoosh/counter-sliding-window/actions?query=workflow%3A%22tests%22)
[![NPM Version](https://shields.io/npm/v/counter-sliding-window.svg?style=flat)](https://www.npmjs.org/package/counter-sliding-window)

Sliding window counter with in-memory counter implementation and distributed counter implementation using Redis streams.
Supports bucketing counts by seconds, minutes and hours.

## Installation

```bash
npm install counter-sliding-window
```

## Local

Local implementation maintains a sliding window counter in memory

### Usage

```ts
import { SlidingWindowCounterLocal } from 'counter-sliding-window';

const sliding = new SlidingWindowCounterLocal(5, 'seconds');
// [Time 0]
sliding.add(1);
// After 3 seconds [Time 3]
sliding.add(2);

// After 1 more second [Time 4]
console.log(sliding.get()); // prints 3

// After 3 more seconds [Time 7]
console.log(sliding.get()); // prints 2

// After 2 more seconds [Time 9]
console.log(sliding.get()); // prints 0
```

## Redis

The Redis implementation of the sliding window counter is suitable for counters in a distributed environment, for scenarios such as rate limiting.

**The implementation is based on Redis Streams and requires Redis version 6.2.0 and above.**

### Usage

```ts
import { SlidingWindowCounterRedis } from 'counter-sliding-window';

const sliding = new SlidingWindowCounterRedis('counter-key-name', 5, 'seconds');
// [Time 0]
await sliding.add(1);
// After 3 seconds [Time 3]
await sliding.add(2);

// After 1 more second [Time 4]
console.log(await sliding.get()); // prints 3

// After 3 more seconds [Time 7]
console.log(await sliding.get()); // prints 2

// After 2 more seconds [Time 9]
console.log(await sliding.get()); // prints 0
```
