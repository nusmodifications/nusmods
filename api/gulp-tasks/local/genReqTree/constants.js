const MODULE_REGEX = /[A-Z]{2,3}[0-9]{4}(?:[A-Z]|[A-Z]R)?/;

const OPERATORS = {
  and: ' and ',
  or: ' or ',
};
const AND_OR_REGEX = new RegExp(Object.keys(OPERATORS).join('|'));
const OPERATORS_REGEX = new RegExp(AND_OR_REGEX, 'gi');

export {
  MODULE_REGEX,
  OPERATORS,
  AND_OR_REGEX,
  OPERATORS_REGEX,
};
