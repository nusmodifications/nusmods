import { FC } from 'react';
import { Download } from 'react-feather';

type Props = {
  downloadPlanner: () => void;
};

const PlannerExportButton: FC<Props> = (props: Props) => (
  <button className="btn btn-svg btn-outline-primary" type="button" onClick={props.downloadPlanner}>
    <Download className="svg" />
    <p>Download</p>
  </button>
);

export default PlannerExportButton;
