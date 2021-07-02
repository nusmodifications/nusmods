/** *
 * Generates unique string IDs in alphabetical order
 * Usage:
 * const ids = new StringIdGenerator();

ids.next(); // 'a'
ids.next(); // 'b'
ids.next(); // 'c'

// ...
ids.next(); // 'z'
ids.next(); // 'A'
ids.next(); // 'B'

// ...
ids.next(); // 'Z'
ids.next(); // 'aa'
ids.next(); // 'ab'
ids.next(); // 'ac'
 *
 * */
class StringIdGenerator {
  chars: string;

  nextId: number[];

  constructor(chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    this.chars = chars;
    this.nextId = [0];
  }

  next() {
    const r = [];
    this.nextId.forEach((char: string) => {
      r.unshift(this.chars[char]);
    });
    this.increment();
    return r.join('');
  }

  increment() {
    for (let i = 0; i < this.nextId.length; i++) {
      this.nextId[i] += 1;
      const val = this.nextId[i];
      if (val >= this.chars.length) {
        this.nextId[i] = 0;
      } else {
        return;
      }
    }
    this.nextId.push(0);
  }

  *[Symbol.iterator]() {
    while (true) {
      yield this.next();
    }
  }
}

export default StringIdGenerator;
