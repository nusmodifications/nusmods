import getLocalStorage, { createLocalStorageShim, canUseBrowserLocalStorage } from './localStorage';

describe(createLocalStorageShim, () => {
  test('should store and return data', () => {
    const shim = createLocalStorageShim();
    const toStore = JSON.stringify({ key: 'value', key2: 2 });
    shim.setItem('key', toStore);
    expect(shim.getItem('key')).toEqual(toStore);
  });

  test('should remove keys and clear', () => {
    const shim = createLocalStorageShim();
    shim.setItem('key1', '1');
    shim.setItem('key2', '1');
    shim.setItem('key3', '3.14159');
    expect(Object.keys(shim.privData)).toHaveLength(3);

    // Expect removeItem to remove item
    shim.removeItem('key1');
    expect(shim.privData.key1).toBeUndefined();

    // Expect clear to clear all keys
    shim.clear();
    expect(shim.privData).toEqual({});
  });

  test('should return null when getting nonexistent data', () => {
    const shim = createLocalStorageShim();
    expect(shim.getItem('key')).toBeNull();
  });

  test('should not throw when removing nonexistent key', () => {
    const shim = createLocalStorageShim();
    expect(() => shim.removeItem('key')).not.toThrow();
  });
});

describe('#canUseBrowserLocalStorage', () => {
  let localStorage: typeof window.localStorage;
  beforeEach(() => {
    localStorage = window.localStorage;
    delete (window as any).localStorage;
  });

  afterEach(() => {
    (window as any).localStorage = localStorage;
  });

  test('should return false if localStorage is undefined', () => {
    expect(canUseBrowserLocalStorage()).toEqual(false);
  });

  test('should return false if localStorage throws when writing on iOS <=10 on private browsing', () => {
    (window as any).localStorage = {
      ...createLocalStorageShim(),
      // the length is set here because canUseBrowserLocalStorage uses a hack to detect private browsing
      length: 0,
      setItem: () => {
        throw new Error();
      },
    };
    expect(canUseBrowserLocalStorage()).toEqual(false);
  });

  test('should return true if localStorage is localStorage-like object', () => {
    (window as any).localStorage = createLocalStorageShim();

    expect(canUseBrowserLocalStorage()).toEqual(true);
  });
});

describe(getLocalStorage, () => {
  test("should return the actual browser's localStorage if the browser can use localStorage", () => {
    expect(canUseBrowserLocalStorage()).toEqual(true);
    expect(getLocalStorage()).toBe(window.localStorage);
  });

  test('should return a shim if browser cannot use localStorage', () => {
    delete (window as any).localStorage;

    expect(canUseBrowserLocalStorage()).toEqual(false);
    expect(getLocalStorage()).toMatchObject(
      expect.objectContaining({
        clear: expect.any(Function),
        setItem: expect.any(Function),
        getItem: expect.any(Function),
        removeItem: expect.any(Function),
      }),
    );
  });
});
