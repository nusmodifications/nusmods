// @flow

import { isValidModule } from 'selectors/moduleBank';

describe(isValidModule, () => {
  test('should return a function that determines if the given module code is valid', () => {
    const state: any = {
      moduleCodes: {
        CS1010S: {},
      },
    };

    const checker = isValidModule(state);
    expect(checker).toBeInstanceOf(Function);

    expect(checker('CS1010S')).toBe(true);
    expect(checker('ACC1000')).toBe(false);
  });
});
