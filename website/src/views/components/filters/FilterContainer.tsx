import * as React from 'react';
import { PanelProps } from 'searchkit';

import styles from './styles.scss';

const FilterContainer: React.FC<React.PropsWithChildren<PanelProps>> = ({
  disabled,
  title,
  children,
}) => {
  if (disabled) return null;

  return (
    <div className={styles.checklist}>
      <h4 className={styles.heading}>{title}</h4>
      {children}
    </div>
  );
};

export default FilterContainer;
