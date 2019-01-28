// flow-typed signature: f94a5d1c1d59b2018ad4891f43dd7da2
// flow-typed version: <<STUB>>/chevrotain_v4.2.0/flow_v0.91.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   'chevrotain'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare module 'chevrotain' {
  declare type TokenType = {
    name: string,
    GROUP?: string,
    PATTERN?: RegExp | string,
    LABEL?: string,
    LONGER_ALT?: TokenType,
    POP_MODE?: boolean,
    PUSH_MODE?: string,
    LINE_BREAKS?: boolean,
    CATEGORIES?: TokenType[],
    tokenName?: string,
    tokenTypeIdx?: number,
    categoryMatches?: number[],
    categoryMatchesMap?: {
      [tokType: number]: boolean
    },
    isParent?: boolean,
  }

  declare type Token = {
    /** The textual representation of the Token as it appeared in the text. */
    image: string,
    /** Offset of the first character of the Token. */
    startOffset: number,
    /** Line of the first character of the Token. */
    startLine?: number,
    /** Column of the first character of the Token. */
    startColumn?: number,
    /** Offset of the last character of the Token. */
    endOffset?: number,
    /** Line of the last character of the Token. */
    endLine?: number,
    /** Column of the last character of the Token. */
    endColumn?: number,
    /** this marks if a Token does not really exist and has been inserted "artificially" during parsing in rule error recovery. */
    isInsertedInRecovery?: boolean,
    /** An number index representing the type of the Token use <getTokenConstructor> to get the Token Type from a token "instance"  */
    tokenTypeIdx?: number,
    /**
     * The actual Token Type of this Token "instance"
     * This is the same Object returned by the "createToken" API.
     * This property is very useful for debugging the Lexing and Parsing phases.
     */
    tokenType?: TokenType,
  }

  declare module.exports: any;
}
