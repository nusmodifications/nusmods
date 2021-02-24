import type { MpePreference } from 'types/mpe';
import type { ModuleCode } from 'types/modules';
import DeleteButton from './DeleteButton';
import ModuleTypeMenu from './ModuleTypeMenu';
import styles from './ModuleCard.scss';

type Props = {
  rank: number;
  preference: MpePreference;
  removeModule: (moduleCodeToRemove: string) => void;
  updateModuleType: (
    moduleCode: ModuleCode,
    moduleType: MpePreference['moduleType'],
  ) => Promise<void>;
};

const ModuleCard: React.FC<Props> = ({ rank, preference, removeModule, updateModuleType }) => (
  <div className={styles.card}>
    <div className={styles.side}>{rank + 1}</div>
    <div className={styles.container}>
      <div className={styles.modulecontainer}>
        <div className={styles.moduleinfocontainer}>
          <div className={styles.modulecode}>{preference.moduleCode}</div>
          <div className={styles.moduletitle}>{preference.moduleTitle}</div>
        </div>
        <div className={styles.mc}>
          <p className={styles.mctext}>{preference.moduleCredits} MC </p>
        </div>
      </div>
      <div className={styles.moduletype}>
        <ModuleTypeMenu
          moduleCode={preference.moduleCode}
          moduleType={preference.moduleType}
          updateModuleType={updateModuleType}
        />
      </div>
    </div>
    <DeleteButton
      label={`Remove ${preference.moduleCode} from the list of preferences`}
      removeModule={removeModule}
      moduleCode={preference.moduleCode}
    />
  </div>
);

export default ModuleCard;
