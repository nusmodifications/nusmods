type Loadable<Result> = Result | { default: Result };
type Loader<Result> = () => Promise<Loadable<Result>>;

/**
 * A cache of resources to avoid loading the same module twice. This is important
 * because Webpack dynamic imports only expose an asynchronous API for loading
 * modules, so to be able to access already-loaded modules synchronously we
 * must have stored the previous result somewhere.
 */
const resourceMap = new Map();

/**
 * A generic resource: given some method to asynchronously load a value - the loader()
 * argument - it allows accessing the state of the resource.
 */
class Resource<Result> {
  private error: Error | null = null;

  private promise: Promise<Result> | null = null;

  private result: Result | null = null;

  private loader: Loader<Result>;

  constructor(loader: Loader<Result>) {
    this.loader = loader;
  }

  // TODO: Check if we should do this or implement a way to replace the resource
  // instance entirely. I suspect this current approach will not trigger
  // renders.
  reset() {
    this.error = null;
    this.promise = null;
    this.result = null;
  }

  /**
   * Loads the resource if necessary.
   */
  preload() {
    let { promise } = this;
    if (promise == null) {
      promise = this.loader()
        .then((result) => {
          let unmoduledResult: Result;
          if (result.default) {
            unmoduledResult = result.default;
          } else {
            unmoduledResult = result;
          }
          this.result = unmoduledResult;
          return unmoduledResult;
        })
        .catch((error) => {
          this.error = error;
          throw error;
        });
      this.promise = promise;
    }
    return promise;
  }

  preloadOrReloadIfError() {
    if (this.error !== null) {
      this.reset();
    }
    this.preload();
  }

  /**
   * Returns the result, if available. This can be useful to check if the value
   * is resolved yet.
   */
  get() {
    if (this.result != null) {
      return this.result;
    }
    return undefined;
  }

  /**
   * This is the key method for integrating with React Suspense. Read will:
   * - "Suspend" if the resource is still pending (currently implemented as
   *   throwing a Promise, though this is subject to change in future
   *   versions of React)
   * - Throw an error if the resource failed to load.
   * - Return the data of the resource if available.
   */
  read() {
    if (this.result !== null) {
      return this.result;
    }
    if (this.error !== null) {
      throw this.error;
    }
    if (this.promise === null) {
      throw new Error('preload() must be called before read().');
    }
    throw this.promise;
  }

  fetch() {
    this.preload();
    return this.read();
  }
}

export type JSResource<Result> = Resource<Result>;

/**
 * A helper method to create a resource, intended for dynamically loading code.
 *
 * Example:
 * ```
 *    // Before rendering, ie in an event handler:
 *    const resource = JSResource('Foo', () => import('./Foo.js));
 *    resource.load();
 *
 *    // in a React component:
 *    const Foo = resource.read();
 *    return <Foo ... />;
 * ```
 *
 * @param {*} moduleId A globally unique identifier for the resource used for caching
 * @param {*} loader A method to load the resource's data if necessary
 */
export function JSResource<Result>(moduleId: unknown, loader: Loader<Result>): JSResource<Result> {
  let resource = resourceMap.get(moduleId);
  if (resource == null) {
    resource = new Resource(loader);
    resourceMap.set(moduleId, resource);
  }
  return resource;
}
