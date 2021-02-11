import type { MpePreference, ModuleType } from 'types/mpe';
import type { ModuleCode } from 'types/modules';
// import ModuleMenu from './ModuleMenu';
import DeleteButton from './DeleteButton';
import ModuletypeMenu from './ModuletypeMenu';
import styles from './ModuleCard.scss';

type Props = {
  rank: number;
  preference: MpePreference;
  removeModule: (moduleCodeToRemove: string) => Promise<void>;
  updateModuleType: (moduleCode: ModuleCode, moduleType: ModuleType) => Promise<void>;
};

const ModuleCard: React.FC<Props> = (props) => {
  const removeBtnLabel = `Remove ${props.preference.moduleCode} from the list of preferences`;
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.side}>{props.rank + 1}</div>
        <div className={styles.modulecode}>{props.preference.moduleCode}</div>
        <div className={styles.moduletitle}>{props.preference.moduleTitle}</div>
        <div className={styles.mc}>
          <DeleteButton
            label={removeBtnLabel}
            removeModule={props.removeModule}
            moduleCode={props.preference.moduleCode}
          />
          <p className={styles.text}>{props.preference.moduleCredits} MC </p>
        </div>
        <div className={styles.moduletype}>
          {/* <ModuleMenu
            moduleCode={props.preference.moduleCode}
            updateModuleType={props.updateModuleType}
          /> */}
          <ModuletypeMenu
            moduleCode={props.preference.moduleCode}
            updateModuleType={props.updateModuleType}
            type={props.preference.moduleType.type}
          />
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;
