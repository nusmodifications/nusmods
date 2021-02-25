import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { ModuleCode, ModuleCondensed } from 'types/modules';
import { State } from 'types/state';

import { modulePage } from 'views/routes/paths';
import Tooltip from 'views/components/Tooltip';
import SemesterBadge from 'views/components/SemesterBadge';
import { getModuleCondensed } from 'selectors/moduleBank';
import { replaceWithNode } from 'utils/react';
import { MODULE_CODE_REGEX } from 'utils/modules';
import styles from './LinkModuleCodes.scss';

type Props = {
  children: string;
  getModuleCondensed: (moduleCode: ModuleCode) => ModuleCondensed | undefined;
  className?: string;
};

export const LinkModuleCodesComponent: React.FC<Props> = (props) => {
  const { children, className } = props;

  return replaceWithNode(children, MODULE_CODE_REGEX, (part, i) => {
    const code = part.replace(/\s*/g, '');
    const module = props.getModuleCondensed(code);
    if (!module) return part;

    const tooltip = (
      <>
        {module.title}
        <SemesterBadge className={styles.semesters} semesters={module.semesters} />
      </>
    );

    return (
      <Tooltip content={tooltip} distance={0} key={i} touch="hold">
        <Link className={className} to={modulePage(code, module.title)}>
          {part}
        </Link>
      </Tooltip>
    );
  });
};

const mapStateToProps = connect((state: State) => ({
  getModuleCondensed: getModuleCondensed(state),
}));

export default mapStateToProps(LinkModuleCodesComponent);
