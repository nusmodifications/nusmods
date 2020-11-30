import * as R from 'ramda';
import { createToken, Lexer, Parser, IToken, TokenType } from 'chevrotain';

import { PrereqTree } from '../../types/modules';
import { Logger } from '../logger';
import { AND_OR_REGEX, MODULE_REGEX, OPERATORS } from './constants';

/**
 * Parses the string to build a tree of requirements for the module.
 * First it goes through a lexer to generate tokens, then a parser to build
 * the tree.
 *
 * Library used for lexing/parsing is Chevrotain:
 * https://github.com/SAP/chevrotain
 */
const Module = createToken({
  name: 'Module',
  pattern: MODULE_REGEX,
});

const And = createToken({
  name: 'And',
  pattern: 'and',
});

const Or = createToken({
  name: 'Or',
  pattern: 'or',
});

const LeftBracket = createToken({
  name: 'LeftBracket',
  pattern: /\(/,
});

const RightBracket = createToken({
  name: 'RightBracket',
  pattern: /\)/,
});

const WhiteSpace = createToken({
  name: 'Whitespace',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
  // eslint-disable-next-line camelcase
  line_breaks: true,
});

const IrrelevantWord = createToken({
  name: 'IrrelevantWord',
  pattern: /[^\s()]+/,
  group: Lexer.SKIPPED,
});

const allTokens = [WhiteSpace, Module, And, Or, LeftBracket, RightBracket, IrrelevantWord];
const ReqTreeLexer = new Lexer(allTokens);

function generateAndBranch(modules: PrereqTree[]) {
  const children = R.uniq(modules);
  return { and: children };
}

function generateOrBranch(modules: PrereqTree[]) {
  const children = R.uniq(modules);
  return { or: children };
}

/**
 * ReqTreeParser, works to parse string and tokenize the product.
 * The code is extremely similar to the following example:
 * @see https://github.com/SAP/chevrotain/blob/master/examples/grammars/calculator/calculator_embedded_actions.js
 */
class ReqTreeParser extends Parser {
  parse: () => PrereqTree;
  orExpression: () => PrereqTree;
  andExpression: () => PrereqTree;
  parenthesisExpression: () => PrereqTree;
  atomicExpression: () => string;

  constructor() {
    super(allTokens, { recoveryEnabled: true, outputCst: false });

    this.parse = this.RULE('parse', () => this.SUBRULE(this.andExpression));

    // And has the lowest precedence thus it is first in the rule chain (think +- in math)
    // The precedence of binary expressions is determined by
    // how far down the Parse Tree the binary expression appears.
    this.andExpression = this.RULE('andExpression', () => {
      const value = [];

      value.push(this.SUBRULE(this.orExpression));
      this.MANY(() => {
        this.CONSUME(And);
        // the index "2" in SUBRULE2 is needed to
        // identify the unique position in the grammar during runtime
        value.push(this.SUBRULE2(this.orExpression));
      });

      return value.length === 1 ? value[0] : generateAndBranch(value);
    });

    // Or has the higher precedence (think */ in math)
    this.orExpression = this.RULE('orExpression', () => {
      const value = [];

      value.push(this.SUBRULE(this.atomicExpression));

      this.MANY(() => {
        this.CONSUME(Or);
        value.push(this.SUBRULE2(this.atomicExpression));
      });

      return value.length === 1 ? value[0] : generateOrBranch(value);
    });

    this.atomicExpression = this.RULE('atomicExpression', () =>
      this.OR({
        DEF: [
          { ALT: () => this.SUBRULE(this.parenthesisExpression) },
          { ALT: () => this.CONSUME(Module).image },
        ],
        ERR_MSG: 'a module or parenthesis expression',
      }),
    );

    // parenthesisExpression has the highest precedence and thus it appears
    // in the "lowest" leaf in the expression ParseTree.
    this.parenthesisExpression = this.RULE('parenthesisExpression', () => {
      this.CONSUME(LeftBracket);
      const expValue = this.SUBRULE(this.parse);
      this.CONSUME(RightBracket);
      return expValue;
    });

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    this.performSelfAnalysis();
  }

  // avoids inserting module literals as these can have multiple(and infinite) semantic values
  // eslint-disable-next-line class-methods-use-this
  canTokenTypeBeInsertedInRecovery(tokClass: TokenType) {
    return tokClass !== Module;
  }
}

// removes unneeded `or` and `and` operators, recursively while noting brackets
export function cleanOperators(tokens: IToken[]) {
  const output: IToken[] = [];
  let temp: IToken[] = [];
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
          // Length check means this is fine
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          output.push(R.head(temp)!, ...cleaned, R.last(temp)!);
        }
        temp = [];
      }
    }
  });

  const findFirstRelevant = R.findIndex(
    (token: IToken) => MODULE_REGEX.test(token.image) || token.image === '(',
  );
  const findLastRelevant = R.findLastIndex(
    (token: IToken) => MODULE_REGEX.test(token.image) || token.image === ')',
  );

  const processedTokens = output.slice(findFirstRelevant(output), findLastRelevant(output) + 1);

  const removedDuplicates = processedTokens.filter((item, pos, arr) => {
    // always keep the first and last element
    if (pos === 0 || pos === arr.length - 1) return true;

    // then check if each element is different than the one before it
    return !(AND_OR_REGEX.test(item.image) && AND_OR_REGEX.test(arr[pos + 1].image));
  });

  const moduleTokens = [];
  // Falsy value if array does not contain unique conjunction
  // Need token to inject later on when it is missing between two modules
  const singularConjunction = removedDuplicates.reduce(
    (acc: IToken | null | false, token: IToken) => {
      const { image } = token;
      if (image === 'and' || image === 'or') {
        if (!acc) return token;
        if (acc.image !== image) return false;
      }
      return acc;
    },
    null,
  );

  // Fill in missing values with conjunction found
  for (let i = 0; i < removedDuplicates.length; i++) {
    const token = removedDuplicates[i];
    const nextToken = removedDuplicates[i + 1];
    const isModule = MODULE_REGEX.test(token.image);
    const isAnotherModule = nextToken && MODULE_REGEX.test(nextToken.image);

    moduleTokens.push(token);
    if (singularConjunction && isModule && isAnotherModule) {
      moduleTokens.push(singularConjunction);
    }
  }

  return moduleTokens;
}

/**
 * Parses the prerequisite string to produce the tokenized form.
 * @see __tests__/genReqTree.test.js
 */
export default function parseString(prerequisite: string, logger: Logger): PrereqTree | null {
  const findModules = R.match(new RegExp(MODULE_REGEX, 'g'));
  const moduleMatches = findModules(prerequisite);

  if (moduleMatches.length === 0) {
    return null;
  }

  if (moduleMatches.length === 1) {
    // e.g. 'CS1010' or 'CS1010 Introduction to Computer Science'
    return moduleMatches[0];
  }

  if (!prerequisite.includes(OPERATORS.or) && !prerequisite.includes(OPERATORS.and)) {
    // e.g. 'CS1010 CS1231 Some module title'
    return generateOrBranch(moduleMatches);
  }

  if (!prerequisite.includes(OPERATORS.or)) {
    // e.g. 'CS1010 and CS1231'
    return generateAndBranch(moduleMatches);
  }

  if (!prerequisite.includes(OPERATORS.and)) {
    // e.g. 'CS1010 or CS1231'
    return generateOrBranch(moduleMatches);
  }

  // check that all brackets are fully enclosed
  if (R.match(/\(/g, prerequisite).length !== R.match(/\)/g, prerequisite).length) {
    logger.info({ prerequisite }, 'Brackets do not self enclose');
  }

  const lexingResult = ReqTreeLexer.tokenize(prerequisite);
  const tokens = cleanOperators(lexingResult.tokens);

  const parser = new ReqTreeParser();
  parser.input = tokens;
  const result = parser.parse();

  if (parser.errors.length > 0) {
    logger.info({ prerequisite, errors: parser.errors }, 'Encountered parsing errors');
  }

  return result;
}
