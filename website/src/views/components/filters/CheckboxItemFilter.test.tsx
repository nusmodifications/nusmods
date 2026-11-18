import { render, screen } from '@testing-library/react';
import { SearchkitManager } from 'searchkit';

import CheckboxItemFilter from './CheckboxItemFilter';

describe(CheckboxItemFilter, () => {
  let mockSearchkit: SearchkitManager;

  beforeEach(() => {
    mockSearchkit = SearchkitManager.mock();
  });

  it('renders', () => {
    render(
      <CheckboxItemFilter
        searchkit={mockSearchkit}
        label="Test Checkbox"
        filter={{
          // eslint-disable-next-line camelcase
          match_all: {},
        }}
        id="test-id"
        disabled={false}
        showCount
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: /Test Checkbox/ });
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText(/Test Checkbox/)).toBeInTheDocument();
  });
});
