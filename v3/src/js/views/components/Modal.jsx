// @flow

import React, { type Node } from 'react';
import ReactModal from 'react-modal';
import classnames from 'classnames';
import styles from './Modal.scss';

type Props = {
  overlayClassName?: string,
  className?: string,
  onRequestClose: Function,
  children: Node,
};

export default function ({ className, overlayClassName, children, onRequestClose, ...rest }: Props) {
  return (
    <ReactModal
      onRequestClose={onRequestClose}
      overlayClassName={classnames(styles.overlay, overlayClassName)}
      className={classnames(styles.modal, className)}
      {...rest}
    >
      <button
        className="close"
        type="button"
        onClick={onRequestClose}
        aria-label="Close"
      >
        &times;
      </button>

      {children}
    </ReactModal>
  );
}
