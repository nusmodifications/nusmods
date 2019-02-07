// @flow
import React from 'react';
import { AlertTriangleIcon } from 'views/components/icons';
import styles from './Warning.scss';

type Props = {
  message: string,
};

export default function Warning(props: Props) {
  return (
    <div className="text-center">
      <AlertTriangleIcon className={styles.noModulesIcon} />
      <h4>{props.message}</h4>
    </div>
  );
}
