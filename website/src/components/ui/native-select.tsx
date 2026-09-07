import * as React from 'react';
import { cn } from 'utils/cn';

export const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn('ui-native-select', className)} {...props} />
));
NativeSelect.displayName = 'NativeSelect';
export const NativeSelectOption = 'option';
export const NativeSelectOptGroup = 'optgroup';
