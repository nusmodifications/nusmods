import React, { FC, PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { State } from 'types/state';

type RehydrateGateProps = PropsWithChildren<{
  onBeforeLift: () => void;
}>;

const RehydrateGate: FC<RehydrateGateProps> = ({ children, onBeforeLift }) => {
  const isRehydrated = useSelector<State, boolean>((state) => state.reduxRemember.isRehydrated);

  React.useEffect(() => {
    if (isRehydrated) onBeforeLift();
  }, [isRehydrated, onBeforeLift]);

  if (!isRehydrated) return null;

  return children;
};

export default RehydrateGate;
