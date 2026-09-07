import * as React from 'react';
import { cn } from 'utils/cn';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      !['checkbox', 'radio', 'range', 'hidden', 'file', 'color'].includes(type) && 'ui-input',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
