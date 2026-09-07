import * as React from 'react';
import { Toast as ToastPrimitive } from 'radix-ui';
import { cn } from 'utils/cn';

export const ToastProvider = ToastPrimitive.Provider;
export const ToastClose = ToastPrimitive.Close;
export const ToastAction = ToastPrimitive.Action;
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport ref={ref} className={cn('ui-toast-viewport', className)} {...props} />
));
ToastViewport.displayName = 'ToastViewport';
export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Root ref={ref} className={cn('ui-toast', className)} {...props} />
));
Toast.displayName = 'Toast';
export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('ui-toast-description', className)}
    {...props}
  />
));
ToastDescription.displayName = 'ToastDescription';
