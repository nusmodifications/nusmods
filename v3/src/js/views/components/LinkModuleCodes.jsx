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

export function LinkModuleCodesComponent(props: Props) {
  const { children, moduleCodes } = props;

  // Look for strings that look like module codes - eg.
  // ACC1010  - 3 chars, 4 digits, no suffix
  // CS1010FC - 2 chars, 4 digits, 2 chars
  // CS2014R  - 2 chars, 4 digits, 1 char
  // BMA 5001 - 3 chars, space, 4 digits

  // Add a space in front to force regex matches to be even
  // Otherwise if the first character is part of a match, the matches will be
  // odd elements
  const parts = (' ' + children).split(/\b(\w{2,3}\s*\d{4}\w{0,2})\b/g); // eslint-disable-line prefer-template
  parts[0] = parts[0].slice(1);
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
