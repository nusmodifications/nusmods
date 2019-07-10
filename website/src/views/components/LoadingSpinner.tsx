import * as React from 'react';
import classnames from 'classnames';
import styles from './LoadingSpinner.scss';

type Props = {
  small?: boolean;
};

export default function LoadingSpinner(props: Props) {
  return (
    <div className={classnames(styles.loader, { [styles.small]: props.small })}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
