import { FC, memo, ReactNode } from 'react';

type Props = {
  children: ReactNode[];
  reverse: boolean;
};

const ConditionalReverse: FC<Props> = ({ children, reverse }) => (
  <>{reverse ? [...children].reverse() : children}</>
);

export default memo(ConditionalReverse);
