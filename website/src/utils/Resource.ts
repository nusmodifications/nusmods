/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { createContext } from 'react';

// Cache implementation was forked from the React repo:
// https://github.com/facebook/react/blob/4e5d7faf54b38ebfc7a2dcadbd09a25d6f330ac0/packages/react-devtools-shared/src/devtools/cache.js
// which was forked from:
// https://github.com/facebook/react/blob/4e5d7faf54b38ebfc7a2dcadbd09a25d6f330ac0/packages/react-cache/src/ReactCacheOld.js
//
// This cache is simpler than react-cache in that:
// 1. Individual items don't need to be invalidated.
// 2. We didn't need the added overhead of an LRU cache.

type PendingResult = {
  status: 0;
  value: Promise<unknown>;
};

type ResolvedResult<Value> = {
  status: 1;
  value: Value;
};

type RejectedResult = {
  status: 2;
  value: unknown;
};

type Result<Value> = PendingResult | ResolvedResult<Value> | RejectedResult;

// TODO: Reduce API surface area?
export type Resource<Input, Key, Value> = {
  clear(): void;
  invalidate(key: Key): void;

  /**
   * Returns the result, if available. This can be useful to check if the value
   * is resolved yet.
   */
  get(input: Input): Value | undefined;

  /**
   * This is the key method for integrating with React Suspense. Read will:
   * - "Suspend" if the resource is still pending (currently implemented as
   *   throwing a Promise, though this is subject to change in future
   *   versions of React)
   * - Throw an error if the resource failed to load.
   * - Return the data of the resource if available.
   */
  read(input: Input): Value;

  /**
   * Loads the resource if necessary.
   */
  preload(input: Input): void;

  write(key: Key, value: Value): void;
};

const Pending = 0;
const Resolved = 1;
const Rejected = 2;

// TODO: Decide if we should dump this as it's only used for a dev check
const { ReactCurrentDispatcher } =
  // eslint-disable-next-line no-underscore-dangle
  (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

function readContext(Context: React.Context<null>, observedBits: void | number | boolean) {
  const dispatcher = ReactCurrentDispatcher.current;
  if (dispatcher === null) {
    throw new Error(
      'Resource.ts: read and preload may only be called from within a ' +
        "component's render. They are not supported in event handlers or " +
        'lifecycle methods.',
    );
  }
  return dispatcher.readContext(Context, observedBits);
}

const CacheContext = createContext(null);

type Config = {
  useWeakMap?: boolean;
};

const entries: Map<Resource<any, any, any>, Map<any, any> | WeakMap<any, any>> = new Map();
const resourceConfigs: Map<Resource<any, any, any>, Config> = new Map();

function getEntriesForResource(resource: any): Map<any, any> | WeakMap<any, any> {
  let entriesForResource = (entries.get(resource) as any) as Map<any, any> | WeakMap<any, any>;
  if (entriesForResource === undefined) {
    const config = resourceConfigs.get(resource);
    entriesForResource = config !== undefined && config.useWeakMap ? new WeakMap() : new Map();
    entries.set(resource, entriesForResource);
  }
  return entriesForResource;
}

function accessResult<Input, Key, Value>(
  resource: any,
  fetch: (fetchInput: Input) => Promise<Value>,
  input: Input,
  key: Key,
): Result<Value> {
  const entriesForResource = getEntriesForResource(resource);
  const entry = entriesForResource.get(key);

  if (entry === undefined) {
    const thenable = fetch(input);
    thenable.then(
      (value) => {
        if (newResult.status === Pending) {
          const resolvedResult: ResolvedResult<Value> = newResult as any;
          resolvedResult.status = Resolved;
          resolvedResult.value = value;
        }
      },
      (error) => {
        if (newResult.status === Pending) {
          const rejectedResult: RejectedResult = newResult as any;
          rejectedResult.status = Rejected;
          rejectedResult.value = error;
        }
      },
    );
    const newResult: PendingResult = {
      status: Pending,
      value: thenable,
    };
    entriesForResource.set(key, newResult);
    return newResult;
  }

  return entry;
}

export function createResource<Input, Key, Value>(
  fetch: (input: Input) => Promise<Value>,
  hashInput: (input: Input) => Key,
  config: Config = {},
): Resource<Input, Key, Value> {
  const resource = {
    clear(): void {
      entries.delete(resource);
    },

    invalidate(key: Key): void {
      const entriesForResource = getEntriesForResource(resource);
      entriesForResource.delete(key);
    },

    get(input: Input): Value | undefined {
      const key = hashInput(input);
      const result: Result<Value> = accessResult(resource, fetch, input, key);
      switch (result.status) {
        case Resolved: {
          const { value } = result;
          return value;
        }
        default:
          return undefined;
      }
    },

    read(input: Input): Value {
      // Prevent access outside of render.
      readContext(CacheContext);

      const key = hashInput(input);
      const result: Result<Value> = accessResult(resource, fetch, input, key);
      switch (result.status) {
        case Pending: {
          const suspender = result.value;
          throw suspender;
        }
        case Resolved: {
          const { value } = result;
          return value;
        }
        case Rejected: {
          const error = result.value;
          throw error;
        }
        default:
          // Should be unreachable
          return undefined as any;
      }
    },

    preload(input: Input): void {
      // Prevent access outside of render.
      readContext(CacheContext);

      const key = hashInput(input);
      accessResult(resource, fetch, input, key);
    },

    write(key: Key, value: Value): void {
      const entriesForResource = getEntriesForResource(resource);

      const resolvedResult: ResolvedResult<Value> = {
        status: Resolved,
        value,
      };

      entriesForResource.set(key, resolvedResult);
    },
  };

  resourceConfigs.set(resource, config);

  return resource;
}

export function invalidateResources(): void {
  entries.clear();
}
