import { Token, Lexer, Parser } from 'chevrotain';
import R from 'ramda';
import { OPERATORS, MODULE_REGEX, AND_OR_REGEX } from './constants';

/**
 * Parses the string to build a tree of requirements for the module.
 * First it goes through a lexer to generate tokens,
 * then a parser to build the tree.
 *
 * Library used for lexing/parsing is chevrotain:
 * https://github.com/SAP/chevrotain
 */
class Module extends Token {}
Module.PATTERN = MODULE_REGEX;
class And extends Token {}
And.PATTERN = 'and';
class Or extends Token {}
Or.PATTERN = 'or';

class LeftBracket extends Token {}
LeftBracket.PATTERN = /\(/;
class RightBracket extends Token {}
RightBracket.PATTERN = /\)/;

class WhiteSpace extends Token {}
WhiteSpace.PATTERN = /\s+/;
WhiteSpace.GROUP = Lexer.SKIPPED;
WhiteSpace.LINE_BREAKS = true;

class IrrelevantWord extends Token {}
IrrelevantWord.PATTERN = /[^\s()]+/;
IrrelevantWord.GROUP = Lexer.SKIPPED;

const allTokens = [WhiteSpace, Module, And, Or, LeftBracket, RightBracket, IrrelevantWord];
const ReqTreeLexer = new Lexer(allTokens);

function generateAndBranch(modules) {
  const children = R.uniq(modules);
  return { and: children };
}
function generateOrBranch(modules) {
  const children = R.uniq(modules);
  return { or: children };
}

/**
 * ReqTreeParser, works to parse string and tokenize the product.
 * The code is extremely similar to the following example:
 * @see https://github.com/SAP/chevrotain/blob/master/examples/grammars/calculator/calculator_embedded_actions.js
 */
class ReqTreeParser extends Parser {
  constructor(input) {
    super(input, allTokens, { recoveryEnabled: true });
    this.RULE('parse', () => this.SUBRULE(this.andExpression));

    // And has the lowest precedence thus it is first in the rule chain (think +- in math)
    // The precedence of binary expressions is determined by
    // how far down the Parse Tree the binary expression appears.
    this.RULE('andExpression', () => {
      const value = [];

      value.push(this.SUBRULE(this.orExpression));
      this.MANY(() => {
        this.CONSUME(And);
        // the index "2" in SUBRULE2 is needed to
        // identify the unique position in the grammar during runtime
        value.push(this.SUBRULE2(this.orExpression));
      });
      if (value.length === 1) {
        return value[0];
      }
      return generateAndBranch(value);
    });

    // Or has the higher precedence (think */ in math)
    this.RULE('orExpression', () => {
      const value = [];

      value.push(this.SUBRULE(this.atomicExpression));
      this.MANY(() => {
        this.CONSUME(Or);
        value.push(this.SUBRULE2(this.atomicExpression));
      });
      if (value.length === 1) {
        return value[0];
      }
      return generateOrBranch(value);
    });

    this.RULE('atomicExpression', () =>
      this.OR(
        [
          { ALT: () => this.SUBRULE(this.parenthesisExpression) },
          { ALT: () => this.CONSUME(Module).image },
        ],
        'a module or parenthesis expression',
      ),
    );

    // parenthesisExpression has the highest precedence and thus it appears
    // in the "lowest" leaf in the expression ParseTree.
    this.RULE('parenthesisExpression', () => {
      this.CONSUME(LeftBracket);
      const expValue = this.SUBRULE(this.parse);
      this.CONSUME(RightBracket);
      return expValue;
    });

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    Parser.performSelfAnalysis(this);
  }

  // avoids inserting module literals as these can have multiple(and infinite) semantic values
  // eslint-disable-next-line class-methods-use-this
  canTokenTypeBeInsertedInRecovery(tokClass) {
    return tokClass !== Module;
  }
}

// removes unneeded `or` and `and` operators, recursively while noting brackets
function cleanOperators(tokens) {
  const output = [];
  let temp = [];
  let bracketsCount = 0;
  tokens.forEach((token) => {
    const { image } = token;
    if (bracketsCount === 0 && image !== '(' && image !== ')') {
      output.push(token);
      return;
    }

    temp.push(token);
    if (image === '(') {
      bracketsCount += 1;
    } else if (image === ')') {
      bracketsCount -= 1;
      if (bracketsCount === 0) {
        // recursive clean within parenthesis, unnests one layer
        const cleaned = cleanOperators(temp.slice(1, -1));
        if (cleaned.length) {
          output.push(R.head(temp));
          output.push(...cleaned);
          output.push(R.last(temp));
        }
        temp = [];
      }
    }
  });

  const findFirstRelevant = R.findIndex((token) => {
    const { image } = token;
    return MODULE_REGEX.test(image) || image === '(';
  });
  const findLastRelevant = R.findLastIndex((token) => {
    const { image } = token;
    return MODULE_REGEX.test(image) || image === ')';
  });
  const processedTokens = output.slice(findFirstRelevant(output), findLastRelevant(output) + 1);

  const removedDuplicates = processedTokens.filter((item, pos, arr) => {
    // always keep the first and last element
    if (pos === 0 || pos === arr.length - 1) {
      return true;
    }
    const currentImage = item.image;
    const nextImage = arr[pos + 1].image;
    // then check if each element is different than the one before it
    return !(AND_OR_REGEX.test(currentImage) && AND_OR_REGEX.test(nextImage));
  });

  const moduleTokens = [];
  // Falsy value if array does not contain unique conjunction
  // Need token to inject later on when it is missing between two modules
  const singularConjunction = removedDuplicates.reduce((acc, token) => {
    const { image } = token;
    if (image === 'and' || image === 'or') {
      if (acc === null) return token;
      if (image !== acc.image) return false;
    }
    return acc;
  }, null);
  // Fill in missing values with conjunction found
  for (let i = 0; i < removedDuplicates.length; i++) {
    const token = removedDuplicates[i];
    const nextToken = removedDuplicates[i + 1];
    const isModule = MODULE_REGEX.test(token.image);
    const isAnotherModule = nextToken && MODULE_REGEX.test(nextToken.image);
    if (singularConjunction && isModule && isAnotherModule) {
      moduleTokens.push(token);
      moduleTokens.push(singularConjunction);
    } else {
      moduleTokens.push(token);
    }
  }

  return moduleTokens;
}

/**
 * Parses the prerequisite string to produce the tokenized form.
 * @see __tests__/genReqTree.test.js
 * @param {String} pre The prerequisite string
 * @param {bunyan} log The bunyan logger
 */
function parseString(pre, log) {
  const findModules = R.match(new RegExp(MODULE_REGEX, 'g'));
  const moduleMatches = findModules(pre);
  if (moduleMatches.length === 0) {
    return null;
  } else if (moduleMatches.length === 1) {
    // e.g. 'CS1010' or 'CS1010 Introduction to Computer Science'
    return moduleMatches[0];
  } else if (!pre.includes(OPERATORS.or) && !pre.includes(OPERATORS.and)) {
    // e.g. 'CS1010 CS1231 Some module title'
    return generateOrBranch(moduleMatches);
  } else if (!pre.includes(OPERATORS.or)) {
    // e.g. 'CS1010 and CS1231'
    return generateAndBranch(moduleMatches);
  } else if (!pre.includes(OPERATORS.and)) {
    // e.g. 'CS1010 or CS1231'
    return generateOrBranch(moduleMatches);
  }

  // check that all brackets are fully enclosed
  if (R.match(/\(/g, pre).length !== R.match(/\)/g, pre).length) {
    log.error(`pre ${pre}'s brackets do not self enclose.`);
  }

  const lexingResult = ReqTreeLexer.tokenize(pre);
  const tokens = cleanOperators(lexingResult.tokens);
  // log.debug(tokens);

  const parser = new ReqTreeParser(tokens);
  const result = parser.parse();
  if (parser.errors.length > 0) {
    log.error(`'${pre}' encoutered parsing errors:\n${parser.errors}`);
    // log.info(tokens)
  }
  return result;
}

export default parseString;
export { cleanOperators };
