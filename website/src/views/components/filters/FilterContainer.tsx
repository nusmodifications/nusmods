import React from 'react';
import { PanelProps } from 'searchkit';
import styles from './styles.scss';

const FilterContainer = ({ disabled, title, children }: PanelProps) => {
  if (disabled) return null;
  return (
    <div className={styles.checklist}>
      <h4 className={styles.heading}>{title}</h4>
      {children}
    </div>
  );
};

export default FilterContainer;
