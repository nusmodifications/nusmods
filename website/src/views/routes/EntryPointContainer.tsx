import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useParams } from 'react-router-dom';
import type { Dispatch } from 'types/redux';
import type { EntryPoint } from './types';

type Props = {
  entryPoint: EntryPoint<any>;
};

const EntryPointContainer: React.FC<Props> = ({ entryPoint }) => {
  const EntryPointComponent = entryPoint.component.read();
  const params = useParams();
  const dispatch = useDispatch<Dispatch>();
  // TODO: Figure out a way to prepare outside render. Should reuse prepare result from preload
  return (
    <EntryPointComponent params={params} prepared={entryPoint.prepare(params, dispatch)}>
      <Outlet />
    </EntryPointComponent>
  );
};

export default memo(EntryPointContainer);
