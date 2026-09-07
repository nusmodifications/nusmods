import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'utils/cn';

export const badgeVariants = cva('ui-badge', {
  variants: {
    variant: {
      default: 'ui-badge-default',
      secondary: 'ui-badge-secondary',
      destructive: 'ui-badge-destructive',
      outline: 'ui-badge-outline',
    },
  },
  defaultVariants: { variant: 'default' },
});
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, asChild, ...props }, ref) => {
    const Component = asChild ? Slot.Root : 'span';
    return <Component ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
  },
);
Badge.displayName = 'Badge';
