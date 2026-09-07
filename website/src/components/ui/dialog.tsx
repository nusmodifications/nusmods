import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { X } from 'react-feather';
import { cn } from 'utils/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cn('ui-dialog-overlay', className)} {...props} />
));
DialogOverlay.displayName = 'DialogOverlay';

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  overlayClassName?: string;
  container?: HTMLElement;
};
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showCloseButton = true, overlayClassName, container, ...props }, ref) => (
  <DialogPortal container={container}>
    <DialogOverlay className={overlayClassName} />
    <DialogPrimitive.Content ref={ref} className={cn('ui-dialog-content', className)} {...props}>
      {children}
      {showCloseButton && (
        <DialogClose className="ui-dialog-close" aria-label="Close">
          <X />
        </DialogClose>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';
export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('ui-dialog-title', className)} {...props} />
));
DialogTitle.displayName = 'DialogTitle';
export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('ui-dialog-description', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';
export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('ui-dialog-header', className)} {...props} />
);
export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('ui-dialog-footer', className)} {...props} />
);
