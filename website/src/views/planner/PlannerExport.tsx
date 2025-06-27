import { downloadPlannerAsJson } from 'actions/export';
import { FC, useCallback } from 'react';
import { Download } from 'react-feather';
import { useDispatch } from 'react-redux';

const PlannerExport: FC = () => {
  const dispatch = useDispatch();
  const download = useCallback(() => {
    dispatch(downloadPlannerAsJson());
  }, [dispatch]);

  return (
    <button className="btn btn-svg btn-outline-primary" type="button" onClick={download}>
      <Download className="svg" />
      <p>Download</p>
    </button>
  );
};

export default PlannerExport;
