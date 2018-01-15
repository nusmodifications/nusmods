// @flow
/* eslint-env jest */

export default function mockDom() {
  // Mock some of the DOM environment functions that are missing from JSDom
  window.scrollTo = jest.fn();
  global.performance = { now: jest.fn() };
  global.matchMedia = jest.fn(() => ({ matches: jest.fn(), addListener: jest.fn() }));
}
