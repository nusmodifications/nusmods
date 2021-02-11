import { MpePreference } from 'types/mpe';
import classnames from 'classnames';
import Tooltip from 'views/components/Tooltip';
import { Trash } from 'react-feather';
import ModuleMenu from './ModuleMenu';
import styles from './ModuleCard.scss';

type Props = {
  preference: MpePreference;
  removeModule: (moduleCodeToRemove: string) => Promise<void>;
};

const ModuleCard: React.FC<Props> = (props) => {
  const removeBtnLabel = `Remove ${props.preference.moduleCode} from the list of preferences`;
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.side}>
          <img
            className={styles.image}
            src="https://i.ibb.co/48FtBq1/doticon.png"
            alt="dots"
          />
        </div>
        <div className={styles.modulecode}>{props.preference.moduleCode}</div>
        <div className={styles.moduletitle}>{props.preference.moduleTitle}</div>
        <div className={styles.mc}>{props.preference.moduleCredits} MC</div>
        <div className={styles.moduletype}>
          <ModuleMenu removeModule={() => null} editCustomData={() => null} />
        </div>
      </div>
      <Tooltip content={removeBtnLabel} touch="hold">
        <button
          type="button"
          className={classnames(
            'btn btn-outline-secondary btn-svg',
            styles.moduleAction
          )}
          aria-label={removeBtnLabel}
          onClick={() => props.removeModule(props.preference.moduleCode)}
        >
          <Trash className={styles.trash} />
        </button>
      </Tooltip>
    </div>
  );
};

export default ModuleCard;
