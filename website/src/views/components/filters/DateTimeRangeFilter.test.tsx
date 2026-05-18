import { mount } from 'enzyme';
import { SearchkitManager } from 'searchkit';

import DateTimeRangeFilter from './DateTimeRangeFilter';

describe(DateTimeRangeFilter, () => {
  let mockSearchkit: SearchkitManager;

  beforeEach(() => {
    mockSearchkit = SearchkitManager.mock();
  });

  it('renders start and end datetime inputs', () => {
    const wrapper = mount(
      <DateTimeRangeFilter
        searchkit={mockSearchkit}
        id="examDate"
        title="Exam Date"
        field="semesterData.examDate"
        fieldOptions={{ type: 'nested', options: { path: 'semesterData' } }}
      />,
    );

    const inputs = wrapper.find('input[type="datetime-local"]');

    expect(inputs).toHaveLength(2);
    expect(inputs.at(0).prop('id')).toBe('examDate-start');
    expect(inputs.at(1).prop('id')).toBe('examDate-end');
  });

  it('applies a nested exam date range filter for the selected bounds', () => {
    const performSearchSpy = vi.spyOn(mockSearchkit, 'performSearch');
    const wrapper = mount(
      <DateTimeRangeFilter
        searchkit={mockSearchkit}
        id="examDate"
        title="Exam Date"
        field="semesterData.examDate"
        fieldOptions={{ type: 'nested', options: { path: 'semesterData' } }}
      />,
    );

    wrapper.find('#examDate-start').simulate('change', {
      target: { value: '2026-04-25T09:00' },
    });
    wrapper.find('#examDate-end').simulate('change', {
      target: { value: '2026-04-27T18:30' },
    });

    const query = mockSearchkit.buildQuery().getJSON();

    expect(performSearchSpy).toHaveBeenCalledTimes(2);
    expect(query.post_filter).toEqual({
      nested: {
        path: 'semesterData',
        query: {
          range: {
            'semesterData.examDate': {
              gte: '2026-04-25T09:00:00.000Z',
              lte: '2026-04-27T18:30:00.000Z',
            },
          },
        },
      },
    });
    expect(mockSearchkit.buildQuery().getSelectedFilters()[0]).toMatchObject({
      name: 'Exam Date',
      value: '2026-04-25T09:00 - 2026-04-27T18:30',
      id: 'examDate',
    });
  });

  it('clears the filter when both bounds are empty', () => {
    const wrapper = mount(
      <DateTimeRangeFilter
        searchkit={mockSearchkit}
        id="examDate"
        title="Exam Date"
        field="semesterData.examDate"
        fieldOptions={{ type: 'nested', options: { path: 'semesterData' } }}
      />,
    );

    wrapper.find('#examDate-start').simulate('change', {
      target: { value: '2026-04-25T09:00' },
    });
    wrapper.find('#examDate-start').simulate('change', {
      target: { value: '' },
    });

    expect(mockSearchkit.buildQuery().getJSON().post_filter).toBeUndefined();
  });
});
