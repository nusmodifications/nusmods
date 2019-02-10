import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { State } from 'reducers';
import { ModuleCode, ModuleCondensed } from 'types/modules';

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

export function LinkModuleCodesComponent(props: Props) {
  const { children, className } = props;

  return replaceWithNode(children, MODULE_CODE_REGEX, (part, i) => {
    const code = part.replace(/\s*/g, '');
    const module = props.getModuleCondensed(code);
    if (!module) return part;

    const tooltip = (
      <>
        {module.ModuleTitle}{' '}
        <SemesterBadge className={styles.semesters} semesters={module.Semesters} />{' '}
      </>
    );

    return (
      <Tooltip content={tooltip} distance={5} key={i} touchHold>
        <Link className={className} to={modulePage(code, module.ModuleTitle)}>
          {part}
        </Link>
      </Tooltip>
    );
  });
}

const mapStateToProps = connect((state: State) => ({
  getModuleCondensed: getModuleCondensed(state.moduleBank),
}));

export default mapStateToProps(LinkModuleCodesComponent);
