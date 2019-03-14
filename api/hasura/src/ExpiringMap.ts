import ms from 'ms';

type Value<T> = Readonly<{
  value: T;
  expiresBy: number;
}>;

/**
 * Keeps track of all values, which expire after a certain time.
 *
 * Occasionally vacuums expired values, which requires calling of `cleanup` before
 * deleting the map to prevent memory leaks.
 */
class ExpiringMap<K, V> {
  private innerMap: Map<K, Value<V>>;
  private ttl: number;
  private vacuumHandler: NodeJS.Timeout;

  constructor(ttl: string) {
    this.innerMap = new Map();
    this.ttl = ms(ttl);
    this.vacuumHandler = setInterval(() => this.vacuum(), this.ttl);
  }

  get size(): number {
    return this.innerMap.size;
  }

  get(key: K): V | undefined {
    const data = this.innerMap.get(key);

    if (!data) return;
    if (Date.now() > data.expiresBy) {
      this.innerMap.delete(key);
      return;
    }

    return data.value;
  }

  set(key: K, value: V): this {
    const existingExpiry = this.innerMap.get(key);

    let expiresBy;
    if (existingExpiry && Date.now() < existingExpiry.expiresBy) {
      expiresBy = existingExpiry.expiresBy;
    } else {
      expiresBy = Date.now() + this.ttl;
    }

    this.innerMap.set(key, { value, expiresBy });
    return this;
  }

  private vacuum() {
    const dateNow = Date.now();
    for (const [key, val] of this.innerMap.entries()) {
      if (dateNow > val.expiresBy) {
        this.innerMap.delete(key);
      }
    }
  }

  cleanup() {
    clearInterval(this.vacuumHandler);
  }
}

export default ExpiringMap;
