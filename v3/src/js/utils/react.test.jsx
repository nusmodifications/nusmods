// @flow
import React, { Component, PureComponent } from 'react';
import { render } from 'enzyme';
import { highlight, wrapComponentName } from './react';

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

describe('wrapComponentName()', () => {
  /* eslint-disable react/prefer-stateless-function, react/no-multi-comp */
  class TestComponent extends Component<{}> {}
  class TestPureComponent extends PureComponent<{}> {}
  class TestComponentWithDisplayName extends Component<{}> {
    static displayName = 'TestComponentName';
  }
  function FunctionalComponent() {}
  function FunctionalComponentWithDisplayName() {}
  FunctionalComponentWithDisplayName.displayName = 'FunctionalComponentDisplayName';

  test('should infer component name from provided component', () => {
    expect(wrapComponentName(TestComponent, 'wrapper'))
      .toEqual('wrapper(TestComponent)');
    expect(wrapComponentName(TestPureComponent, 'wrapper'))
      .toEqual('wrapper(TestPureComponent)');
    expect(wrapComponentName(TestComponentWithDisplayName, 'wrapper'))
      .toEqual('wrapper(TestComponentName)');
    expect(wrapComponentName(FunctionalComponent, 'wrapper'))
      .toEqual('wrapper(FunctionalComponent)');
    expect(wrapComponentName(FunctionalComponentWithDisplayName, 'wrapper'))
      .toEqual('wrapper(FunctionalComponentDisplayName)');
  });
});
