import { useSelect } from 'downshift';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'react-feather';
import classNames from 'classnames';

import styles from './CustomModuleModalDropdown.scss';

interface CustomModuleModalDropdownProps {
  className?: string;
  options: string[];
  defaultSelectedOption?: string;
  defaultText?: string;
  error?: string;
  required?: boolean;
  onChange: (value: string) => void;
}

const CustomModuleModalDropdown: React.FC<CustomModuleModalDropdownProps> = ({
  className,
  options,
  defaultSelectedOption,
  defaultText,
  error,
  required,
  onChange,
}) => {
  const optionsWithBlank = useMemo(
    () => (required ? options : ['', ...options]),
    [options, required],
  );

  const { isOpen, getToggleButtonProps, getMenuProps, getItemProps, selectedItem } = useSelect({
    items: optionsWithBlank,
    selectedItem: defaultSelectedOption,
    onSelectedItemChange: ({ selectedItem: item }) => {
      if (typeof item === 'string') {
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
    <div className={className}>
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
          className={classNames(
            'dropdown-menu',
            styles.dropdownMenu,
            isOpen ? styles.open : styles.closed,
          )}
          style={dropdownStyle}
          {...getMenuProps()}
        >
          {optionsWithBlank.map((option, index) => (
            <li
              key={option}
              {...getItemProps({ item: option, index })}
              className={classNames('dropdown-item', styles.item)}
            >
              {option.length ? option : 'None'}
            </li>
          ))}
        </ul>
      </div>
      <small className={styles.errorLabel}>{error ?? ''}</small>
    </div>
  );
};

export default CustomModuleModalDropdown;
