import { mount } from 'enzyme';

import { RefinementItem } from 'types/views';
import { mockDom, mockDomReset } from 'test-utils/mockDom';
import DropdownListFilters from './DropdownListFilters';

describe(DropdownListFilters, () => {
  beforeEach(() => {
    mockDom();
  });

  afterEach(() => {
    mockDomReset();
  });

  const CHECKBOX = '☑';

  /* eslint-disable camelcase */
  const allItems: RefinementItem[] = [
    { key: "It's a Test", doc_count: 20 },
    { key: 'Still Testing', doc_count: 0, missing: true },
    { key: "It's Business Time", missing: true },
    { key: "This One's For Pickering" },
  ];
  /* eslint-enable */

  function make(items: RefinementItem[], selectedItems: string[]) {
    const onFilterChange = jest.fn();

    return {
      onFilterChange,

      wrapper: mount(
        <DropdownListFilters
          items={items}
          selectedItems={selectedItems}
          toggleItem={onFilterChange}
          setItems={() => {
            /* do nothing; provide only because setItems must be set */
          }}
        />,
      ),
    };
  }

  // TODO: Write some sort of adaptor that reads off both <select> and <Downshift>
  //       to ensure values in both match
  test('use native <select> element on mobile', () => {
    const { wrapper } = make(allItems, []);

    expect(wrapper.find('select').exists()).toBe(true);
    expect(wrapper.find('option')).toHaveLength(allItems.length + 1); // 1 extra placeholder

    expect(wrapper.find('ul.list-unstyled input')).toHaveLength(0);
  });

  test('change value when <select> value changes', () => {
    const { wrapper, onFilterChange } = make(allItems, []);

    // Simulate selecting an <option> in the <select>
    const { key: firstItemKey } = allItems[0];
    wrapper.find('select').simulate('change', { target: { value: firstItemKey } });
    expect(onFilterChange.mock.calls.length).toEqual(1);
    const [[toggledKey]] = onFilterChange.mock.calls;
    expect(toggledKey).toEqual(firstItemKey);

    wrapper.setProps({ selectedItems: [firstItemKey] });

    // Should render the option inside the <select> with a checkmark
    expect(wrapper.find('option').at(1).text()).toMatch(CHECKBOX);

    // Should render the item in the checklist outside
    const checklist = wrapper.find('ul.list-unstyled input');
    expect(checklist).toHaveLength(1);
    expect(checklist.at(0).prop('checked')).toBe(true);
  });

  test('render a list of previously selected items outside the <select>', () => {
    const { key: firstItemKey } = allItems[0];
    const { wrapper, onFilterChange } = make(allItems, [firstItemKey]);

    // Should render the item in the checklist outside
    const checklist1 = wrapper.find('ul.list-unstyled input');
    expect(checklist1).toHaveLength(1);
    expect(checklist1.at(0).prop('checked')).toBe(true);

    // Simulate unchecking the checkbox on the checklist outside
    checklist1.simulate('change', { target: { value: false } });
    expect(onFilterChange.mock.calls.length).toEqual(1);
    const [[toggledKey]] = onFilterChange.mock.calls;
    expect(toggledKey).toEqual(firstItemKey);

    wrapper.setProps({ selectedItems: [] });
    const checklist2 = wrapper.find('ul.list-unstyled input');
    expect(checklist2).toHaveLength(1);
    expect(checklist2.at(0).prop('checked')).toBe(false);
  });
});
