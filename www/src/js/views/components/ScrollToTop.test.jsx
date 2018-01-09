// @flow
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount, type ReactWrapper } from 'enzyme';
import mockDom from 'test-utils/mockDom';

import ScrollToTop, { ScrollToTopComponent } from './ScrollToTop';

type Props = {
  onComponentWillMount?: boolean,
  onPathChange?: boolean,
};

describe('ScrollToTopComponent', () => {
  beforeEach(() => {
    mockDom();
  });

  function make({ onComponentWillMount, onPathChange }: Props = {}) {
    return mount(
      <MemoryRouter>
        <ScrollToTop onComponentWillMount={onComponentWillMount} onPathChange={onPathChange} />
      </MemoryRouter>,
    );
  }

  function getHistory(wrapper: ReactWrapper) {
    return wrapper.find(ScrollToTopComponent).prop('history');
  }

  test('default behavior does not to anything', () => {
    make();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  test('onComponentWillMount attribute behaves correctly', () => {
    make({ onComponentWillMount: true });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('onPathChange attribute behaves correctly', () => {
    const wrapper = make({ onPathChange: true });
    const history = getHistory(wrapper);
    expect(window.scrollTo).not.toHaveBeenCalled();
    history.push('/foo');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('onComponentWillMount attribute behaves correctly', () => {
    make({ onComponentWillMount: true });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('integration test', () => {
    const wrapper = make({ onComponentWillMount: true, onPathChange: true });
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
