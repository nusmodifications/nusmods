import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FooterComponent } from 'views/layout/Footer';

test('is a footer element', () => {
  render(
    <MemoryRouter>
      <FooterComponent toggleFeedback={jest.fn()} lastUpdatedDate={null} />
    </MemoryRouter>,
  );
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
});
