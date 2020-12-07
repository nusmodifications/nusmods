import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosError } from 'axios';
import ReactModal from 'react-modal';

import type { Venue, VenueInfo } from 'types/venues';

import { sortVenues } from 'utils/venues';
import { venuePage } from 'views/routes/paths';
import { mockDom, mockDomReset, mockWindowMatchMedia } from 'test-utils/mockDom';
import { modalElementId, modalElementSelector } from 'test-utils/modal';
import renderWithRouterMatch from 'test-utils/renderWithRouterMatch';

import venueInfo from '__mocks__/venueInformation.json';

import { VenuesContainerComponent } from './VenuesContainer';

const venues = sortVenues(venueInfo as VenueInfo);

const someError: Partial<AxiosError> = {
  response: {
    data: undefined,
    status: 500,
    statusText: 'Test error',
    headers: {},
    config: {},
  },
};

function make(selectedVenue: Venue | null = null, search = '') {
  const rendered = renderWithRouterMatch(
    <>
      <VenuesContainerComponent venues={venues} />
      <div id={modalElementId} />
    </>,
    {
      path: '/venues/:venue?',
      location: venuePage(selectedVenue) + search,
    },
  );
  ReactModal.setAppElement(modalElementSelector);
  return rendered;
}

describe(VenuesContainerComponent, () => {
  let mockAxiosRequest: jest.SpiedFunction<typeof axios.request>;

  beforeEach(() => {
    mockDom();

    // Default to wide viewport
    mockWindowMatchMedia({ matches: false });

    // TODO: Add tests with augmented venue info; we'll just pretend they don't exist for now
    mockAxiosRequest = jest.spyOn(axios, 'request').mockRejectedValue(someError);
  });

  afterEach(() => {
    mockAxiosRequest.mockRestore();
    mockDomReset();
  });

  test('should populate UI with URL info (no info)', () => {
    make();

    expect(screen.getByRole('searchbox')).toHaveValue('');

    // Expect all venues to be shown in list
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toMatchInlineSnapshot(`
      Array [
        "CQT/SR0622",
        "LT1",
        "lt2",
        "LT17",
        "S11-0302",
      ]
    `);

    // Expect availability search to be inactive
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
  });

  test('should populate UI with URL info (selected venue)', () => {
    make('CQT/SR0622');

    expect(screen.getByRole('searchbox')).toHaveValue('');

    // Expect selected venue info to be shown
    expect(screen.getAllByRole('button').map((button) => button.textContent))
      .toMatchInlineSnapshot(`
      Array [
        " Find free rooms",
        "PC4241TUT [ST1]",
        "PC2132TUT [ST2]",
        "PC4241TUT [ST3]",
        "PC2132TUT [ST4]",
        "PC2132TUT [ST5]",
      ]
    `);

    // Expect availability search to be inactive
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
  });

  test('should populate UI with URL info (query)', () => {
    make(null, '?q=hello+world');

    expect(screen.getByRole('searchbox')).toHaveValue('hello world');

    // Expect availability search to be inactive
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
  });

  test('should populate UI with URL info (availability)', () => {
    make(null, '?day=1&time=9&duration=1');

    expect(screen.getByRole('searchbox')).toHaveValue('');

    const availabilitySelects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    expect(availabilitySelects.map((select) => select.value)).toEqual(['1', '9', '1']);
  });

  test('should update URL with typed query', () => {
    const { history } = make();
    const searchbox = screen.getByRole('searchbox');
    userEvent.type(searchbox, 'covfefe');
    expect(history.location.search).toBe('?q=covfefe');
  });

  test('should update URL with availability input', () => {
    const { history } = make();

    userEvent.click(screen.getByRole('button', { name: 'Find free rooms' }));
    expect(history.location.search).toMatch(/\?day=\d&duration=1&time=\d{1,2}/); // Actual value depends on current date

    userEvent.selectOptions(screen.getByRole('combobox', { name: 'On' }), '2');
    userEvent.selectOptions(screen.getByRole('combobox', { name: 'From' }), '15');
    userEvent.selectOptions(screen.getByRole('combobox', { name: 'To' }), '5');
    expect(history.location.search).toBe('?day=2&duration=5&time=15');
  });

  test('should filter results based on typed query', () => {
    make();
    const searchbox = screen.getByRole('searchbox');
    userEvent.type(searchbox, 'LT');
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toMatchInlineSnapshot(`
      Array [
        "LT1",
        "lt2",
        "LT17",
      ]
    `);
  });

  test('should filter results based on availability input', () => {
    make();

    // Manually select an availability so that the search results will be deterministic
    userEvent.click(screen.getByRole('button', { name: 'Find free rooms' }));
    userEvent.selectOptions(screen.getByRole('combobox', { name: 'On' }), '1');
    userEvent.selectOptions(screen.getByRole('combobox', { name: 'From' }), '8');
    userEvent.selectOptions(screen.getByRole('combobox', { name: 'To' }), '16');

    expect(screen.getAllByRole('link').map((link) => link.textContent)).toMatchInlineSnapshot(`
      Array [
        "CQT/SR0622",
        "lt2",
      ]
    `);
  });

  test('should update URL when selecting a venue', () => {
    const search = '?q=LT';
    const { history } = make(null, search);

    // Sanity checks
    expect(history.location.pathname).toBe('/venues'); // Ensure nothing is selected
    expect(history.location.search).toBe(search); // Ensure query is set

    // Test selecting a venue when no venue was selected
    userEvent.click(screen.getByRole('link', { name: 'lt2' }));
    expect(history.location.pathname).toBe('/venues/lt2');
    expect(history.location.search).toBe(search); // Expect query to be unchanged

    // Test selecting another venue
    userEvent.click(screen.getAllByRole('link', { name: 'LT17' })[1]); // 2 links present: one in list, one in detail pane
    expect(history.location.pathname).toBe('/venues/LT17');
    expect(history.location.search).toBe(search); // Expect query to be unchanged
  });

  test('should retain existing query and filters after selecting a venue', () => {
    make(null, '?q=lt&day=1&time=9&duration=1');

    userEvent.click(screen.getByRole('link', { name: 'lt2' }));

    // Expect below to be true before and after clicking the link
    expect(screen.getByRole('searchbox')).toHaveValue('lt');
    const availabilitySelects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    expect(availabilitySelects.map((select) => select.value)).toEqual(['1', '9', '1']);
  });

  test('should prompt for venue selection if no venue selected', () => {
    make();
    expect(screen.getByText(/Select a venue on the left to see its timetable/)).toBeInTheDocument();
  });

  test('should prompt for venue selection if non-existent venue selected', () => {
    make('heaven');
    expect(screen.getByText(/Select a venue on the left to see its timetable/)).toBeInTheDocument();
  });

  describe('narrow viewport detail modal', () => {
    beforeEach(() => {
      // Set up narrow viewport
      mockWindowMatchMedia({ matches: true });
    });

    test('modal should have a working back button', () => {
      make();

      expect(screen.queryByRole('button', { name: 'Back to Venues' })).not.toBeInTheDocument();

      userEvent.click(screen.getByRole('link', { name: 'lt2' }));
      const backButton = screen.getByRole('button', { name: 'Back to Venues' });
      expect(backButton).toBeInTheDocument();

      userEvent.click(backButton);
      expect(backButton).not.toBeInTheDocument();
    });
  });
});
