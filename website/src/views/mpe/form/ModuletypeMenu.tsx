import { MpePreference, MODULE_TYPES } from 'types/mpe';
import type { ModuleCode } from 'types/modules';
import classnames from 'classnames';
import styles from './ModuletypeMenu.scss';

type Props = {
  readonly moduleCode: ModuleCode;
  readonly updateModuleType: (
    moduleCode: ModuleCode,
    moduleType: MpePreference['moduleType'],
  ) => Promise<void>;
  readonly type: MpePreference['moduleType'];
};

const ModuleTypeMenu: React.FC<Props> = (props) => (
  <div>
    <select
      value={props.type}
      className={classnames('btn close', styles.menu)}
      onChange={(e) => {
        const modType = e.target.value as MpePreference['moduleType'];
        props.updateModuleType(props.moduleCode, modType);
      }}
    >
      {Object.entries(MODULE_TYPES).map(([moduleTypeCode, { label }]) => (
        <option
          key={props.moduleCode + moduleTypeCode}
          className="dropdown-item"
          value={moduleTypeCode}
        >
          {label}
        </option>
      ))}
    </select>
  </div>
);

export default ModuleTypeMenu;
