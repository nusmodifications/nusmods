import React from 'react';
import { mount } from 'enzyme';
import insertScript from 'utils/insertScript';
import { CommentCountComponent } from './CommentCount';

jest.mock('utils/insertScript', () => jest.fn());
// Return value is mocked outside of jest.mock's factory because JSDOM symbols
// like Event are not available since module mocks are hoisted
(insertScript as jest.MockedFunction<typeof insertScript>).mockResolvedValue(
  new Event('mock event'),
);

const disqusConfig = {
  url: 'https://nusmods.com/modules/CS1010/reviews',
  identifier: 'CS1010',
  title: 'CS1010 Programming Methodology',
};

describe(CommentCountComponent, () => {
  test('should be disabled (render null) if user has enabled loadDisqusManually', () => {
    const wrapper = mount(<CommentCountComponent {...disqusConfig} loadDisqusManually />);
    expect(wrapper.isEmptyRender()).toBe(true);
    expect(insertScript).not.toBeCalled();
  });

  test('should insert Disqus script if loadDisqusManually is false', () => {
    mount(<CommentCountComponent {...disqusConfig} loadDisqusManually={false} />);
    expect(insertScript).toBeCalled();
  });
});
