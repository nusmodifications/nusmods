import * as React from 'react';
import classnames from 'classnames';
import { X as Close } from 'react-feather';

import styles from './CloseButton.scss';

type Props = {
  onClick: () => void;
  className?: string;
  absolutePositioned?: boolean; // For use in modals where we don't want the CloseButton to affect the layout of other elements.
};

const RawCloseButton: React.FC<Props> = ({ onClick, className }) => (
  <button
    className={classnames('close', className)}
    type="button"
    onClick={onClick}
    aria-label="Close"
  >
    <Close />
  </button>
);

const CloseButton: React.FC<Props> = (props) => {
  if (!props.absolutePositioned) return <RawCloseButton {...props} />;
  return (
    <div className={styles.closeContainer}>
      <RawCloseButton {...props} className={classnames(props.className, styles.absCloseBtn)} />
    </div>
  );
};

export default CloseButton;
