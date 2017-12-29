// @flow
import React from 'react';

import styles from './CurrentTimeIndicator.scss';

type Props = {
  style: Object,
};

function CurrentTimeIndicator(props: Props) {
  return (
    <div className={styles.currentTimeIndicator} style={props.style}>
      <div className={styles.circularPart} />
      <div className={styles.linePart} />
    </div>
  );
}

export default CurrentTimeIndicator;
