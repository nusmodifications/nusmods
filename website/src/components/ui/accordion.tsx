import * as React from 'react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import { ChevronDown } from 'react-feather';
import { cn } from 'utils/cn';

export const Accordion = AccordionPrimitive.Root;
export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn('ui-accordion-item', className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';
export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="ui-accordion-header">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn('ui-accordion-trigger', className)}
      {...props}
    >
      {children}
      <ChevronDown aria-hidden="true" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';
export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn('ui-accordion-content', className)}
    {...props}
  >
    <div className="ui-accordion-content-inner">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = 'AccordionContent';
