// @flow
export default class KeyboardShortcuts {
  bindings: {[string]: Function};

  constructor(el: EventTarget) {
    this.bindings = {};
    el.addEventListener('keydown', (event: KeyboardEvent) => {
      const key = String(event.keyCode || event.which);
      const targetIsEl = event.target === el;
      const callback = this.bindings[key];
      if (targetIsEl && callback) {
        callback();
      }
    });
  }

  bindKey(key: number, callback: Function) {
    this.bindings[key.toString()] = callback;
  }
}
