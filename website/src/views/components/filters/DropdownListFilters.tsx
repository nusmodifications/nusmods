import { FC, useRef, useState } from 'react';
import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import { ListProps } from 'searchkit';
import classnames from 'classnames';
import { uniq, omit } from 'lodash';

import { Search, ChevronDown } from 'react-feather';
import useMediaQuery from 'views/hooks/useMediaQuery';
import { RefinementItem, RefinementDisplayItem } from 'types/views';
import { highlight } from 'utils/react';
import { breakpointDown, touchScreenOnly } from 'utils/css';
import Checklist from './Checklist';

import styles from './styles.scss';

type Props = ListProps;
type DisplayProps = {
  allItems: RefinementDisplayItem[];
  onSelectItem: (selectedItem: string) => void;
  showCount?: boolean;
  placeholder: string;
};

// Use a native select for mobile devices
const MobileFilter: FC<DisplayProps> = ({ allItems, onSelectItem, showCount, placeholder }) => (
  <select
    className="form-control"
    onChange={(evt) => {
      onSelectItem(evt.target.value);
      // Reset selection to the first placeholder item so that the last selected item
      // is not left selected in the <select>
      evt.target.selectedIndex = 0; // eslint-disable-line no-param-reassign
    }}
  >
    <option>{placeholder}</option>
    {allItems.map(({ key, doc_count: count, selected, missing }) => (
      <option key={key} value={key}>
        {/* Use a unicode checkbox to indicate to the user filters that are already enabled */}
        {selected && '☑'} {key} {showCount && !missing && `(${count})`}
      </option>
    ))}
  </select>
);

// Use a search-select combo dropdown on desktop
const DesktopFilter: FC<DisplayProps> = ({ allItems, onSelectItem, showCount, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);

  const onOuterClick = () => {
    // Preserve inputValue after outer click, otherwise the input field will
    // get blanked out.
    setInputValue(inputValue);
  };

  const onInputValueChange = (newInputValue: string) => setInputValue(newInputValue);

  const focusInput = () => {
    if (searchInput.current) {
      searchInput.current.focus();
    }
  };

  const stateReducer = (state: DownshiftState<string>, changes: StateChangeOptions<string>) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.blurInput:
        return omit(changes, 'inputValue');
      default:
        return changes;
    }
  };

  const filteredItems = allItems.filter(
    ({ key }) => !inputValue || key.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <Downshift
      onOuterClick={onOuterClick}
      onChange={(selectedItem, { clearSelection }) => {
        if (!selectedItem) return;
        onSelectItem(selectedItem);
        clearSelection();
      }}
      onInputValueChange={onInputValueChange}
      inputValue={inputValue}
      stateReducer={stateReducer}
    >
      {({
        getInputProps,
        getItemProps,
        openMenu,
        isOpen,
        inputValue: downshiftInputValue,
        highlightedIndex,
        getMenuProps,
      }) => (
        <div className="dropdown">
          <div
            className={classnames(styles.searchWrapper, {
              [styles.focused]: isFocused,
            })}
          >
            <Search className={styles.searchIcon} onClick={focusInput} />
            <input
              ref={searchInput}
              {...getInputProps({
                onFocus: () => {
                  setIsFocused(true);
                  openMenu();
                },
                onBlur: () => setIsFocused(false),
                className: classnames('form-control form-control-sm', styles.searchInput),
                placeholder,
              })}
            />
            <ChevronDown className={styles.openIcon} onClick={() => openMenu()} />
          </div>

          {isOpen && (
            <div className="dropdown-menu show" {...getMenuProps()}>
              {filteredItems.map(({ key, doc_count: count, selected }, index) => (
                <div
                  key={key}
                  {...getItemProps({
                    item: key,
                    className: classnames('dropdown-item form-check', {
                      'dropdown-selected': index === highlightedIndex,
                      [styles.enabled]: selected,
                    }),
                  })}
                >
                  <input
                    id={key}
                    className="form-check-input"
                    type="checkbox"
                    defaultChecked={selected}
                  />
                  <label htmlFor={key} className={classnames('form-check-label', styles.label)}>
                    {highlight(key, downshiftInputValue || '')}
                    {showCount && typeof count !== 'undefined' && (
                      <>
                        &nbsp;
                        <span className="text-muted">({count})</span>
                      </>
                    )}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Downshift>
  );
};

const DropdownListFilters: FC<Props> = ({
  items,
  selectedItems,
  toggleItem,
  showCount,
  translate,
}) => {
  const [searchedItems, setSearchedFilters] = useState(selectedItems);

  const onSelectItem = (selectedItem: string) => {
    if (!selectedItem) return;
    setSearchedFilters(uniq([...searchedItems, selectedItem]));
    toggleItem(selectedItem);
  };

  const selectedItemsSet = new Set(selectedItems);
  const allItems = items
    .map(
      ({ key, ...rest }: RefinementItem): RefinementDisplayItem => ({
        key,
        ...rest,
        selected: selectedItemsSet.has(key),
      }),
    )
    .sort(({ key: aKey }, { key: bKey }) => aKey.localeCompare(bKey));

  const displayProps: DisplayProps = {
    allItems,
    onSelectItem,
    showCount,
    placeholder: translate ? translate('placeholder') : '',
  };

  const isMobile = useMediaQuery([breakpointDown('sm'), touchScreenOnly()]);

  const FilterComponent = isMobile ? MobileFilter : DesktopFilter;
  return (
    <div className={styles.dropdown}>
      <FilterComponent {...displayProps} />
      {/* Show all filters that have been selected at some point */}
      <Checklist {...displayProps} selectedItems={selectedItems} searchedItems={searchedItems} />
    </div>
  );
};

export default DropdownListFilters;
