// @flow

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import type { ModuleCode } from 'types/modules';

import { modulePagePath } from 'utils/modules';
import { replaceWithNode } from 'utils/react';

type Props = {
  children: string,
  moduleCodes: Set<ModuleCode>,
};

// Look for strings that look like module codes - eg.
// ACC1010  - 3 chars, 4 digits, no suffix
// CS1010FC - 2 chars, 4 digits, 2 chars
// CS2014R  - 2 chars, 4 digits, 1 char
// BMA 5001 - 3 chars, space, 4 digits
const MODULE_CODE_REGEX = /\b(\w{2,3}\s*\d{4}\w{0,2})\b/g;

export function LinkModuleCodesComponent(props: Props) {
  const { children, moduleCodes } = props;

  return (<span>{replaceWithNode(children, MODULE_CODE_REGEX, (part, i) => {
    const code = part.replace(/\s*/g, '');
    if (!moduleCodes.has(code)) return part;
    return <Link to={modulePagePath(code)} key={i}>{part}</Link>;
  })}</span>);
}

export default connect(state => ({
  moduleCodes: state.entities.moduleBank.moduleCodes,
}))(LinkModuleCodesComponent);
