// @flow

export const MODULE_REGEX = /[A-Z]{2,3}[0-9]{4}[A-Z]{0,3}/;

export const OPERATORS = {
  and: ' and ',
  or: ' or ',
};

export const AND_OR_REGEX = new RegExp(Object.keys(OPERATORS).join('|'));
export const OPERATORS_REGEX = new RegExp(AND_OR_REGEX, 'gi');
