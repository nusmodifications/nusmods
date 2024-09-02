import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import styles from './CustomModuleModalButtonGroup.scss';

interface CustomModuleModalButtonGroupProps {
  options: number[];
  defaultSelected: boolean[];
  onChange: (selected: number[]) => void;
}

const CustomModuleModalButtonGroup: React.FC<CustomModuleModalButtonGroupProps> = ({
  options,
  defaultSelected,
  onChange,
}) => {
  const [selected, setSelected] = useState(defaultSelected);

  const toggleSelected = useCallback(
    (index: number) => {
      // Toggle the option in the selected list
      const newSelected = [...selected];
      newSelected[index] = !newSelected[index];
      setSelected(newSelected);

      onChange(options.filter((_, index) => selected[index]));
    },
    [options, selected, onChange],
  );

  return (
    <div className={styles.container}>
      <div className={styles.buttonGroup}>
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={classNames(
              'btn',
              styles.button,
              selected[index] ? 'btn-primary' : 'btn-outline-primary',
            )}
            onClick={() => toggleSelected(index)}
          >
            {option}
          </button>
        ))}
      </div>
      <p className={styles.shortcuts}>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => setSelected(options.map(() => false))}
        >
          None
        </button>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => setSelected(options.map(() => true))}
        >
          All
        </button>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => setSelected(options.map((_, index) => index % 2 === 0))}
        >
          Odd Weeks
        </button>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => setSelected(options.map((_, index) => index % 2 === 1))}
        >
          Even Weeks
        </button>
      </p>
    </div>
  );
};

export default CustomModuleModalButtonGroup;
