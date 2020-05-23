import React from 'react';
import { mount } from 'enzyme';
import { CommentCountComponent } from './CommentCount';
import insertScript from 'utils/insertScript';

jest.mock('utils/insertScript', () => jest.fn().mockResolvedValueOnce('fuck'));

const disqusConfig = {
  url: 'https://nusmods.com/modules/CS1010/reviews',
  identifier: 'CS1010',
  title: 'CS1010 Programming Methodology',
};

describe(CommentCountComponent, () => {
  test('should be disabled (render null) if user has enabled loadDisqusManually', () => {
    const wrapper = mount(<CommentCountComponent loadDisqusManually {...disqusConfig} />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  test('should insert Disqus script if loadDisqusManually is false', () => {
    (insertScript as jest.MockedFunction<typeof insertScript>).mockResolvedValueOnce(
      new Event('mock event'),
    );
    mount(<CommentCountComponent loadDisqusManually={false} {...disqusConfig} />);
    expect(insertScript).toBeCalled();
  });
});
