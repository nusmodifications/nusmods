import * as React from 'react';
import { RefinementDisplayItem } from 'types/views';
import CheckboxItem from './CheckboxItem';

type Props = {
  allItems: RefinementDisplayItem[];
  selectedItems: string[]; // Items which are currently selected (i.e. checked)
  searchedItems: string[]; // Items which have been selected at some point
  onSelectItem: (selectedItem: string) => void;
  showCount?: boolean;
};

const Checklist: React.FC<Props> = ({
  allItems,
  selectedItems,
  searchedItems,
  onSelectItem,
  showCount,
}) => {
  const displayItems = searchedItems.map(
    (key) => allItems.find((i) => i.key === key) || { key, selected: selectedItems.includes(key) },
  );

  const itemComponents = displayItems.map(({ key, doc_count: count, selected }) => (
    <CheckboxItem
      key={key}
      active={selected}
      count={count || 0}
      showCount={showCount === true && typeof count !== 'undefined'}
      itemKey={key}
      label={key}
      onClick={() => onSelectItem(key)}
    />
  ));

  return <ul className="list-unstyled">{itemComponents}</ul>;
};

export default Checklist;
