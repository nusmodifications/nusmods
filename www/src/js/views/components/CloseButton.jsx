// @flow

import React from 'react';
import classnames from 'classnames';
import { Close } from 'views/components/icons';

import styles from './CloseButton.scss';

type Props = {
  onClick: Function,
  className?: string,
};

export default function CloseButton({ onClick, className }: Props) {
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

// Absolute positioned CloseButton
// For use in modals where we don't want the CloseButton to affect the layout of other elements.
export function AbsCloseButton(props: Props) {
  return (
    <div className={styles.closeContainer}>
      <CloseButton {...props} className={classnames(props.className, styles.absCloseBtn)} />
    </div>
  );
}
