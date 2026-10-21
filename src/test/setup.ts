import "@testing-library/jest-dom/vitest"

// jsdom does not implement ResizeObserver or scrollIntoView; cmdk (shadcn's
// Command) uses both internally to measure and scroll the list, so tests
// need no-op polyfills.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

if (typeof Element.prototype.scrollIntoView === "undefined") {
  Element.prototype.scrollIntoView = function scrollIntoView() {}
}
