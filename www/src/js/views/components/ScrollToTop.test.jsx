// @flow

import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount, type ReactWrapper } from 'enzyme';
import mockDom from 'test-utils/mockDom';

import ScrollToTop, { ScrollToTopComponent, type Props as ScrollToTopProps } from './ScrollToTop';

type Props = {
  onComponentDidMount?: boolean,
  onPathChange?: boolean,
};

describe('ScrollToTopComponent', () => {
  beforeEach(() => {
    mockDom();
  });

  // Construct a testable ScrollToTop component
  function make(props: Props = {}) {
    // This function exists to avoid triggering Flow errors on undefined props
    function getDefinedProp(name: $Keys<Props & ScrollToTopProps>) {
      // Try to return prop if it exists in props
      if (props[name] !== undefined) return props[name];
      // Else return component's default value
      return ScrollToTopComponent.defaultProps[name];
    }

    return mount(
      <MemoryRouter>
        {}
        <ScrollToTop
          onComponentDidMount={getDefinedProp('onComponentDidMount')}
          onPathChange={getDefinedProp('onPathChange')}
        />
      </MemoryRouter>,
    );
  }

  function getHistory(wrapper: ReactWrapper) {
    return wrapper.find(ScrollToTopComponent).prop('history');
  }

  test('default behavior does not do anything', () => {
    make();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  test('onComponentDidMount attribute behaves correctly', () => {
    make({ onComponentDidMount: true });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('onPathChange attribute behaves correctly', () => {
    const wrapper = make({ onPathChange: true });
    const history = getHistory(wrapper);
    expect(window.scrollTo).not.toHaveBeenCalled();
    history.push('/foo');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('onComponentDidMount attribute behaves correctly', () => {
    make({ onComponentDidMount: true });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('integration test', () => {
    const wrapper = make({ onComponentDidMount: true, onPathChange: true });
    const history = getHistory(wrapper);

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    history.push('/foo');
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    history.push('/foo');
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    history.push('/bar');
    expect(window.scrollTo).toHaveBeenCalledTimes(3);
  });
});
