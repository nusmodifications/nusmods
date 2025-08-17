import { Shuffle } from 'react-feather';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { openNotification } from 'actions/app';
import { RandomPickerProps } from 'views/components/searchkit/RandomPicker';
import { modulePage } from 'views/routes/paths';

import styles from './ModuleRandomButton.scss';

const ModuleRandomButton: React.FC<RandomPickerProps> = ({ getRandomModuleCode }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const handleClick = () => {
    getRandomModuleCode()
      .then((moduleCode) => history.push(modulePage(moduleCode)))
      .catch(() => {
        dispatch(openNotification('Failed to fetch a random course.'));
      });
  };

  return (
    <button type="button" className={styles.moduleRandomButton} onClick={handleClick}>
      <Shuffle className="svg svg-small" />
      Random Course
    </button>
  );
};

export default ModuleRandomButton;
