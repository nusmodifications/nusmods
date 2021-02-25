import type { MpePreference } from 'types/mpe';
import type { ModuleCode } from 'types/modules';
import DeleteButton from './DeleteButton';
import ModuleTypeMenu from './ModuleTypeMenu';
import styles from './ModuleCard.scss';

type Props = {
  rank: number;
  preference: MpePreference;
  removeModule: (moduleCodeToRemove: string) => void;
  updateModuleType: (moduleCode: ModuleCode, moduleType: MpePreference['moduleType']) => void;
};

const ModuleCard: React.FC<Props> = ({ rank, preference, removeModule, updateModuleType }) => (
  <div className={styles.card}>
    <div className={styles.side}>{rank + 1}</div>
    <div className={styles.container}>
      <div className={styles.moduleContainer}>
        <div className={styles.moduleInfoContainer}>
          <div className={styles.moduleCode}>{preference.moduleCode}</div>
          <div className={styles.moduletitle}>{preference.moduleTitle}</div>
        </div>
        <div className={styles.mc}>{preference.moduleCredits} MC</div>
      </div>
      <div className={styles.moduleType}>
        <ModuleTypeMenu
          moduleCode={preference.moduleCode}
          moduleType={preference.moduleType}
          updateModuleType={updateModuleType}
        />
      </div>
    </div>
    <DeleteButton
      label={`Remove ${preference.moduleCode}`}
      removeModule={removeModule}
      moduleCode={preference.moduleCode}
    />
  </div>
);

export default ModuleCard;
