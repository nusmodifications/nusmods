import { FC, useEffect } from 'react';
import ReactModal, { Props as ModalProps } from 'react-modal';
import classnames from 'classnames';

import disableScrolling from 'utils/disableScrolling';
import styles from './Modal.scss';

type Props = ModalProps & {
  isOpen: boolean;
  overlayClassName?: string;
  className?: string;
  fullscreen?: boolean;
  animate?: boolean;
};

const Modal: FC<Props> = ({
  isOpen,
  overlayClassName,
  className,
  fullscreen = false,
  animate,
  children,
  ...otherModalProps
}) => {
  useEffect(() => {
    disableScrolling(isOpen);

    // Ensure disableScrolling is disabled if the component is
    // unmounted without the modal closing
    return () => disableScrolling(false);
  }, [isOpen]);

  return (
    <ReactModal
      overlayClassName={classnames(styles.overlay, overlayClassName)}
      className={classnames(styles.modal, className, {
        [styles.fullscreen]: fullscreen,
        [styles.animated]: animate,
      })}
      closeTimeoutMS={animate ? 150 : 0}
      isOpen={isOpen}
      {...otherModalProps}
    >
      {children}
    </ReactModal>
  );
};

export default Modal;
