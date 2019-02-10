let usableLocalStorage;

// Adapted from https://gist.github.com/juliocesar/926500
// Exported for unit tests
export function createLocalStorageShim() {
  const storage = {
    privData: {},
    clear() {
      storage.privData = {};
    },
    setItem(key, val) {
      storage.privData[String(key)] = JSON.stringify(val);
    },
    getItem(key) {
      const storedValue = storage.privData[String(key)];
      return storedValue && JSON.parse(storedValue);
    },
    removeItem: (key: key) => delete storage.privData[String(key)],
  };
  return storage;
}

export function canUseBrowserLocalStorage() {
  try {
    // Ensure that accessing localStorage doesn't throw
    // Next line throws on Chrome with cookies disabled
    const storage = window.localStorage;

    // Ensure that localStorage isn't null
    // Resolves https://sentry.io/share/issue/d65da46a7e19406aaee298fb89a635d6/
    if (!storage) throw new Error();

    // Ensure that if setItem throws, it's not because of private browsing
    // If storage is empty AND setItem throws, we're probably in iOS <=10 private browsing
    if (storage.length === 0) {
      storage.setItem('____writetest', 1);
      storage.removeItem('____writetest');
    }

    // Only return true AFTER we know it can be used
    return true;
  } catch (e) {
    return false;
  }
}

// Returns localStorage if it can be used, if not then it returns a shim
export default function getLocalStorage() {
  // If we've performed all our checks before, just assume results will be the same
  // Key assumption: writability of localStorage doesn't change while page is loaded
  if (usableLocalStorage) return usableLocalStorage;

  // Sets usableLocalStorage on the first execution
  if (canUseBrowserLocalStorage()) {
    usableLocalStorage = window.localStorage;
  } else {
    usableLocalStorage = createLocalStorageShim();
  }

  return usableLocalStorage;
}
