import * as React from 'react';
import classnames from 'classnames';

import styles from './Fab.scss';

type Props = {
  children: React.ReactNode;
  className?: string;
};

function Fab({ children, className, ...otherProps }: Props) {
  return (
    <div className={classnames(className, styles.fab)}>
      <button className="mdc-fab material-icons" {...otherProps}>
        {children}
      </button>
    </div>
  );
}

export default Fab;
