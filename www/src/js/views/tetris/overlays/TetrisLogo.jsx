// @flow

import React from 'react';
import styles from './TetrisLogo.scss';

export default function() {
  return (
    <div className={styles.wrapper}>
      {/* prettier-ignore */}
      <pre className={styles.logo}>{`___  ______________ ___________ _____ _____
|  \\/  |  _  |  _  \\_   _| ___ \\_   _/  ___|
| .  . | | | | | | | | | | |_/ / | | \\ \`--.
| |\\/| | | | | | | | | | |    /  | |  \`--. \\
| |  | \\ \\_/ / |/ /  | | | |\\ \\ _| |_/\\__/ /
\\_|  |_/\\___/|___/   \\_/ \\_| \\_|\\___/\\____/ `}</pre>
    </div>
  );
}
