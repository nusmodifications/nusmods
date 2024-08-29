import { useSelect } from 'downshift';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'react-feather';
import classNames from 'classnames';

import styles from './CustomModuleModalDropdown.scss';

interface CustomModuleModalDropdownProps {
  options: string[];
  defaultSelectedOption?: string;
  defaultText?: string;
  onChange: (value: string) => any;
}

const CustomModuleModalDropdown: React.FC<CustomModuleModalDropdownProps> = ({
  options,
  defaultSelectedOption,
  defaultText,
  onChange,
}) => {
  const { isOpen, getToggleButtonProps, getMenuProps, getItemProps, selectedItem } = useSelect({
    items: options,
    selectedItem: defaultSelectedOption,
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        onChange(selectedItem);
      }
    },
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const updateDropdownPosition = useCallback(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const distanceToBottom = window.innerHeight - buttonRect.bottom;
      setDropdownStyle({
        top: buttonRect.bottom,
        left: buttonRect.left,
        maxHeight: distanceToBottom,
      });
    }
  }, [isOpen, buttonRef]);

  // Update dropdown position when dropdown is opened or window resized
  useEffect(updateDropdownPosition, [isOpen, buttonRef]);
  useLayoutEffect(() => {
    window.addEventListener('resize', () => {
      updateDropdownPosition();
    });
  }, []);

  return (
    <div className={classNames('dropdown', styles.dropdown)}>
      <button
        className="btn btn-outline-primary btn-svg"
        {...getToggleButtonProps({ ref: buttonRef })}
      >
        {selectedItem?.length ? selectedItem : defaultText ?? ''}
        <ChevronDown className="svg svg-small" />
      </button>
      <ul
        className={classNames('dropdown-menu', styles.dropdownMenu)}
        style={{ ...dropdownStyle, display: isOpen ? 'block' : 'none' }}
        {...getMenuProps()}
      >
        {options.map((option, index) => (
          <li
            key={option}
            {...getItemProps({ item: option, index })}
            className="dropdown-item"
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomModuleModalDropdown;
