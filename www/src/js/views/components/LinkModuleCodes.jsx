// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import type { State } from 'reducers';
import type { ModuleCode, ModuleCondensed } from 'types/modules';

import { modulePage } from 'views/routes/paths';
import Tooltip from 'views/components/Tooltip';
import SemesterBadge from 'views/components/SemesterBadge';
import { getModuleCondensed } from 'selectors/moduleBank';
import { replaceWithNode } from 'utils/react';
import styles from './LinkModuleCodes.scss';

type Props = {
  children: string,
  getModuleCondensed: (ModuleCode) => ?ModuleCondensed,
  className?: string,
};

// Look for strings that look like module codes - eg.
// ACC1010  - 3 chars, 4 digits, no suffix
// CS1010FC - 2 chars, 4 digits, 2 chars
// CS2014R  - 2 chars, 4 digits, 1 char
// BMA 5001 - 3 chars, space, 4 digits
const MODULE_CODE_REGEX = /\b(\w{2,3}\s*\d{4}\w{0,2})\b/g;

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
      <Tooltip content={tooltip} distance={5} key={i}>
        <Link className={className} to={modulePage(code, module.ModuleTitle)}>
          {part}
        </Link>
      </Tooltip>
    );
  });
}

// Type annotation is workaround for https://github.com/flowtype/flow-typed/issues/1269
// Exclude dispatch from props
export default connect(
  (state: State) => ({
    getModuleCondensed: getModuleCondensed(state.moduleBank),
  }),
  null,
)(LinkModuleCodesComponent);
