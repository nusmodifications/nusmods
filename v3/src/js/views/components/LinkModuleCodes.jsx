// @flow

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import type { ModuleCode } from 'types/modules';

import { modulePagePath } from 'utils/modules';

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

  const parts = children.split(MODULE_CODE_REGEX);

  // We want to ensure the resulting array always has ModuleCode at even position
  // eg. ['Some text ', 'CS1010S', ' more text ', 'CS3216', 'more text'].
  // This allows us to replace the even position elements with <Link> components.
  // However, if the string starts with a module code, then the first element will be a module
  // so we add in an empty string to pad module codes to even positions
  if (parts.length && MODULE_CODE_REGEX.test(parts[0])) parts.unshift('');

  return (
    <span>{parts.map((part, i) => {
      if (i % 2 === 0) return part;
      const code = part.replace(/\s*/g, '');
      if (!moduleCodes.has(code)) return part;
      return <Link to={modulePagePath(code)} key={code}>{part}</Link>;
    })}</span>
  );
}

export default connect(state => ({
  moduleCodes: state.entities.moduleBank.moduleCodes,
}))(LinkModuleCodesComponent);
