import { Preference } from 'types/mpe';
import classnames from 'classnames';
import Tooltip from 'views/components/Tooltip';
import { Trash } from 'react-feather';
import ModuleMenu from './ModuleMenu';
import styles from './ModuleCard.scss';

type Props = {
  Preference: Preference;
  removeModule: (moduleCodeToRemove: string) => Promise<void>;
};

const ModuleCard: React.FC<Props> = (props) => {
  const removeBtnLabel = `Remove ${props.Preference.moduleCode} from the list of preferences`;
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.side}>
          <img className={styles.image} src="https://i.ibb.co/48FtBq1/doticon.png" alt="dots" />
        </div>
        <div className={styles.modulecode}>{props.Preference.moduleCode}</div>
        <div className={styles.moduletitle}>{props.Preference.moduleTitle}</div>
        <div className={styles.mc}>{props.Preference.moduleCredits} MC</div>
        <div className={styles.moduletype}>
          <ModuleMenu removeModule={() => null} editCustomData={() => null} />
        </div>
      </div>
      <Tooltip content={removeBtnLabel} touch="hold">
        <button
          type="button"
          className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
          aria-label={removeBtnLabel}
          onClick={() => props.removeModule(props.Preference.moduleCode)}
        >
          <Trash className={styles.trash} />
        </button>
      </Tooltip>
    </div>
  );
};

export default ModuleCard;
