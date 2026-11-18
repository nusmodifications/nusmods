import type { MockedFunction } from 'vitest';
import { render } from '@testing-library/react';
import insertScript from 'utils/insertScript';
import { CommentCountComponent } from './CommentCount';

vi.mock('utils/insertScript', () => ({ default: vi.fn() }));
// Return value is mocked outside of jest.mock's factory because JSDOM symbols
// like Event are not available since module mocks are hoisted
(insertScript as MockedFunction<typeof insertScript>).mockResolvedValue(new Event('mock event'));

const disqusConfig = {
  url: 'https://nusmods.com/courses/CS1010/reviews',
  identifier: 'CS1010',
  title: 'CS1010 Programming Methodology',
};

describe(CommentCountComponent, () => {
  test('should be disabled (render null) if user has enabled loadDisqusManually', () => {
    const { container } = render(<CommentCountComponent {...disqusConfig} loadDisqusManually />);
    expect(container).toBeEmptyDOMElement();
    expect(insertScript).not.toHaveBeenCalled();
  });

  test('should insert Disqus script if loadDisqusManually is false', () => {
    render(<CommentCountComponent {...disqusConfig} loadDisqusManually={false} />);
    expect(insertScript).toHaveBeenCalled();
  });
});
