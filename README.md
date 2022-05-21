# counter-sliding-window

[![Build Status](https://github.com/Geekoosh/counter-sliding-window/workflows/tests/badge.svg)](https://github.com/Geekoosh/counter-sliding-window/actions?query=workflow%3A%22tests%22)

Sliding window counter implementation.
Supports bucketing counts by seconds, minutes and hours

## Installation

```bash
npm install counter-sliding-window
```

## Usage

```ts
import { SlidingWindowCounter } from 'counter-sliding-window';

const sliding = new SlidingWindowCounter(5, 'seconds');
sliding.windowStart();
// [Time 0]
sliding.add(1);
// After 3 seconds [Time 3]
sliding.add(2);

// After 1 more second [Time 4]
console.log(sliding.get()) // prints 3

// After 3 more seconds [Time 7]
console.log(sliding.get()) // prints 2

// After 2 more seconds [Time 9]
console.log(sliding.get()) // prints 0
```