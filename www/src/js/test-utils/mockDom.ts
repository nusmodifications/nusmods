export default function mockDom() {
  // Mock some of the DOM environment functions that are missing from JSDom
  window.scrollTo = jest.fn();
  global.performance = { now: jest.fn() };
  global.matchMedia = jest.fn(() => ({ matches: jest.fn(), addListener: jest.fn() }));

  // JSDom does not stub scrollIntoView - https://github.com/jsdom/jsdom/issues/1695
  if (!Element.prototype.scrollIntoView) {
    // Flow doesn't think this property is writable, which is true,
    // but we need this to stub this method
    Element.prototype.scrollIntoView = jest.fn();
  }
}
