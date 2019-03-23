import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { ModuleCode, ModuleCondensed } from 'types/modulesBase';
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

// @ts-ignore TODO: Figure out why TypeScript does not accept (props) => React.ReactNode as functional component
export const LinkModuleCodesComponent: React.FunctionComponent<Props> = (
  props: Props,
): React.ReactNode => {
  const { children, className } = props;

  return replaceWithNode(children, MODULE_CODE_REGEX, (part, i) => {
    const code = part.replace(/\s*/g, '');
    const module = props.getModuleCondensed(code);
    if (!module) return part;

    const tooltip = (
      <>
        {module.title} <SemesterBadge className={styles.semesters} semesters={module.semesters} />{' '}
      </>
    );

    return (
      <Tooltip content={tooltip} distance={5} key={i} touchHold>
        <Link className={className} to={modulePage(code, module.title)}>
          {part}
        </Link>
      </Tooltip>
    );
  });
};

const mapStateToProps = connect((state: State) => ({
  getModuleCondensed: getModuleCondensed(state.moduleBank),
}));

export default mapStateToProps(LinkModuleCodesComponent);
