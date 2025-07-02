import classNames from 'classnames';
import { Shuffle } from 'react-feather';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import type { State } from 'types/state';
import { modulePage } from 'views/routes/paths';

const ModuleRandomButton: React.FC = () => {
  const modules = useSelector((state: State) => state.moduleBank).moduleList;
  const history = useHistory();

  const handleClick = () => {
    const randomMod = modules[Math.floor(Math.random() * modules.length)];
    history.push(modulePage(randomMod.moduleCode));
  };

  return (
    <button
      type="button"
      className={classNames('btn', 'btn-outline-primary', 'btn-block', 'btn-svg')}
      onClick={handleClick}
    >
      <Shuffle className="svg" />
      Random Course
    </button>
  );
};

export default ModuleRandomButton;
