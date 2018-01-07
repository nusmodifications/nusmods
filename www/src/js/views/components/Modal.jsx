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
};

export class ModalComponent extends Component<Props> {
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
    const { className, overlayClassName, children, theme, ...rest } = this.props;

    return (
      <ReactModal
        overlayClassName={classnames(styles.overlay, overlayClassName)}
        className={classnames(styles.modal, className, `theme-${theme}`)}
        {...rest}
      >
        {children}
      </ReactModal>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({ theme: state.theme.id });
export default connect(mapStateToProps)(ModalComponent);
