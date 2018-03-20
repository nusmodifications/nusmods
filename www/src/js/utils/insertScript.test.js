// @flow

import insertScript from './insertScript';

describe(insertScript, () => {
  test('insert a script tag', () => {
    window.document.createElement = jest.fn();
    window.document.createElement.mockReturnValue({});

    window.document.body.appendChild = jest.fn();

    insertScript('https://example.com/random.js', 'NUSMods', true);
    insertScript('https://example.com/random.js', 'NUSMods', true);
    insertScript('https://example.com/random.js', 'NUSMods', true);

    expect(window.document.createElement).toHaveBeenCalledTimes(3);
    expect(window.document.body.appendChild).toHaveBeenCalledTimes(3);
  });
});
