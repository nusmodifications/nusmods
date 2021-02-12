import type { ModuleType } from 'types/mpe';
import type { ModuleCode } from 'types/modules';
import classnames from 'classnames';
import styles from './ModuletypeMenu.scss';

type Props = {
  readonly moduleCode: ModuleCode;
  readonly updateModuleType: (moduleCode: ModuleCode, moduleType: ModuleType) => Promise<void>;
  readonly type: string;
};

const ModuletypeMenu: React.FC<Props> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleChange(e: any) {
    const modType = { type: e.target.value };
    props.updateModuleType(props.moduleCode, modType);
  }
  return (
    <div>
      <select
        value={props.type}
        className={classnames('btn close', styles.menu)}
        onChange={handleChange}
      >
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
