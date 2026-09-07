import * as React from 'react';
import { Slot } from 'radix-ui';
import { cn } from 'utils/cn';

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Component = asChild ? Slot.Root : 'div';
  return <Component ref={ref} className={cn('ui-card', className)} {...props} />;
});
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Component = asChild ? Slot.Root : 'div';
  return <Component ref={ref} className={cn('ui-card-header', className)} {...props} />;
});
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Component = asChild ? Slot.Root : 'h3';
  return <Component ref={ref} className={cn('ui-card-title', className)} {...props} />;
});
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Component = asChild ? Slot.Root : 'p';
  return <Component ref={ref} className={cn('ui-card-description', className)} {...props} />;
});
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Component = asChild ? Slot.Root : 'div';
  return <Component ref={ref} className={cn('ui-card-content', className)} {...props} />;
});
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Component = asChild ? Slot.Root : 'div';
  return <Component ref={ref} className={cn('ui-card-footer', className)} {...props} />;
});
CardFooter.displayName = 'CardFooter';
