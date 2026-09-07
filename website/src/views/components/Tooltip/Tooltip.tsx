import * as React from 'react';
import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'components/ui/tooltip';

type PortalContainer = Element | DocumentFragment;
export type Props = {
  children: React.ReactElement;
  content: React.ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  distance?: number;
  delay?: number | [number, number];
  interactive?: boolean;
  arrow?: boolean;
  touch?: 'hold' | ['hold', number];
  appendTo?: PortalContainer | ((reference: Element) => PortalContainer);
};

export type TooltipGroupProps = {
  children: React.ReactNode;
  distance?: number;
};

const GroupContext = React.createContext<Pick<TooltipGroupProps, 'distance'> | null>(null);

const Tooltip: React.FC<Props> = ({
  children,
  content,
  placement = 'top',
  distance,
  delay = 0,
  interactive = false,
  arrow = false,
  touch,
  appendTo,
}) => {
  const group = React.useContext(GroupContext);
  const [open, setOpen] = React.useState(false);
  const [trigger, setTrigger] = React.useState<Element | null>(null);
  const holdTimer = React.useRef<ReturnType<typeof setTimeout>>();
  const closeTimer = React.useRef<ReturnType<typeof setTimeout>>();
  const held = React.useRef(false);
  const suppressClickUntil = React.useRef(0);
  const [openDelay, closeDelay] = Array.isArray(delay) ? delay : [delay, delay];

  React.useEffect(
    () => () => {
      clearTimeout(holdTimer.current);
      clearTimeout(closeTimer.current);
    },
    [],
  );

  const onOpenChange = (nextOpen: boolean) => {
    clearTimeout(closeTimer.current);
    if (!nextOpen && closeDelay) {
      closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
    } else {
      setOpen(nextOpen);
    }
  };

  const endTouch = () => {
    clearTimeout(holdTimer.current);
    if (held.current) {
      // A long press shows the hint; only an ordinary tap activates the action.
      suppressClickUntil.current = Date.now() + 500;
      held.current = false;
      setOpen(false);
    }
  };

  const container =
    typeof appendTo === 'function' ? (trigger ? appendTo(trigger) : undefined) : appendTo;
  const tooltip = (
    <TooltipRoot
      open={open}
      onOpenChange={onOpenChange}
      delayDuration={openDelay}
      disableHoverableContent={!interactive}
    >
      <TooltipTrigger
        ref={setTrigger}
        asChild
        onTouchStart={() => {
          if (!touch) return;
          clearTimeout(holdTimer.current);
          holdTimer.current = setTimeout(
            () => {
              held.current = true;
              setOpen(true);
            },
            Array.isArray(touch) ? touch[1] : 500,
          );
        }}
        onTouchEnd={endTouch}
        onTouchCancel={endTouch}
        onTouchMove={endTouch}
        onClickCapture={(event) => {
          if (Date.now() < suppressClickUntil.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={placement}
        sideOffset={distance ?? group?.distance ?? 6}
        container={container}
        arrow={arrow}
      >
        {content}
      </TooltipContent>
    </TooltipRoot>
  );

  return group ? tooltip : <TooltipProvider delayDuration={0}>{tooltip}</TooltipProvider>;
};

const TooltipGroup: React.FC<TooltipGroupProps> = ({ children, distance }) => {
  const settings = React.useMemo(() => ({ distance }), [distance]);
  return (
    <GroupContext.Provider value={settings}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </GroupContext.Provider>
  );
};

export default Tooltip;
export { TooltipGroup };
