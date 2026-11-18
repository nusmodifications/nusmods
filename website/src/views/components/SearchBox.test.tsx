import { render, screen } from '@testing-library/react';
import SearchBox from './SearchBox';

const jest = vi;
describe(SearchBox, () => {
  test('should render an empty search field and a search icon', () => {
    const { container } = render(
      <SearchBox
        throttle={0}
        useInstantSearch={false}
        isLoading={false}
        value=""
        placeholder=""
        onChange={jest.fn()}
        onSearch={jest.fn()}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Search' });
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', '');
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(container.querySelector('.searchIcon')).toBeInTheDocument();
    expect(container.querySelector('.removeInput')).not.toBeInTheDocument();
  });

  test('should render a loading spinner instead of the search icon', () => {
    const { container } = render(
      <SearchBox
        throttle={0}
        useInstantSearch={false}
        isLoading
        value=""
        placeholder=""
        onChange={jest.fn()}
        onSearch={jest.fn()}
      />,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('');
    expect(container.querySelector('.searchIcon')).not.toBeInTheDocument();
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  test('should render the query, placeholder, and a clear icon', () => {
    const { container } = render(
      <SearchBox
        throttle={0}
        useInstantSearch={false}
        isLoading={false}
        value="Hello world"
        placeholder="Testing testing 123"
        onChange={jest.fn()}
        onSearch={jest.fn()}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Search' });
    expect(input).toHaveValue('Hello world');
    expect(input).toHaveAttribute('placeholder', 'Testing testing 123');
    expect(container.querySelector('.searchIcon')).toBeInTheDocument();
    expect(container.querySelector('.removeInput')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
