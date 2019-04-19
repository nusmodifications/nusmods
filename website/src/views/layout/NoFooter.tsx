import * as React from 'react';
import styles from './NoFooter.scss';

// Stupid hack to hide footer using a position fixed element that
// hides the footer
export default function() {
  return <div className={styles.noFooter} />;
}
