import classNames from 'classnames';
import React, { useCallback } from 'react';
import styles from './CustomModuleModalButtonGroup.scss';

interface CustomModuleModalButtonGroupProps {
  options: number[];
  selected: number[];
  isSingleSelect?: boolean;

  setSelected: (weeks: number[]) => void;
  addButtonHandler?: () => void;
}

const CustomModuleModalButtonGroup: React.FC<CustomModuleModalButtonGroupProps> = ({
  options,
  selected,
  isSingleSelect,
  setSelected,
  addButtonHandler,
}) => {
  const toggleSelected = useCallback(
    (option: number) => {
      if (isSingleSelect) {
        setSelected([option]);
      } else {
        // For multi-select, toggle the selected state of the option
        if (selected.includes(option)) {
          setSelected(selected.filter((i) => i !== option));
        } else {
          setSelected([...selected, option].toSorted((a, b) => a - b));
        }
      }
    },
    [isSingleSelect, selected],
  );

  return (
    <div className={styles.buttonGroup}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={classNames(
            'btn',
            styles.button,
            selected.includes(option) ? 'btn-primary' : 'btn-outline-primary',
          )}
          onClick={() => toggleSelected(option)}
        >
          {option}
        </button>
      ))}
      {addButtonHandler && (
        <button
          type="button"
          className={classNames('btn', styles.button, 'btn-outline-primary')}
          onClick={addButtonHandler}
        >
          +
        </button>
      )}
    </div>
  );
};

export default CustomModuleModalButtonGroup;
