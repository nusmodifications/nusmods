import classnames from 'classnames';
import { useCallback } from 'react';
import { X } from 'react-feather';
import Tooltip from 'views/components/Tooltip';
import styles from './DeleteButton.scss';

type Props = {
  label: string;
  removeModule: (moduleCodeToRemove: string) => void;
  moduleCode: string;
};

const DeleteButton: React.FC<Props> = ({ label, removeModule, moduleCode }) => {
  const handleClick = useCallback(() => removeModule(moduleCode), [moduleCode, removeModule]);
  return (
    <Tooltip content={label} touch="hold">
      <button
        type="button"
        className={classnames('btn btn-outline-secondary btn-svg', styles.delete)}
        aria-label={label}
        onClick={handleClick}
      >
        <X className={styles.x} />
      </button>
    </Tooltip>
  );
};

export default DeleteButton;
