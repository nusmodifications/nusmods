import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { Check, Minus } from 'react-feather';
import { cn } from 'utils/cn';

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, checked, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    checked={checked}
    className={cn('ui-checkbox', className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="ui-checkbox-indicator">
      {checked === 'indeterminate' ? <Minus /> : <Check />}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = 'Checkbox';
