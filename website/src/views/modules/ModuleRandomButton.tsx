import { Shuffle } from 'react-feather';
import { useHistory } from 'react-router-dom';
import { RandomPickerProps } from 'views/components/searchkit/RandomPicker';
import Tooltip from 'views/components/Tooltip';
import { modulePage } from 'views/routes/paths';

const ModuleRandomButton: React.FC<RandomPickerProps> = ({ getRandomModuleCode }) => {
  const history = useHistory();

  const handleClick = () => {
    getRandomModuleCode().then((moduleCode) => history.push(modulePage(moduleCode)));
  };

  return (
    <Tooltip content="Feeling lucky? Roll a course with your filters!">
      <button
        type="button"
        className="btn btn-outline-primary btn-block btn-svg"
        onClick={handleClick}
      >
        <Shuffle className="svg svg-small" />
        Random Course
      </button>
    </Tooltip>
  );
};

export default ModuleRandomButton;
