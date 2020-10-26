import React, { memo, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useParams } from 'react-router-dom';
import { isEqual } from 'lodash';
import useMemoCompare from 'views/hooks/useMemoCompare';
import type { Dispatch } from 'types/redux';
import type { EntryPoint } from './types';

type Props = {
  entryPoint: EntryPoint<any>;
};

const EntryPointContainer: React.FC<Props> = ({ entryPoint }) => {
  const EntryPointComponent = entryPoint.component.read();
  const params = useParams();
  const dispatch = useDispatch<Dispatch>();

  // Use a memoized copy of params so that we don't cause unnecessary
  // renders/disposes if params didn't actually change.
  const stableParams = useMemoCompare(params, isEqual);

  const prepared = useMemo(() => {
    return entryPoint.getPreparedProps(stableParams, dispatch);
  }, [stableParams, entryPoint, dispatch]);

  // Dispose of any prepared props if they're no longer usable.
  useEffect(() => {
    return () => entryPoint.disposePreparedProps?.(stableParams);
  }, [entryPoint, prepared, stableParams]);

  return (
    <EntryPointComponent prepared={prepared}>
      <Outlet />
    </EntryPointComponent>
  );
};

export default memo(EntryPointContainer);
