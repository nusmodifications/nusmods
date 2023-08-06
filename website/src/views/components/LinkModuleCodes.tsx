import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { ModuleCode, ModuleCondensed } from 'types/modules';
import { State } from 'types/state';

import { modulePage } from 'views/routes/paths';
import Tooltip from 'views/components/Tooltip';
import SemesterBadge from 'views/components/SemesterBadge';
import { getModuleCondensed } from 'selectors/moduleBank';
import { replaceAllWithNode, replaceWithNode } from 'utils/react';
import { MODULE_CODE_REGEX } from 'utils/modules';
import styles from './LinkModuleCodes.scss';

type Props = {
  children: string;
  getModuleCondensed: (moduleCode: ModuleCode) => ModuleCondensed | undefined;
  treatAsSingleMatch?: boolean;
  className?: string;
};

export const LinkModuleCodesComponent: React.FC<Props> = (props) => {
  const { children, className, treatAsSingleMatch = false } = props;
  const replaceMatch = (match: string, index: number): string | React.JSX.Element => {
    const code = match.replace(/\s*/g, '');
    const module = props.getModuleCondensed(code);
    if (!module) return treatAsSingleMatch ? children : match;

    const tooltip = (
      <>
        {module.title} <SemesterBadge className={styles.semesters} semesters={module.semesters} />{' '}
      </>
    );

    return (
      <Tooltip content={tooltip} distance={0} key={index} touch="hold">
        <Link className={className} to={modulePage(code, module.title)}>
          {treatAsSingleMatch ? children : match}
        </Link>
      </Tooltip>
    );
  };
  return treatAsSingleMatch
    ? replaceAllWithNode(children, MODULE_CODE_REGEX, replaceMatch)
    : replaceWithNode(children, MODULE_CODE_REGEX, replaceMatch);
};

const mapStateToProps = connect((state: State) => ({
  getModuleCondensed: getModuleCondensed(state),
}));

export default mapStateToProps(LinkModuleCodesComponent);
