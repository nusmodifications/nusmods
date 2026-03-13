const nativeScrollTo = window.scrollTo;
const nativeMatchMedia = window.matchMedia;
const nativeScrollIntoView = Element.prototype.scrollIntoView;

export function mockDom() {
  // Mock some of the DOM environment functions that are missing from JSDom
  window.scrollTo = vi.fn();

  if (!window.matchMedia) {
    mockWindowMatchMedia();
  }

  // JSDom does not stub scrollIntoView - https://github.com/jsdom/jsdom/issues/1695
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
}

export function mockDomReset() {
  window.scrollTo = nativeScrollTo;

  window.matchMedia = nativeMatchMedia;

  Element.prototype.scrollIntoView = nativeScrollIntoView;
}

export function mockWindowMatchMedia(overrides: Partial<typeof window.matchMedia> = {}) {
  // Source: https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
  window.matchMedia = vi.fn((query) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    ...overrides,
  }));
}
