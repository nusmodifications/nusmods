import { memo, useLayoutEffect, useRef, useState } from 'react';

import { ChevronDown } from 'react-feather';
import Downshift from 'downshift';
import classnames from 'classnames';
import styles from './PlannerModule.scss';

type Props = {
  readonly isInTimetable?: boolean;

  readonly removeModule: () => void;
  readonly editCustomData: () => void;
  readonly addModuleToTimetable: () => void;
  readonly viewSemesterTimetable: () => void;
};

type MenuItem = {
  label: string;
  action: () => void;
  className?: string;
};

const ModuleMenu = memo((props: Props) => {
  const [isMenuOverflowing, setMenuOverflowing] = useState<boolean>(false);
  const [hasRendered, setHasRendered] = useState<boolean>(false);
  const myRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = [
    { label: 'Edit Unit and Title', action: props.editCustomData },
    props.isInTimetable
      ? { label: 'View in Timetable', action: props.viewSemesterTimetable }
      : { label: 'Add to Timetable', action: props.addModuleToTimetable },
    { label: 'Remove', action: props.removeModule, className: 'dropdown-item-danger' },
  ];

  useLayoutEffect(() => {
    if (myRef.current === null) {
      return;
    }

    const rect = myRef.current.getBoundingClientRect();
    setMenuOverflowing(rect.right <= window.innerWidth);
  }, [hasRendered, myRef]);

  const toggleRender = () => setHasRendered((hasAlreadyRendered) => !hasAlreadyRendered);

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
            onClick={() => {
              toggleMenu();
              toggleRender();
            }}
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            <ChevronDown />
          </button>
          <div
            className={classnames(
              styles.menu,
              'dropdown-menu',
              { show: isOpen },
              isMenuOverflowing ? styles.menuRight : styles.menuLeft,
            )}
            {...getMenuProps({ ref: myRef })}
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
