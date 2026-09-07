import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';
import { cn } from 'utils/cn';

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root ref={ref} className={cn('ui-switch', className)} {...props}>
    <SwitchPrimitive.Thumb className="ui-switch-thumb" />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';
