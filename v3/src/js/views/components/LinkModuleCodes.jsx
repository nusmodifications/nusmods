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
  // ACC1010  - 3 chars, 4 digit, no suffix
  // CS1010FC - 2 chars, 4 digit, 2 char
  // CS2014R  - 2 chars, 4 digit, 1 char

  // Add a space in front to force regex matches to be even
  // Otherwise if the first character is part of a match, the matches will be
  // odd elements
  const parts = (' ' + children).split(/\b(\w{2,3}\d{4}\w{0,2})\b/g); // eslint-disable-line prefer-template
  parts[0] = parts[0].slice(1);
  return (
    <span>{parts.map((part, i) => {
      if (i % 2 === 0) return part;
      if (!moduleCodes.has(part)) return part;
      return <Link to={modulePagePath(part)} key={part}>{part}</Link>;
    })}</span>
  );
}

export default connect(state => ({
  moduleCodes: state.entities.moduleBank.moduleCodes,
}))(LinkModuleCodesComponent);
