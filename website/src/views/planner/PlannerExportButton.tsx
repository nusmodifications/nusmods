import { Button } from 'components/ui/button';
import { FC } from 'react';
import { Download } from 'react-feather';

type Props = {
  downloadPlanner: () => void;
};

const PlannerExportButton: FC<Props> = (props: Props) => (
  <Button variant="outline" className="btn-svg" type="button" onClick={props.downloadPlanner}>
    <Download className="svg" />
    <p>Download</p>
  </Button>
);

export default PlannerExportButton;
