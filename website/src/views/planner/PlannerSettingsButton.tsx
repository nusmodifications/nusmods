import React from 'react';
import { Settings } from 'react-feather';
import { breakpointDown } from 'utils/css';
import useMediaQuery from 'views/hooks/useMediaQuery';

type Props = Readonly<{
  onClick: () => void;
}>;

const PlannerSettingsButton: React.FC<Props> = ({ onClick }) => {
  const narrowViewport = useMediaQuery(breakpointDown('sm'));

  return (
    <button className="btn btn-svg btn-outline-primary" type="button" onClick={onClick}>
      <Settings className="svg" />
      {narrowViewport ? '' : 'Settings'}
    </button>
  );
};

export default PlannerSettingsButton;
