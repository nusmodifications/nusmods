// @flow
import React from 'react';
import { mount } from 'enzyme';

import { ScrollToTopComponent } from './ScrollToTop';

describe('ScrollToTopComponent', () => {
  beforeEach(() => {
    jest.spyOn(window, 'scrollTo');
  });

  afterEach(() => {
    window.scrollTo.mockRestore();
  });

  test('default behavior does not to anything', () => {
    mount(<ScrollToTopComponent />);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  test('onComponentWillMount attribute behaves correctly', () => {
    mount(<ScrollToTopComponent onComponentWillMount />);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('onPathChange attribute behaves correctly', () => {
    const wrapper = mount(
      <ScrollToTopComponent
        onPathChange
        location={{ pathname: '/' }}
      />,
    );
    expect(window.scrollTo).not.toHaveBeenCalled();
    wrapper.setProps({ location: { pathname: '/foo' } });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('onComponentWillMount attribute behaves correctly', () => {
    mount(<ScrollToTopComponent onComponentWillMount />);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('integration test', () => {
    const wrapper = mount(
      <ScrollToTopComponent
        onPathChange
        onComponentWillMount
        location={{ pathname: '/' }}
      />,
    );
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    wrapper.setProps({ location: { pathname: '/foo' } });
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    wrapper.setProps({ location: { pathname: '/foo' } });
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    wrapper.setProps({ location: { pathname: '/bar' } });
    expect(window.scrollTo).toHaveBeenCalledTimes(3);
  });
});
