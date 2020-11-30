import { AnchorHTMLAttributes, forwardRef, ReactNode } from 'react';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

// Renders an anchor tag that safely opens href in a new tab or window.
// See https://mathiasbynens.github.io/rel-noopener/
const ExternalLink = forwardRef<HTMLAnchorElement, Props>(({ children, ...otherProps }, ref) => (
  <a target="_blank" rel="noopener noreferrer" ref={ref} {...otherProps}>
    {children}
  </a>
));

export default ExternalLink;
