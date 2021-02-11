import { X } from 'react-feather';
import classnames from 'classnames';
import Tooltip from 'views/components/Tooltip';
import styles from './DeleteButton.scss';

type Props = {
  label: string;
  removeModule: (moduleCodeToRemove: string) => Promise<void>;
  moduleCode: string;
};
const DeleteButton: React.FC<Props> = (props) => (
  <Tooltip content={props.label} touch="hold">
    <button
      type="button"
      className={classnames('btn btn-outline-secondary btn-svg', styles.delete)}
      aria-label={props.label}
      onClick={() => props.removeModule(props.moduleCode)}
    >
      <X className={styles.x} />
    </button>
  </Tooltip>
);

export default DeleteButton;
