import { FC } from 'react';
import { Trash } from 'react-feather';
import Tooltip from 'views/components/Tooltip';

type Props = {
  clearPlanner: () => void;
};

const PlannerClearButton: FC<Props> = (props: Props) => (
  <Tooltip content="Are you sure? This action is irreversible!" placement="left">
    <button className="btn btn-svg btn-outline-primary" type="button" onClick={props.clearPlanner}>
      <Trash className="svg" />
      <p>Clear</p>
    </button>
  </Tooltip>
);

export default PlannerClearButton;
