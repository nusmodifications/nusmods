import { Button } from 'components/ui/button';
import * as React from 'react';
import classnames from 'classnames';

import styles from './Fab.scss';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
};

const Fab: React.FC<Props> = ({ children, className, ...otherProps }) => (
  <div className={classnames(className, styles.fab)}>
    <Button type="button" size="icon" className="ui-fab" {...otherProps}>
      {children}
    </Button>
  </div>
);

export default Fab;
