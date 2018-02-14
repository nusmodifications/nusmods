import { createLocalStorageShim, isLocalStorageLike, getLocalStorage } from './localStorage';

describe('#createLocalStorageShim', () => {
  test('should store and return data', () => {
    const shim = createLocalStorageShim();
    const toStore = { key: 'value', key2: 2 };
    shim.setItem('key', toStore);
    expect(shim.getItem('key')).toEqual(toStore);
  });

  test('should remove keys and clear', () => {
    const shim = createLocalStorageShim();
    shim.setItem('key1', 1);
    shim.setItem('key2', 1);
    shim.setItem('key3', 3.14159);
    expect(Object.keys(shim.privData)).toHaveLength(3);

    // Expect removeItem to remove item
    shim.removeItem('key1');
    expect(shim.privData.key1).toBeUndefined();

    // Expect clear to clear all keys
    shim.clear();
    expect(shim.privData).toEqual({});
  });

  test('should not throw when setting null/undefined', () => {
    const shim = createLocalStorageShim();
    expect(() => shim.setItem('key', null)).not.toThrow();
    expect(() => shim.setItem('key', undefined)).not.toThrow();
  });

  test('should return undefined when getting nonexistent data', () => {
    const shim = createLocalStorageShim();
    expect(shim.getItem('key')).toBeUndefined();
    shim.setItem('key', undefined);
    expect(shim.getItem('key')).toBeUndefined();
  });

  test('should not throw when removing nonexistent key', () => {
    const shim = createLocalStorageShim();
    expect(() => shim.removeItem('key')).not.toThrow();
  });
});

describe('#isLocalStorageLike', () => {
  test('should correctly check localstorage-like object', () => {
    const faulty = {
      ...createLocalStorageShim(),
      setItem: () => {
        throw new Error();
      },
    };
    const shim = createLocalStorageShim();
    expect(isLocalStorageLike(faulty)).toEqual(false);
    expect(isLocalStorageLike(shim)).toEqual(true);
  });
});

describe('#getLocalStorage', () => {
  test('should get usable localstorage-like object', () => {
    const possibleLocalStorage = getLocalStorage();
    expect(isLocalStorageLike(possibleLocalStorage)).toEqual(true);
  });
});
