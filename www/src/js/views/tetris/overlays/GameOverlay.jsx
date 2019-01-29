// @flow

import React, { type Node } from 'react';
import styles from './overlay.scss';

type Props = {|
  +children: Node,
|};

export default function GameOverlay(props: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.overlayContent}>{props.children}</div>
    </div>
  );
}
