import * as React from 'react';
import styles from './overlay.scss';

type Props = {
  readonly children: Node;
};

export default function GameOverlay(props: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.overlayContent}>{props.children}</div>
    </div>
  );
}
