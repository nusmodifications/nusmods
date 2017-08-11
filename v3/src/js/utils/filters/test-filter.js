/* global expect */

// eslint-disable-next-line import/prefer-default-export
export function testFilter(Filter, module, combinations, valid) {
  // Checks every possible combination of arguments for a Filter class
  // against ones that should return true
  combinations.forEach((...args) => {
    const filter = new Filter(...args);

    if (filter.test(module)) {
      expect(valid).toContainEqual(args);
    } else {
      expect(valid).not.toContainEqual(args);
    }
  });
}
