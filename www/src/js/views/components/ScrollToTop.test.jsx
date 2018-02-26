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
    // Construct a ScrollToTop component without triggering Flow errors on undefined props
    let sttComponent = null;
    if (onComponentWillMount !== undefined && onPathChange !== undefined) {
      sttComponent = (
        <ScrollToTop onComponentWillMount={onComponentWillMount} onPathChange={onPathChange} />
      );
    } else if (onComponentWillMount !== undefined) {
      sttComponent = <ScrollToTop onComponentWillMount={onComponentWillMount} />;
    } else if (onPathChange !== undefined) {
      sttComponent = <ScrollToTop onPathChange={onPathChange} />;
    } else {
      sttComponent = <ScrollToTop />;
    }

    return mount(
      <MemoryRouter>
        {}
        {sttComponent}
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
