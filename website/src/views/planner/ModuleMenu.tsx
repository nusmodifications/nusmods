import { memo } from 'react';
import Downshift from 'downshift';
import classnames from 'classnames';

import { ChevronDown } from 'react-feather';
import styles from './PlannerModule.scss';

type Props = {
  readonly removeModule: () => void;
  readonly editCustomData: () => void;
};

type MenuItem = {
  label: string;
  action: () => void;
  className?: string;
};

const ModuleMenu = memo((props: Props) => {
  const menuItems: MenuItem[] = [
    { label: 'Edit MC and Title', action: props.editCustomData },
    { label: 'Remove', action: props.removeModule, className: 'dropdown-item-danger' },
  ];

  return (
    <Downshift
      onSelect={(item) => {
        menuItems.forEach(({ label, action }) => {
          if (item === label) {
            action();
          }
        });
      }}
    >
      {({ getItemProps, getMenuProps, highlightedIndex, isOpen, toggleMenu }) => (
        <div className={styles.menuBtn}>
          <button
            className={classnames('btn close')}
            type="button"
            onClick={() => toggleMenu()}
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            <ChevronDown />
          </button>
          <div className={classnames('dropdown-menu', { show: isOpen })} {...getMenuProps()}>
            {menuItems.map(({ label, className }, itemIndex) => (
              <button
                type="button"
                key={label}
                className={classnames('dropdown-item', className, {
                  'dropdown-selected': highlightedIndex === itemIndex,
                })}
                {...getItemProps({ item: label })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </Downshift>
  );
});

export default ModuleMenu;
