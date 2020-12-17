const nativeScrollTo = window.scrollTo;
const nativePerformance = window.performance;
const nativeMatchMedia = window.matchMedia;
const nativeScrollIntoView = Element.prototype.scrollIntoView;

export function mockDom() {
  // Mock some of the DOM environment functions that are missing from JSDom
  window.scrollTo = jest.fn();

  if (!window.performance) {
    // @ts-expect-error We insist
    window.performance = { now: jest.fn() };
  }

  if (!window.matchMedia) {
    mockWindowMatchMedia();
  }

  // JSDom does not stub scrollIntoView - https://github.com/jsdom/jsdom/issues/1695
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = jest.fn();
  }
}

export function mockDomReset() {
  window.scrollTo = nativeScrollTo;

  // @ts-expect-error We insist
  window.performance = nativePerformance;

  window.matchMedia = nativeMatchMedia;

  Element.prototype.scrollIntoView = nativeScrollIntoView;
}

export function mockWindowMatchMedia(overrides: Partial<typeof window.matchMedia> = {}) {
  // Source: https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
  window.matchMedia = jest.fn((query) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    ...overrides,
  }));
}
