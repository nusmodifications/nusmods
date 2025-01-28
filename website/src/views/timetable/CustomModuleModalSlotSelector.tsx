import React from 'react';
import CustomModuleModalButtonGroup from './CustomModuleModalButtonGroup';
import styles from './CustomModuleModalButtonGroup.scss';

interface CustomModuleModalSlotSelectorProps {
  options: number[];
  selected: number[];

  setSelected: (weeks: number[]) => void;
  addButtonHandler: () => void;
  deleteButtonHandler: () => void;
}

const CustomModuleModalSlotSelector = ({
  options,
  selected,
  setSelected,
  addButtonHandler,
  deleteButtonHandler,
}: CustomModuleModalSlotSelectorProps) => {
  return (
    <>
      <div className={styles.container}>
        <p className={styles.shortcuts}>
          <label htmlFor="select-slot">Timeslots</label>{' '}
          {options.length > 1 && (
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => deleteButtonHandler()}
            >
              Delete Current Timeslot
            </button>
          )}
        </p>
        <CustomModuleModalButtonGroup
          options={options}
          selected={selected}
          setSelected={setSelected}
          addButtonHandler={addButtonHandler}
          isSingleSelect
        />
      </div>
    </>
  );
};

export default CustomModuleModalSlotSelector;
