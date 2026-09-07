import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { FC, PropsWithChildren } from 'react';
import classnames from 'classnames';
import { Dialog, DialogContent, DialogTitle } from 'components/ui/dialog';

import styles from './Modal.scss';

type Props = {
  onRequestClose?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  shouldCloseOnOverlayClick?: boolean;
  shouldCloseOnEsc?: boolean;
  shouldFocusAfterRender?: boolean;
  shouldReturnFocusAfterClose?: boolean;
  contentLabel?: string;
  id?: string;
  role?: 'dialog' | 'alertdialog';
  aria?: { labelledby?: string; describedby?: string };
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
  onRequestClose,
  shouldCloseOnOverlayClick = true,
  shouldCloseOnEsc = true,
  shouldFocusAfterRender = true,
  shouldReturnFocusAfterClose = true,
  contentLabel,
  id,
  role,
  aria,
}) => {
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const [title, setTitle] = useState(contentLabel || '');
  const previousFocus = useRef<HTMLElement | null>(null);
  const contentRef = useCallback((node: HTMLDivElement | null) => setContent(node), []);

  // Reuse the existing heading as the accessible dialog name without changing its copy.
  useLayoutEffect(() => {
    if (content) {
      const heading = content.querySelector(
        'h1:not([data-modal-title]), h2:not([data-modal-title]), h3, h4',
      );
      const input = content.querySelector<HTMLInputElement>('input[placeholder]');
      setTitle(
        contentLabel || heading?.textContent || input?.placeholder || content.textContent || '',
      );
    }
  }, [content, contentLabel]);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        ref={contentRef}
        id={id}
        {...(role ? { role } : {})}
        showCloseButton={false}
        overlayClassName={overlayClassName}
        className={classnames(styles.modal, className, {
          [styles.fullscreen]: fullscreen,
          [styles.animated]: animate,
        })}
        aria-label={contentLabel}
        {...(aria?.labelledby ? { 'aria-labelledby': aria.labelledby } : {})}
        aria-describedby={aria?.describedby}
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          if (shouldCloseOnEsc) {
            onRequestClose?.(event as unknown as React.KeyboardEvent);
          }
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault();
          if (shouldCloseOnOverlayClick) {
            onRequestClose?.(event.detail.originalEvent as unknown as React.MouseEvent);
          }
        }}
        onOpenAutoFocus={(event) => {
          previousFocus.current = document.activeElement as HTMLElement | null;
          if (!shouldFocusAfterRender) event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (shouldReturnFocusAfterClose) previousFocus.current?.focus();
        }}
      >
        <DialogTitle className="sr-only" data-modal-title>
          {title}
        </DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
