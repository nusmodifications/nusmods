import { Settings } from 'react-feather';
import { breakpointDown } from 'utils/css';
import useMediaQuery from 'views/hooks/useMediaQuery';

export type Props = Readonly<{
  onClick: () => void;
}>;

export default function PlannerButton(props: Props) {
  const narrowViewport = useMediaQuery(breakpointDown('sm'));

  return (
    <button className="btn btn-svg btn-outline-primary" type="button" onClick={props.onClick}>
      <Settings className="svg" />
      {narrowViewport ? '' : 'Settings'}
    </button>
  );
}
