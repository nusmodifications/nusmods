import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox, { Props } from './SearchBox';

const SOME_TEXT = 'existing';

const defaultProps: Props = {
  throttle: 0,
  isLoading: false,
  value: SOME_TEXT,
  onChange: jest.fn(),
  onSearch: jest.fn(),
};

describe(SearchBox, () => {
  test('should display loading indicator if isLoading', () => {
    render(<SearchBox {...defaultProps} isLoading />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('should not display loading indicator if not isLoading', () => {
    render(<SearchBox {...defaultProps} isLoading={false} />);
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  test('should display value', () => {
    render(<SearchBox {...defaultProps} value={SOME_TEXT} />);
    expect(screen.getByRole('searchbox')).toHaveValue(SOME_TEXT);
  });

  test('should display placeholder', () => {
    render(<SearchBox {...defaultProps} value="" placeholder="abc" />);
    expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'abc');
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  test('should call onChange and onSearch when user types into the input', async () => {
    const mockOnChange = jest.fn();
    const mockOnSearch = jest.fn();
    render(<SearchBox {...defaultProps} onChange={mockOnChange} onSearch={mockOnSearch} />);

    userEvent.type(screen.getByRole('searchbox'), 'ing');

    expect(mockOnChange).toHaveBeenCalledTimes(3);
    // `SearchBox` is a fully controlled component, so we expect the input to be
    // appended to `value`.
    expect(mockOnChange).toHaveBeenNthCalledWith(1, `${SOME_TEXT}i`);
    expect(mockOnChange).toHaveBeenNthCalledWith(2, `${SOME_TEXT}n`);
    expect(mockOnChange).toHaveBeenNthCalledWith(3, `${SOME_TEXT}g`);

    await waitFor(() => expect(mockOnSearch).toHaveBeenCalledTimes(1));
  });

  test('should handle blur correctly', async () => {
    const mockHandlers = [jest.fn(), jest.fn(), jest.fn()];
    const [mockOnBlur, mockOnChange, mockOnSearch] = mockHandlers;
    render(
      <SearchBox
        {...defaultProps}
        onBlur={mockOnBlur}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
      />,
    );

    const box = screen.getByRole('searchbox');

    // Test blur with no changes
    userEvent.click(box);
    fireEvent.blur(box);
    expect(mockOnBlur).toHaveBeenCalledTimes(1);
    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockOnSearch).not.toHaveBeenCalled();
    mockHandlers.forEach((m) => m.mockClear());

    // Test blur with changes
    userEvent.click(box);
    userEvent.type(screen.getByRole('searchbox'), '.');
    fireEvent.blur(box);
    expect(mockOnBlur).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledTimes(2); // 1 call when character typed, 1 call on blur
    expect(mockOnSearch).toHaveBeenCalledTimes(1); // No `waitFor` as we expect onSearch to be called immediately on blur
    mockHandlers.forEach((m) => m.mockClear());

    // Test blur with no changes *after* changes
    userEvent.click(box);
    fireEvent.blur(box);
    expect(mockOnBlur).toHaveBeenCalledTimes(1);
    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockOnSearch).not.toHaveBeenCalled();
    mockHandlers.forEach((m) => m.mockClear());
  });

  test('should handle form submit correctly', () => {
    const mockHandlers = [jest.fn(), jest.fn(), jest.fn()];
    const [mockOnBlur, mockOnChange, mockOnSearch] = mockHandlers;
    const { container } = render(
      <SearchBox
        {...defaultProps}
        onBlur={mockOnBlur}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
      />,
    );
    const box = screen.getByRole('searchbox');
    const form = container.getElementsByTagName('form')[0];

    // Test submit with no changes
    userEvent.click(box);
    fireEvent.submit(form);
    expect(box).not.toHaveFocus();
    expect(mockOnBlur).toHaveBeenCalledTimes(1);
    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockOnSearch).not.toHaveBeenCalled();
    mockHandlers.forEach((m) => m.mockClear());

    // Test submit with changes
    userEvent.click(box);
    userEvent.type(screen.getByRole('searchbox'), '.');
    fireEvent.submit(form);
    expect(mockOnBlur).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledTimes(2); // 1 call when character typed, 1 call on blur
    expect(mockOnSearch).toHaveBeenCalledTimes(1); // No `waitFor` as we expect onSearch to be called immediately on blur
    mockHandlers.forEach((m) => m.mockClear());
  });

  test('should have a clear button', async () => {
    const mockOnChange = jest.fn();
    const mockOnSearch = jest.fn();

    render(
      <SearchBox
        {...defaultProps}
        value={SOME_TEXT}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
      />,
    );
    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    expect(clearButton).toBeInTheDocument();

    userEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('');

    await waitFor(() => expect(mockOnSearch).toHaveBeenCalledTimes(1));
  });

  test('should not have a clear button if the box is empty', async () => {
    render(<SearchBox {...defaultProps} value="" />);
    expect(screen.queryByTestId('react-feather X icon')).not.toBeInTheDocument();
  });
});
