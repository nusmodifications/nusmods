// @flow

export default class Gamepad {
  hasGamepad = false;

  constructor() {
    if (!('ongamepadconnected' in window)) return;

    window.addEventListener('gamepadconnected', this.onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);
  }

  destroy() {
    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
    window.cancelAnimationFrame(this.onRequestAnimationFrame);
  }

  onGamepadConnected() {
    if (!this.hasGamepad) {
      this.hasGamepad = true;
      window.requestAnimationFrame(this.onRequestAnimationFrame);
    }
  }

  onGamepadDisconnected() {
    // $FlowFixMe - Flow doesn't think navigator.gamepads is an array
    if (navigator.gamepads.length === 0) {
      this.hasGamepad = false;
      window.cancelAnimationFrame(this.onRequestAnimationFrame);
    }
  }

  onRequestAnimationFrame() {
    // $FlowFixMe - Flow doesn't think navigator.gamepads is an array
    const gamepad = navigator.gamepads[0];
    if (!gamepad) {
      this.hasGamepad = false;
      return;
    }



    window.requestAnimationFrame(this.onRequestAnimationFrame);
  }
}
