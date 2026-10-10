import { render, screen } from '@testing-library/react';
import Warning from './Warning';

test('it displays warning message', () => {
  render(<Warning message="abcde/ghi123!@#$" />);
  expect(screen.getByRole('heading', { name: 'abcde/ghi123!@#$' })).toBeInTheDocument();
});
