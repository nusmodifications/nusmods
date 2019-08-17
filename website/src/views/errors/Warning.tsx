import * as React from 'react';
import { AlertTriangle } from 'react-feather';
import styles from './Warning.scss';

type Props = {
  message: string;
};

export default function Warning(props: Props) {
  return (
    <div className="text-center">
      <AlertTriangle className={styles.noModulesIcon} />
      <h4>{props.message}</h4>
    </div>
  );
}
