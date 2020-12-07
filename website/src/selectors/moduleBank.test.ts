import { getModuleCondensed } from 'selectors/moduleBank';

describe(getModuleCondensed, () => {
  test('should return a function that determines if the given module code is valid', () => {
    const state: any = {
      moduleBank: {
        moduleCodes: {
          CS1010S: {},
        },
      },
    };

    const checker = getModuleCondensed(state);
    expect(checker).toBeInstanceOf(Function);

    expect(checker('CS1010S')).toBeTruthy();
    expect(checker('ACC1000')).toBeFalsy();
  });
});
