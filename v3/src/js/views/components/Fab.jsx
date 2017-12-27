// @flow

import React, { type Node } from 'react';
import { Fab as ReactMaterialFab } from 'rmwc/Fab';
import classnames from 'classnames';

import styles from './Fab.scss';

type Props = {
  children: Node,
  className?: string,
};

function Fab({ children, className, ...otherProps }: Props) {
  return (
    <div className={classnames(className, styles.fab)}>
      <ReactMaterialFab {...otherProps}>{children}</ReactMaterialFab>
    </div>
  );
}

export default Fab;
