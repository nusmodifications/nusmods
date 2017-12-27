// @flow

import React, { type Node, Component } from 'react';
import ReactModal from 'react-modal';
import classnames from 'classnames';

import noScroll from 'utils/noScroll';
import styles from './Modal.scss';

type Props = {
  isOpen: boolean,
  overlayClassName?: string,
  className?: string,
  children: Node,
};

export default class Modal extends Component<Props> {
  componentDidMount() {
    noScroll(this.props.isOpen);
  }

  // noScroll must trigger before actual opening of modal
  componentWillUpdate(nextProps: Props) {
    if (this.props.isOpen !== nextProps.isOpen) {
      noScroll(nextProps.isOpen);
    }
  }

  render() {
    const { className, overlayClassName, children, ...rest } = this.props;

    return (
      <ReactModal
        overlayClassName={classnames(styles.overlay, overlayClassName)}
        className={classnames(styles.modal, className)}
        {...rest}
      >
        {children}
      </ReactModal>
    );
  }
}
