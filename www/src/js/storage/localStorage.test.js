import { createLocalStorageShim } from './localStorage';

describe('#createLocalStorageShim', () => {
  test('should store and return data', () => {
    const shim = createLocalStorageShim();
    const toStore = { key: 'value', key2: 2 };
    shim.setItem('key', toStore);
    expect(shim.getItem('key')).toEqual(toStore);
  });

  test('should not throw when setting null/undefined', () => {
    const shim = createLocalStorageShim();
    expect(() => shim.setItem('key', null)).not.toThrow();
    expect(() => shim.setItem('key', undefined)).not.toThrow();
  });

  test('should return undefined when getting nonexistent data', () => {
    const shim = createLocalStorageShim();
    expect(shim.getItem('key')).toBeUndefined();
  });

  test('should not throw when removing nonexistent key', () => {
    const shim = createLocalStorageShim();
    expect(() => shim.removeItem('key')).not.toThrow();
  });
});
