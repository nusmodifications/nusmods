import { useCallback, useLayoutEffect, useState } from 'react';
import type { FC, PropsWithChildren } from 'react';
import ReactModal, { Props as ModalProps } from 'react-modal';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import classnames from 'classnames';

import styles from './Modal.scss';

type Props = ModalProps & {
  isOpen: boolean;
  overlayClassName?: string;
  className?: string;
  fullscreen?: boolean;
  animate?: boolean;
};

const Modal: FC<PropsWithChildren<Props>> = ({
  isOpen,
  overlayClassName,
  className,
  fullscreen = false,
  animate,
  children,
  ...otherModalProps
}) => {
  // Because ReactModal's contentRef is only provided after all effects have
  // executed, in order for `Modal` to react to the setting/unsetting of
  // `contentRef`, `contentRef` needs to be stored in component state, even if
  // this causes additional renders.
  const [modalContent, setModalContent] = useState<HTMLDivElement | undefined>();
  const contentRefCallback = useCallback((node: HTMLDivElement) => setModalContent(node), []);

  // Disable body scrolling if modal is open, but allow modal to scroll.
  useLayoutEffect(() => {
    if (!modalContent) {
      return undefined;
    }
    if (isOpen) {
      disableBodyScroll(modalContent);
      return () => enableBodyScroll(modalContent);
    }
    enableBodyScroll(modalContent);
    return undefined;
  }, [isOpen, modalContent]);

  return (
    <ReactModal
      overlayClassName={classnames(styles.overlay, overlayClassName)}
      className={classnames(styles.modal, className, {
        [styles.fullscreen]: fullscreen,
        [styles.animated]: animate,
      })}
      closeTimeoutMS={animate ? 150 : 0}
      isOpen={isOpen}
      contentRef={contentRefCallback}
      {...otherModalProps}
    >
      {children}
    </ReactModal>
  );
};

export default Modal;
