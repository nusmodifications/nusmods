import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'utils/cn';

// shadcn/ui's owned-source Button, with its utility styles expressed in Sass.
export const buttonVariants = cva('ui-button', {
  variants: {
    variant: {
      default: 'ui-button-default',
      destructive: 'ui-button-destructive',
      outline: 'ui-button-outline',
      secondary: 'ui-button-secondary',
      ghost: 'ui-button-ghost',
      link: 'ui-button-link',
    },
    size: {
      default: 'ui-button-size-default',
      sm: 'ui-button-size-sm',
      lg: 'ui-button-size-lg',
      icon: 'ui-button-size-icon',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Component = asChild ? Slot.Root : 'button';
    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        type={asChild ? type : type || 'button'}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
