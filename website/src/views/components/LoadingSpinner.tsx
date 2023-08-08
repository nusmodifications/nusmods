import * as React from 'react';
import classnames from 'classnames';
import styles from './LoadingSpinner.scss';

type Props = {
  small?: boolean;
  white?: boolean;
  className?: string;
};

const LoadingSpinner: React.FC<Props> = ({ small, white, className }) => (
  <div
    className={classnames(styles.loader, className, {
      [styles.small]: small,
      [styles.white]: white,
    })}
  >
    <span className="sr-only">Loading...</span>
  </div>
);

export default LoadingSpinner;
