// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import type { State } from 'reducers';
import type { ModuleCodeMap } from 'types/reducers';

import { modulePage } from 'views/routes/paths';
import { replaceWithNode } from 'utils/react';
import { MODULE_CODE_REGEX } from 'utils/modules';

type Props = {
  children: string,
  moduleCodes: ModuleCodeMap,
  className?: string,
};

export function LinkModuleCodesComponent(props: Props) {
  const { children, moduleCodes, className } = props;

  return replaceWithNode(children, MODULE_CODE_REGEX, (part, i) => {
    const code = part.replace(/\s*/g, '');
    const module = moduleCodes[code];
    if (!module) return part;
    return (
      <Link
        className={className}
        title={module.ModuleTitle}
        to={modulePage(code, module.ModuleTitle)}
        key={i}
      >
        {part}
      </Link>
    );
  });
}

// Type annotation is workaround for https://github.com/flowtype/flow-typed/issues/1269
// Exclude dispatch from props
export default connect(
  (state: State) => ({
    moduleCodes: state.moduleBank.moduleCodes,
  }),
  null,
)(LinkModuleCodesComponent);
