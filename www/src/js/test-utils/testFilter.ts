// This file is deliberately untyped. Typed filter helper functions should go to
// filterHelpers.js

// @ts-ignore
export default function testFilter(Filter, module, combinations, valid) {
  // Checks every possible combination of arguments for a Filter class
  // against ones that should return true

  // @ts-ignore
  combinations.forEach((...args) => {
    const filter = new Filter(...args);

    if (filter.test(module)) {
      expect(valid).toContainEqual(args);
    } else {
      expect(valid).not.toContainEqual(args);
    }
  });
}
