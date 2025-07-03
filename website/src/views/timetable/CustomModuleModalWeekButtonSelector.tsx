import React from 'react';
import CustomModuleModalButtonGroup from './CustomModuleModalButtonGroup';
import styles from './CustomModuleModalButtonGroup.scss';

interface CustomModuleModalWeekButtonSelectorProps {
  options: number[];
  error?: string;
  selected: number[];

  setSelected: (weeks: number[]) => void;
}

const CustomModuleModalWeekButtonSelector = ({
  options,
  error,
  selected,
  setSelected,
}: CustomModuleModalWeekButtonSelectorProps) => {
  const handleSelectNone = () => {
    setSelected([]);
  };

  const handleSelectAll = () => {
    setSelected(options);
  };

  const handleSelectOdd = () => {
    setSelected(options.filter((v) => v % 2 === 1));
  };

  const handleSelectEven = () => {
    setSelected(options.filter((v) => v % 2 === 0));
  };

  return (
    <div className={styles.container}>
      <CustomModuleModalButtonGroup
        options={options}
        selected={selected}
        setSelected={setSelected}
      />
      <p className={styles.shortcuts}>
        <button type="button" className="btn btn-outline-primary" onClick={handleSelectNone}>
          None
        </button>
        <button type="button" className="btn btn-outline-primary" onClick={handleSelectAll}>
          All
        </button>
        <button type="button" className="btn btn-outline-primary" onClick={handleSelectOdd}>
          Odd Weeks
        </button>
        <button type="button" className="btn btn-outline-primary" onClick={handleSelectEven}>
          Even Weeks
        </button>
      </p>
      <small className={styles.errorLabel}>{error ?? ''}</small>
    </div>
  );
};

export default CustomModuleModalWeekButtonSelector;
