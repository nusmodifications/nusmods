import { useSelect } from 'downshift';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'react-feather';
import classNames from 'classnames';

import styles from './CustomModuleModalDropdown.scss';

interface CustomModuleModalDropdownProps {
  options: string[];
  defaultSelectedOption?: string;
  defaultText?: string;
  error?: string;
  onChange: (value: string) => void;
}

const CustomModuleModalDropdown: React.FC<CustomModuleModalDropdownProps> = ({
  options,
  defaultSelectedOption,
  defaultText,
  error,
  onChange,
}) => {
  const { isOpen, getToggleButtonProps, getMenuProps, getItemProps, selectedItem } = useSelect({
    items: options,
    selectedItem: defaultSelectedOption,
    onSelectedItemChange: ({ selectedItem: item }) => {
      if (item) {
        onChange(item);
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
  useEffect(updateDropdownPosition, [isOpen, buttonRef, updateDropdownPosition]);
  useLayoutEffect(() => {
    window.addEventListener('resize', () => {
      updateDropdownPosition();
    });
  }, [updateDropdownPosition]);

  return (
    <>
      <div className={classNames('dropdown', styles.dropdown)}>
        <button
          type="button"
          className={classNames(
            'btn',
            'btn-outline-primary',
            'btn-svg',
            styles.dropdownButton,
            error ? 'alert-danger' : '',
          )}
          {...getToggleButtonProps({ ref: buttonRef })}
        >
          {selectedItem?.length ? selectedItem : defaultText ?? ''}
          <ChevronDown className={classNames('svg', 'svg-small', styles.btnSvg)} />
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
      <small className={styles.errorLabel}>{error ?? ''}</small>
    </>
  );
};

export default CustomModuleModalDropdown;
