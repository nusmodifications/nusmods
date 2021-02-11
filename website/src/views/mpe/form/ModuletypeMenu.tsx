import type { ModuleType } from 'types/mpe';
import type { ModuleCode } from 'types/modules';
import classnames from 'classnames';
import styles from './ModuletypeMenu.scss';

type Props = {
  readonly moduleCode: ModuleCode;
  readonly updateModuleType: (moduleCode: ModuleCode, moduleType: ModuleType) => Promise<void>;
};

const ModuletypeMenu: React.FC<Props> = (props) => {
  function handleChange(e: any) {
    const modType = { type: e.target.value };
    props.updateModuleType(props.moduleCode, modType);
  }
  return (
    <div className={styles.wrapper}>
      <select
        defaultValue="00"
        name="Module Type"
        className={classnames('btn close', styles.menu)}
        onClick={handleChange}
      >
        <option className="dropdown-item" value="00">
          Module Type
        </option>
        <option className="dropdown-item" value="01">
          Essential (Major)
        </option>
        <option className="dropdown-item" value="02">
          Essential (Second Major)
        </option>
        <option className="dropdown-item" value="03">
          Elective
        </option>
        <option className="dropdown-item" value="04">
          Unrestricted Elective
        </option>
      </select>
    </div>
  );
};

export default ModuletypeMenu;
