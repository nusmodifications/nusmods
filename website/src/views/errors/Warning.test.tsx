import { render, screen } from '@testing-library/react';
import Warning from './Warning';

test('it displays warning message', () => {
  const message = 'abcde/ghi123!@#$';
  render(<Warning message={message} />);
  expect(screen.getByRole('heading')).toHaveTextContent(message);
});
