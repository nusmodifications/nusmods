import insertScript from './insertScript';

describe(insertScript, () => {
  test('insert a script tag', () => {
    window.document.createElement = jest.fn().mockReturnValue({});
    window.document.body.appendChild = jest.fn();

    insertScript('https://example.com/random.js');
    insertScript('https://example.com/random.js', { async: true });
    insertScript('https://example.com/random.js', { id: 'nusmods', defer: true });

    expect(window.document.createElement).toHaveBeenCalledTimes(3);
    expect(window.document.body.appendChild).toHaveBeenCalledTimes(3);
  });
});
