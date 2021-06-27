import { MpePreference, MODULE_TYPES } from 'types/mpe';
import type { ModuleCode } from 'types/modules';
import classnames from 'classnames';
import styles from './ModuleTypeMenu.scss';

type Props = {
  readonly moduleCode: ModuleCode;
  readonly updateModuleType: (
    moduleCode: ModuleCode,
    moduleType: MpePreference['moduleType'],
  ) => void;
  readonly moduleType: MpePreference['moduleType'];
};

const ModuleTypeMenu: React.FC<Props> = ({ moduleCode, updateModuleType, moduleType }) => (
  <select
    value={moduleType}
    className={classnames('form-control', styles.menu)}
    onChange={(e) => {
      const modType = e.target.value as MpePreference['moduleType'];
      updateModuleType(moduleCode, modType);
    }}
  >
    {Object.entries(MODULE_TYPES).map(([moduleTypeCode, { label }]) => (
      <option key={moduleCode + moduleTypeCode} className="dropdown-item" value={moduleTypeCode}>
        {label}
      </option>
    ))}
  </select>
);

export default ModuleTypeMenu;
