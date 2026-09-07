import * as React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';
import { cn } from 'utils/cn';

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn('ui-label', className)} {...props} />
));
Label.displayName = 'Label';
