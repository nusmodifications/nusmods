import * as React from 'react';
import { cn } from 'utils/cn';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('ui-textarea', className)} {...props} />
));
Textarea.displayName = 'Textarea';
