import * as React from 'react';
import classnames from 'classnames';

import styles from './Fab.scss';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
};

const Fab: React.FC<Props> = ({ children, className, ...otherProps }) => (
  <div className={classnames(className, styles.fab)}>
    <button type="button" className="mdc-fab material-icons" {...otherProps}>
      <div className="mdc-fab__ripple" />
      {children}
    </button>
  </div>
);

export default Fab;
