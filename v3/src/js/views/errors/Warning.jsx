// @flow
import React from 'react';
import { AlertTriangle } from 'views/components/icons';
import styles from './Warning.scss';

type Props = {
  message: string,
}

export default function Warning(props: Props) {
  return (
    <div className="text-center mt-4">
      <AlertTriangle className={styles.noModulesIcon} />
      <h4>{props.message}</h4>
    </div>
  );
}
