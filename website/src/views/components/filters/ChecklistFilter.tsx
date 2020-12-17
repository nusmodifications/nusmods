import { memo } from 'react';

import { ElasticSearchFilter } from 'types/vendor/elastic-search';
import FilterContainer from './FilterContainer';
import CheckboxItemFilter from './CheckboxItemFilter';

export type FilterItem = {
  key: string;
  label: string;
  filter: ElasticSearchFilter;
};

interface ChecklistFilterProps {
  title: string;
  items: FilterItem[];
  showCount?: boolean;
  disabled?: boolean;
}

const ChecklistFilter = memo<ChecklistFilterProps>(
  ({ title, items, disabled = false, showCount = true }) => (
    <FilterContainer title={title} disabled={disabled}>
      <ul className="list-unstyled">
        {items.map(({ key, filter, label }) => (
          <CheckboxItemFilter
            key={key}
            id={key}
            filter={filter}
            label={label}
            showCount={showCount}
            disabled={disabled}
          />
        ))}
      </ul>
    </FilterContainer>
  ),
);

ChecklistFilter.displayName = 'ChecklistFilter';

export default ChecklistFilter;
