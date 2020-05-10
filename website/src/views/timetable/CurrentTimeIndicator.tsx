import * as React from 'react';
import classnames from 'classnames';
import styles from './CurrentTimeIndicator.scss';

type Props = {
  style: React.CSSProperties;
};

const CurrentTimeIndicator: React.FC<Props> = (props) => (
  <div className={classnames('no-export', styles.currentTimeIndicator)} style={props.style}>
    <div className={styles.circularPart} />
    <div className={styles.linePart} />
  </div>
);

export default CurrentTimeIndicator;
