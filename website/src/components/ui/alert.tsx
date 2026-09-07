import * as React from 'react';
import { Slot } from 'radix-ui';
import { cn } from 'utils/cn';

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, asChild, variant = 'default', role = 'alert', ...props }, ref) => {
    const Component = asChild ? Slot.Root : 'div';
    return (
      <Component
        ref={ref}
        role={role}
        className={cn('ui-alert', `ui-alert-${variant}`, className)}
        {...props}
      />
    );
  },
);
Alert.displayName = 'Alert';
