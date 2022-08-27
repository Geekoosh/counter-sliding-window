import { SlidingWindowCounterRedis } from '../src/index';
import { StartedTestContainer, GenericContainer } from 'testcontainers';
import Redis from 'ioredis';

describe('test sliding window with Redis', () => {
  let container: StartedTestContainer;
  let redisClient: Redis;

  async function redisNow(): Promise<number> {
    return (await redisClient.time())[0];
  }

  beforeAll(async () => {
    container = await new GenericContainer('redis')
      .withExposedPorts(6379)
      .start();
    redisClient = new Redis(container.getMappedPort(6379), container.getHost());
  }, 60000);

  afterAll(async () => {
    await redisClient.quit();
    await container.stop();
  });

  it('basically works', async () => {
    const sliding = new SlidingWindowCounterRedis('counter', 1, 'seconds', {
      host: container.getHost(),
      port: container.getMappedPort(6379)
    });

    await sliding.add(3);
    await sliding.add(5);
    expect(await sliding.get()).toBe(8);
  });

  it('All results within window', async () => {
    const slidingWindow = new SlidingWindowCounterRedis(
      'counterWindow',
      5,
      'seconds',
      { host: container.getHost(), port: container.getMappedPort(6379) }
    );
    const now = await redisNow();

    jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(slidingWindow as any, 'counterId')
      .mockImplementationOnce(() => `${now - 6 * 1000}-*`)
      .mockImplementationOnce(() => `${now - 3 * 1000}-*`)
      .mockImplementationOnce(() => `${now - 2 * 1000}-*`);

    await slidingWindow.add(2);
    await slidingWindow.add(3);
    await slidingWindow.add(6);

    expect(await slidingWindow.get()).toBe(9);
  });

  describe('Some results outside window', () => {
    async function testCounter(sliding: SlidingWindowCounterRedis) {
      await sliding.add(1);
      await sliding.add(2);
      expect(await sliding.get()).toBe(2);
    }
    it('seconds', async () => {
      const sliding = new SlidingWindowCounterRedis(
        'counterSomeSeconds',
        5,
        'seconds'
      );
      const now = await redisNow();
      const spy = jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(sliding as any, 'counterId')
        .mockImplementationOnce(() => `${now - 6 * 1000}-*`)
        .mockImplementationOnce(() => `${now - 3 * 1000}-*`);

      testCounter(sliding);
      spy.mockRestore();
    });
    it('minutes', async () => {
      const sliding = new SlidingWindowCounterRedis(
        'counterSomeMinutes',
        5,
        'minutes'
      );
      const now = await redisNow();
      const spy = jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(sliding as any, 'counterId')
        .mockImplementationOnce(() => `${now - 6 * 60 * 1000}-*`)
        .mockImplementationOnce(() => `${now - 3 * 60 * 1000}-*`);

      testCounter(sliding);
      spy.mockRestore();
    });
    it('hours', async () => {
      const sliding = new SlidingWindowCounterRedis(
        'counterSomeHours',
        5,
        'hours'
      );
      const now = await redisNow();
      const spy = jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(sliding as any, 'counterId')
        .mockImplementationOnce(() => `${now - 6 * 60 * 60 * 1000}-*`)
        .mockImplementationOnce(() => `${now - 3 * 60 * 60 * 1000}-*`);

      testCounter(sliding);
      spy.mockRestore();
    });
  });
  describe('All results outside window', () => {
    async function testCounter(sliding: SlidingWindowCounterRedis) {
      await sliding.add(1);
      await sliding.add(2);
      expect(await sliding.get()).toBe(0);
    }
    it('seconds', async () => {
      const sliding = new SlidingWindowCounterRedis(
        'counterAllOutSeconds',
        5,
        'seconds'
      );
      const now = await redisNow();
      const spy = jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(sliding as any, 'counterId')
        .mockImplementationOnce(() => `${now - 10 * 1000}-*`)
        .mockImplementationOnce(() => `${now - 8 * 1000}-*`);

      testCounter(sliding);
      spy.mockRestore();
    });
    it('minutes', async () => {
      const sliding = new SlidingWindowCounterRedis(
        'counterAllOutMinutes',
        5,
        'minutes'
      );
      const now = await redisNow();
      const spy = jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(sliding as any, 'counterId')
        .mockImplementationOnce(() => `${now - 10 * 60 * 1000}-*`)
        .mockImplementationOnce(() => `${now - 8 * 60 * 1000}-*`);

      testCounter(sliding);
      spy.mockRestore();
    });
    it('hours', async () => {
      const sliding = new SlidingWindowCounterRedis(
        'counterAllOutHours',
        5,
        'hours'
      );
      const now = await redisNow();
      const spy = jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(sliding as any, 'counterId')
        .mockImplementationOnce(() => `${now - 10 * 60 * 60 * 1000}-*`)
        .mockImplementationOnce(() => `${now - 8 * 60 * 60 * 1000}-*`);

      testCounter(sliding);
      spy.mockRestore();
    });
  });
});
