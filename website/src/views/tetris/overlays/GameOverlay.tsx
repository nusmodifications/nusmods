import * as React from 'react';
import styles from './overlay.scss';

type Props = {
  readonly children: React.ReactNode;
};

const GameOverlay: React.FC<Props> = (props) => (
  <div className={styles.overlay}>
    <div className={styles.overlayContent}>{props.children}</div>
  </div>
);

export default GameOverlay;
