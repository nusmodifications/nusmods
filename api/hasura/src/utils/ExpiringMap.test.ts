import { advanceBy } from 'jest-date-mock';
import ExpiringMap from './ExpiringMap';

jest.useFakeTimers();

describe('ExpiringMap', () => {
  let instance: ExpiringMap<string, string>;
  const testKey = 'testKey';
  const testValue = 'testValue';
  const duration = 1;
  const tick = duration + 1; // Allow slack

  beforeEach(() => {
    instance = new ExpiringMap(duration);
  });

  afterEach(() => {
    instance.cleanup();
  });

  it('should get size of map', async () => {
    expect(instance.size).toBe(0);
    instance.set(testKey, testValue);
    expect(instance.size).toBe(1);
    instance.set(testKey, testValue);
    expect(instance.size).toBe(1);
    instance.set(testKey, 'anotherTestValue');
    expect(instance.size).toBe(1);
  });

  it('should store value, which is retrievable within time limit', async () => {
    instance.set(testKey, testValue);
    expect(instance.get(testKey)).toBe(testValue);
  });

  it('should expire value after designated time duration', async () => {
    instance.set(testKey, testValue);
    expect(instance.get(testKey)).toBe(testValue);

    advanceBy(tick);
    expect(instance.get(testKey)).toBeUndefined();
  });

  it('should not reset expiry whenever value is set again', async () => {
    instance.set(testKey, testValue);
    expect(instance.get(testKey)).toBe(testValue);

    advanceBy(tick / 2);
    instance.set(testKey, testValue);

    advanceBy(tick / 2);
    expect(instance.get(testKey)).toBeUndefined();
  });

  it('should vacuum after certain time has passed', async () => {
    instance.set(testKey, testValue);
    expect(instance.size).toBe(1);

    advanceBy(tick);
    jest.runOnlyPendingTimers();
    expect(instance.size).toBe(0);
  });
});
