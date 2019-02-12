import * as React from 'react';
import ReactModal, { Props as ModalProps } from 'react-modal';
import classnames from 'classnames';

import disableScrolling from 'utils/disableScrolling';
import styles from './Modal.scss';

type Props = ModalProps & {
  isOpen: boolean;
  overlayClassName?: string;
  className?: string;
  children?: React.ReactNode;
  fullscreen: boolean;
  animate?: boolean;
};

export default class Modal extends React.Component<Props> {
  static defaultProps = {
    fullscreen: false,
  };

  componentDidMount() {
    disableScrolling(this.props.isOpen);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.isOpen !== prevProps.isOpen) {
      disableScrolling(this.props.isOpen);
    }
  }

  componentWillUnmount() {
    // Ensure disableScrolling is disabled if the component is
    // unmounted without the modal closing
    disableScrolling(false);
  }

  render() {
    const { className, overlayClassName, children, fullscreen, animate, ...rest } = this.props;

    return (
      <ReactModal
        overlayClassName={classnames(styles.overlay, overlayClassName)}
        className={classnames(styles.modal, className, {
          [styles.fullscreen]: fullscreen,
          [styles.animated]: animate,
        })}
        closeTimeoutMS={animate ? 150 : 0}
        {...rest}
      >
        {children}
      </ReactModal>
    );
  }
}
