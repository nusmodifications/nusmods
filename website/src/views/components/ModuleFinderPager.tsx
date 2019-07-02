import * as React from 'react';
import classnames from 'classnames';

type Props = {
  items: { key: string; label: string; disabled: boolean }[];
  selectedItems: string[];
  toggleItem: (key: string) => void;
};

const ModuleFinderPager = ({ items, selectedItems, toggleItem }: Props) => {
  return (
    <nav aria-label="Module search result pagination">
      <ul className="pagination justify-content-center">
        {items.map(({ key, label, disabled }) => (
          <li
            key={key}
            className={classnames(
              'page-item',
              disabled ? 'disabled' : null,
              selectedItems.includes(key) ? 'active' : null,
            )}
          >
            <button type="button" className="page-link" onClick={() => toggleItem(key)}>
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ModuleFinderPager;
