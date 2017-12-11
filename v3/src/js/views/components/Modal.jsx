// @flow

import React, { type Node } from 'react';
import ReactModal from 'react-modal';
import classnames from 'classnames';
import styles from './Modal.scss';

type Props = {
  overlayClassName?: string,
  classnames?: string,
  onRequestClose: Function,
  children: Node,
};

export default function (props: Props) {
  return (
    <ReactModal
      {...props}
      overlayClassName={classnames(styles.overlay, props.overlayClassName)}
      className={classnames(styles.modal, props.classnames)}
    >
      <button
        className="close"
        type="button"
        onClick={props.onRequestClose}
        aria-label="Close"
      >
        &times;
      </button>

      {props.children}
    </ReactModal>
  );
}
