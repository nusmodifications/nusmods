// @flow
import React from 'react';
import styles from './LoadingSpinner.scss';

export default function LoadingSpinner() {
  return (
    <div className={styles.loader}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
