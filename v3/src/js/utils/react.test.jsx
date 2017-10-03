// @flow
import React from 'react';
import { render } from 'enzyme';
import { highlight } from './react';

describe('highlight()', () => {
  const h = (...args) => render(<p>{highlight(...args)}</p>);

  test('should wrap search terms with <mark>', () => {
    expect(h('Hello world', 'hello').find('mark')).toHaveLength(1);
    expect(h('Hello world', 'hello').find('mark').text()).toEqual('Hello');

    // Case insensitivity
    expect(h('Hello heLLo world', 'hello').find('mark')).toHaveLength(2);

    // Part of another word
    expect(h('Bar barring barred barn baaa', 'bar').find('mark')).toHaveLength(4);

    // No match
    expect(h('Hello world', 'match').find('mark')).toHaveLength(0);
    expect(h('Hello world', '').find('mark')).toHaveLength(0);
  });

  test('should wrap each of the multiple search terms with <mark>', () => {
    const shakespeare = 'Some are born great, some achieve greatness, and some have greatness thrust upon them.';
    expect(h(shakespeare, []).find('mark')).toHaveLength(0);
    expect(h(shakespeare, ['some']).find('mark')).toHaveLength(3);
    expect(h(shakespeare, ['some', 'born']).find('mark')).toHaveLength(4);
    expect(h(shakespeare, ['some', 'born', 'great']).find('mark')).toHaveLength(7);
  });
});
