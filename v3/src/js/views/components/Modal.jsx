// @flow

import React, { type Node, Component } from 'react';
import ReactModal from 'react-modal';
import classnames from 'classnames';
import styles from './Modal.scss';
import noScroll from '../../utils/no-scroll';

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

  componentDidUpdate() {
    noScroll(this.props.isOpen);
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
