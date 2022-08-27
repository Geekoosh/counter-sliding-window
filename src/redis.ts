import Redis, { Callback, RedisOptions, Result } from 'ioredis';
import { SlidingWindowCounter } from './counter';

export interface RedisConfig {
  port?: number;
  host?: string;
  options?: RedisOptions;
}

declare module 'ioredis' {
  interface RedisCommander<Context> {
    streamCounterAdd(
      key: string,
      windowMs: string,
      count: string,
      messageId: string,
      limit: string,
      callback?: Callback<string>
    ): Result<string, Context>;

    streamCounterGet(
      key: string,
      windowMs: string,
      callback?: Callback<string>
    ): Result<string, Context>;
  }
}

export class SlidingWindowCounterRedis implements SlidingWindowCounter {
  private bucketInMS: number;
  private periodInMS: number;
  private redis!: Redis;

  constructor(
    private counterName: string,
    private period: number,
    private bucketBy: 'seconds' | 'minutes' | 'hours',
    config: RedisConfig = {}
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
    this.configureRedis(config);
  }

  private configureRedis(config: RedisConfig) {
    const { host = 'localhost', port = 6379, options } = config;
    this.redis = options
      ? new Redis(port, host, options)
      : new Redis(port, host);
    this.createCounterScript();
  }

  private createCounterScript() {
    this.redis.defineCommand('streamCounterAdd', {
      numberOfKeys: 1,
      lua: `
        local now = redis.call('TIME')
        local start_window = tonumber(now[1]) - tonumber(ARGV[1])
        local range = redis.call('XRANGE', KEYS[1], start_window, '+')
        local count = 0;
        for _, item in ipairs(range) do
          count = count + tonumber(item[2][2])
        end

        if tonumber(ARGV[4]) > 0 and count >= ARGV[4] then
          return -1
        end
        redis.call('XADD', KEYS[1], 'MINID', '~', start_window, ARGV[3], 'count', ARGV[2])
        redis.call('EXPIRE', KEYS[1], ARGV[1])
        return 1
      `
    });

    this.redis.defineCommand('streamCounterGet', {
      numberOfKeys: 1,
      lua: `
        local now = redis.call('TIME')
        local start_window = tonumber(now[1]) - tonumber(ARGV[1])
        local range = redis.call('XRANGE', KEYS[1], start_window, '+')
        local count = 0;
        for _, item in ipairs(range) do
          count = count + tonumber(item[2][2])
        end
        return count
      `
    });
  }

  private counterId() {
    return '*';
  }

  async add(count: number): Promise<number> {
    const res = await this.redis.streamCounterAdd(
      this.counterName,
      `${this.periodInMS}`,
      `${count}`,
      this.counterId(),
      '0'
    );
    return parseInt(res);
  }

  async get(): Promise<number> {
    const count = await this.redis.streamCounterGet(
      this.counterName,
      `${this.periodInMS}`
    );
    return parseInt(count);
  }
}
