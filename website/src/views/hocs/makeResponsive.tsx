import type { ComponentType } from 'react'

import useMediaQuery from 'views/hooks/useMediaQuery';
import { MediaQuery } from 'types/views';

export type WithBreakpoint = {
  matchBreakpoint: boolean;
};

/**
 * @deprecated Use `useMediaQuery` instead.
 */
export default function makeResponsive<Props extends WithBreakpoint>(
  WrappedComponent: ComponentType<Props>,
  mediaQuery: MediaQuery,
): ComponentType<Omit<Props, keyof WithBreakpoint>> {
  return (props) => {
    const matchBreakpoint = useMediaQuery(mediaQuery);
    // TODO: remove as Props hack as defined in:
    // https://github.com/Microsoft/TypeScript/issues/28938#issuecomment-450636046
    return <WrappedComponent {...(props as Props)} matchBreakpoint={matchBreakpoint} />;
  };
}
