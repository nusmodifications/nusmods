import { Loader } from 'react-feather';
import { cn } from 'utils/cn';

export const Spinner = ({ className, ...props }: React.ComponentProps<typeof Loader>) => (
  <Loader className={cn('ui-spinner', className)} aria-hidden="true" {...props} />
);
