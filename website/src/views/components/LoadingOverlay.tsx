import classnames from 'classnames';
import type { FC } from 'react';
import styles from './LoadingOverlay.scss';

type Props = {
  deferred?: boolean;
};

const LoadingOverlay: FC<Props> = ({ children, deferred }) => (
  <div
    className={classnames(styles.loadingOverlay, {
      deferred, // Use global deferred class
    })}
  >
    {children}
  </div>
);

export default LoadingOverlay;
