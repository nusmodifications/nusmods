export default function mockDom() {
  // Mock some of the DOM environment functions that are missing from JSDom
  window.scrollTo = jest.fn();

  // @ts-ignore
  global.performance = { now: jest.fn() };

  // @ts-ignore
  global.matchMedia = jest.fn(() => ({ matches: jest.fn(), addListener: jest.fn() }));

  // JSDom does not stub scrollIntoView - https://github.com/jsdom/jsdom/issues/1695
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = jest.fn();
  }
}
