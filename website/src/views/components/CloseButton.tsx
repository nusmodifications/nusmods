import * as React from 'react';
import classnames from 'classnames';
import { X as Close } from 'react-feather';

import styles from './CloseButton.scss';

type Props = {
  onClick: () => void;
  className?: string;
  absolutePositioned?: boolean; // For use in modals where we don't want the CloseButton to affect the layout of other elements.
};

function RawCloseButton({ onClick, className }: Props) {
  return (
    <button
      className={classnames('close', className)}
      type="button"
      onClick={onClick}
      aria-label="Close"
    >
      <Close />
    </button>
  );
}

export default function CloseButton(props: Props) {
  if (!props.absolutePositioned) return <RawCloseButton {...props} />;
  return (
    <div className={styles.closeContainer}>
      <RawCloseButton {...props} className={classnames(props.className, styles.absCloseBtn)} />
    </div>
  );
}
