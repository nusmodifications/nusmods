import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useParams } from 'react-router-dom';
import { EntryPoint } from './types';

type Props = {
  entryPoint: EntryPoint<any>;
};

const EntryPointContainer: React.FC<Props> = ({ entryPoint }) => {
  const EntryPointComponent = entryPoint.component.read();
  const params = useParams();
  const dispatch = useDispatch();
  // TODO: Figure out a way to prepare outside render. Should reuse prepare result from preload
  return (
    <EntryPointComponent params={params} prepared={entryPoint.prepare(params, dispatch)}>
      <Outlet />
    </EntryPointComponent>
  );
};

export default memo(EntryPointContainer);
