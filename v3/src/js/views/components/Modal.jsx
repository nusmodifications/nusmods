// @flow

import React, { type Node } from 'react';
import ReactModal from 'react-modal';
import classnames from 'classnames';
import CloseButton from 'views/components/CloseButton';
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
      <CloseButton onClick={onRequestClose} />
      {children}
    </ReactModal>
  );
}
