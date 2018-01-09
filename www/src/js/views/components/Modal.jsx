// @flow

import React, { type Node, Component } from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import ReactModal from 'react-modal';
import classnames from 'classnames';

import type { State } from 'reducers';
import noScroll from 'utils/noScroll';
import styles from './Modal.scss';

type Props = {
  isOpen: boolean,
  overlayClassName?: string,
  className?: string,
  children: Node,
  theme: number,
  fullscreen: boolean,
};

export class ModalComponent extends Component<Props> {
  static defaultProps = {
    fullscreen: false,
  };

  componentDidMount() {
    noScroll(this.props.isOpen);
  }

  // noScroll must trigger before actual opening of modal
  componentWillUpdate(nextProps: Props) {
    if (this.props.isOpen !== nextProps.isOpen) {
      noScroll(nextProps.isOpen);
    }
  }

  componentWillUnmount() {
    // Ensure noScroll is disabled if the component is unmounted without
    // the modal closing
    noScroll(false);
  }

  render() {
    const { className, overlayClassName, children, theme, fullscreen, ...rest } = this.props;

    return (
      <ReactModal
        overlayClassName={classnames(styles.overlay, overlayClassName)}
        className={classnames(styles.modal, className, `theme-${theme}`, {
          [styles.fullscreen]: fullscreen,
        })}
        {...rest}
      >
        {children}
      </ReactModal>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({ theme: state.theme.id });
export default connect(mapStateToProps)(ModalComponent);
