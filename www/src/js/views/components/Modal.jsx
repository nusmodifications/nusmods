// @flow

import React, { type Node, Component } from 'react';
import ReactModal from 'react-modal';
import classnames from 'classnames';

import disableScrolling from 'utils/disableScrolling';
import styles from './Modal.scss';

type Props = {
  isOpen: boolean,
  overlayClassName?: string,
  className?: string,
  children: Node,
  fullscreen: boolean,
};

export default class Modal extends Component<Props> {
  static defaultProps = {
    fullscreen: false,
  };

  componentDidMount() {
    disableScrolling(this.props.isOpen);
  }

  // noScroll must trigger before actual opening of modal
  componentWillUpdate(nextProps: Props) {
    if (this.props.isOpen !== nextProps.isOpen) {
      disableScrolling(nextProps.isOpen);
    }
  }

  componentWillUnmount() {
    // Ensure noScroll is disabled if the component is unmounted without
    // the modal closing
    disableScrolling(false);
  }

  render() {
    const { className, overlayClassName, children, fullscreen, ...rest } = this.props;

    return (
      <ReactModal
        overlayClassName={classnames(styles.overlay, overlayClassName)}
        className={classnames(styles.modal, className, {
          [styles.fullscreen]: fullscreen,
        })}
        {...rest}
      >
        {children}
      </ReactModal>
    );
  }
}
