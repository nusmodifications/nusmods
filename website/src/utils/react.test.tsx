import * as React from 'react';
import { render } from 'enzyme';
import { highlight, wrapComponentName, Counter } from './react';

describe(highlight, () => {
  const h = (...args: Parameters<typeof highlight>) => render(<p>{highlight(...args)}</p>);

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
    const shakespeare =
      'Some are born great, some achieve greatness, and some have greatness thrust upon them.';
    expect(h(shakespeare, []).find('mark')).toHaveLength(0);
    expect(h(shakespeare, ['some']).find('mark')).toHaveLength(3);
    expect(h(shakespeare, ['some', 'born']).find('mark')).toHaveLength(4);
    expect(h(shakespeare, ['some', 'born', 'great']).find('mark')).toHaveLength(7);
  });
});

describe('wrapComponentName()', () => {
  /* eslint-disable react/prefer-stateless-function */
  class TestComponent extends React.Component {}
  class TestPureComponent extends React.PureComponent {}
  class TestComponentWithDisplayName extends React.Component {
    static displayName = 'TestComponentName';
  }
  const FunctionalComponent = () => null;
  const FunctionalComponentWithDisplayName = () => null;
  FunctionalComponentWithDisplayName.displayName = 'FunctionalComponentDisplayName';

  test('should infer component name from provided component', () => {
    expect(wrapComponentName(TestComponent, 'wrapper')).toEqual('wrapper(TestComponent)');
    expect(wrapComponentName(TestPureComponent, 'wrapper')).toEqual('wrapper(TestPureComponent)');
    expect(wrapComponentName(TestComponentWithDisplayName, 'wrapper')).toEqual(
      'wrapper(TestComponentName)',
    );
    expect(wrapComponentName(FunctionalComponent, 'wrapper')).toEqual(
      'wrapper(FunctionalComponent)',
    );
    expect(wrapComponentName(FunctionalComponentWithDisplayName, 'wrapper')).toEqual(
      'wrapper(FunctionalComponentDisplayName)',
    );
  });
});

describe('Counter', () => {
  test('#index() should increment itself when called', () => {
    const counter = new Counter();
    expect(counter.index()).toEqual(0);
    expect(counter.index()).toEqual(1);
    expect(counter.index()).toEqual(2);
    expect(counter.index()).toEqual(3);
    expect(counter.index()).toEqual(4);
  });

  test('#matches() should return true if the provided index matches', () => {
    const counter = new Counter();
    expect(counter.matches(0)).toBe(true);
    expect(counter.matches(0)).toBe(false);
    expect(counter.matches(2)).toBe(true);
    expect(counter.matches(2)).toBe(false);
    expect(counter.matches(4)).toBe(true);
    expect(counter.matches(5)).toBe(true);
  });
});
