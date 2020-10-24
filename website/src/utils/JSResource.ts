type Module<T> = { default: T };
type Loader<T> = () => Promise<Module<T>>;

export interface JSResourceReference<T> {
  /**
   * Returns the module's id
   */
  getModuleId(): string;

  /**
   * Gets a module if it is already loaded, undefined otherwise.
   */
  getModuleIfRequired(): T | undefined;

  /**
   * Loads the resource if necessary
   */
  preload(): Promise<T>;

  preloadOrReloadIfError(): void;

  /**
   * This is the key method for integrating with React Suspense. Read will:
   * - "Suspend" if the resource is still pending (currently implemented as
   *   throwing a Promise, though this is subject to change in future
   *   versions of React)
   * - Throw an error if the resource failed to load.
   * - Return the data of the resource if available.
   */
  read(): T;

  /**
   * Convenience function that preloads and reads this resource.
   */
  fetch(): T;
}

/**
 * A cache of resources to avoid loading the same module twice. This is important
 * because Webpack dynamic imports only expose an asynchronous API for loading
 * modules, so to be able to access already-loaded modules synchronously we
 * must have stored the previous result somewhere.
 */
const resourceMap = new Map<string, JSResourceImpl<unknown>>();

/**
 * A generic resource: given some method to asynchronously load a value -- the
 * loader() argument -- it allows accessing the state of the resource.
 *
 * The main differences between this and `Resource` are:
 * - `JSResourceImpl` returns a promise on preload.
 * - `Resource` allows a single resource to load values for different keys.
 */
class JSResourceImpl<T> implements JSResourceReference<T> {
  private error: Error | undefined;

  private promise: Promise<T> | undefined;

  private result: T | undefined;

  private moduleId: string;

  private loader: Loader<T>;

  constructor(moduleId: string, loader: Loader<T>) {
    this.moduleId = moduleId;
    this.loader = loader;
  }

  getModuleId() {
    return this.moduleId;
  }

  getModuleIfRequired() {
    return this.result;
  }

  /**
   * Loads the resource if necessary.
   */
  preload() {
    let { promise } = this;
    if (promise == null) {
      promise = this.loader()
        .then(({ default: result }) => {
          this.result = result;
          return result;
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
    if (this.error !== undefined) {
      this.error = undefined;
      this.promise = undefined;
      this.result = undefined;
    }
    this.preload();
  }

  /**
   * Returns the result, if available. This can be useful to check if the value
   * is resolved yet.
   */
  get() {
    if (this.result !== undefined) {
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
    if (this.result !== undefined) {
      return this.result;
    }
    if (this.error !== undefined) {
      throw this.error;
    }
    if (this.promise === undefined) {
      throw new Error('preload() must be called before read().');
    }
    throw this.promise;
  }

  fetch() {
    this.preload();
    return this.read();
  }
}

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
export function JSResource<T>(moduleId: string, loader: Loader<T>): JSResourceReference<T> {
  let resource = resourceMap.get(moduleId);
  if (resource == null) {
    resource = new JSResourceImpl(moduleId, loader);
    resourceMap.set(moduleId, resource);
  }
  return resource as JSResourceReference<T>;
}
