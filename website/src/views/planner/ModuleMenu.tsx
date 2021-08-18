import { memo, useRef, useState } from 'react';
import Downshift, { StateChangeOptions } from 'downshift';
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
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const myRef = useRef<Downshift<string>>(null);

  const menuItems: MenuItem[] = [
    { label: 'Edit MC and Title', action: props.editCustomData },
    { label: 'Remove', action: props.removeModule, className: 'dropdown-item-danger' },
  ];

  const adjustVisitibility = (options: StateChangeOptions<string>) => {
    // Only enable toggle when isOpen value changes
    // when the toggle button is pressed.
    if (options && options.isOpen !== undefined) {
      toggleVisibility();
    }
  };

  const toggleVisibility = () => {
    if (!myRef.current) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const elem = document.getElementById((myRef.current as any).getMenuProps().id);

    if (!elem) {
      return;
    }

    const coords = elem.getBoundingClientRect();
    setIsVisible(coords.right <= window.innerWidth);
  };

  window.addEventListener('resize', toggleVisibility);

  return (
    <Downshift
      ref={myRef}
      onUserAction={adjustVisitibility}
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
            onClick={() => {
              toggleMenu();
              toggleVisibility();
            }}
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            <ChevronDown />
          </button>
          <div
            className={classnames(isVisible ? styles.menuRight : styles.menuLeft, 'dropdown-menu', {
              show: isOpen,
            })}
            {...getMenuProps()}
          >
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
