import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import { cn } from 'utils/cn';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

type TooltipContentProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
  container?: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Portal>['container'];
  arrow?: boolean;
};

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, children, container, arrow = false, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal container={container}>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn('ui-tooltip-content', className)}
      {...props}
    >
      {children}
      {arrow && <TooltipPrimitive.Arrow className="ui-tooltip-arrow" />}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = 'TooltipContent';
