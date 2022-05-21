import { SlidingWindowCounter } from '../src/index';

describe('test sliding window', () => {
  it('All results within window', () => {
    const sliding = new SlidingWindowCounter(5, 'seconds');
    sliding.windowStart();
    sliding.add(1);
    sliding.add(2);
    expect(sliding.get()).toBe(3);
  });
  describe('Some results outside window', () => {
    function testCounter(bucketBy: 'seconds' | 'minutes' | 'hours') {
      const sliding = new SlidingWindowCounter(5, bucketBy);
      sliding.windowStart();
      sliding.add(1);
      sliding.add(2);
      expect(sliding.get()).toBe(2);
    }
    it('seconds', () => {
      const spy = jest
        .spyOn(global.Date, 'now')
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:23.143Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:24.252Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:28.252Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:31.252Z').valueOf()
        );
      testCounter('seconds');
      spy.mockRestore();
    });
    it('minutes', () => {
      const spy = jest
        .spyOn(global.Date, 'now')
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:23.143Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T09:00:23.252Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T09:06:23.252Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T09:10:31.252Z').valueOf()
        );
      testCounter('minutes');
      spy.mockRestore();
    });
    it('hours', () => {
      const spy = jest
        .spyOn(global.Date, 'now')
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:23.143Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:23.252Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T12:58:23.252Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T13:59:31.252Z').valueOf()
        );
      testCounter('hours');
      spy.mockRestore();
    });
  });
  describe('All results outside window', () => {
    function testCounter(bucketBy: 'seconds' | 'minutes' | 'hours') {
      const sliding = new SlidingWindowCounter(5, bucketBy);
      sliding.windowStart();
      sliding.add(1);
      sliding.add(2);
      expect(sliding.get()).toBe(0);
    }
    it('seconds', () => {
      const spy = jest
        .spyOn(global.Date, 'now')
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:23.143Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:24.252Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:28.252Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:40.252Z').valueOf()
        );
      testCounter('seconds');
      spy.mockRestore();
    });
    it('minutes', () => {
      const spy = jest
        .spyOn(global.Date, 'now')
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:23.143Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T09:00:23.252Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T09:06:23.252Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T09:14:31.252Z').valueOf()
        );
      testCounter('minutes');
      spy.mockRestore();
    });
    it('hours', () => {
      const spy = jest
        .spyOn(global.Date, 'now')
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:23.143Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T08:58:23.252Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T12:58:23.252Z').valueOf()
        )
        .mockImplementationOnce(() =>
          new Date('2022-05-20T19:59:31.252Z').valueOf()
        );
      testCounter('hours');
      spy.mockRestore();
    });
  });
});
