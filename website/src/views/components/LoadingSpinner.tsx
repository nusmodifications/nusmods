import * as React from 'react';
import classnames from 'classnames';
import styles from './LoadingSpinner.scss';

type Props = {
  small?: boolean;
  white?: boolean;
};

const LoadingSpinner: React.FC<Props> = ({ small, white }) => {
  return (
    <div
      className={classnames(styles.loader, {
        [styles.small]: small,
        [styles.white]: white,
      })}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
