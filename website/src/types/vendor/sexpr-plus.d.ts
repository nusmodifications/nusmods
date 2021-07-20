declare module 'sexpr-plus' {
  // Parses string into expressions
  export function parse(input: string): Expr;
  // Location of start or end of an expression
  export type ExprLocation = {
    offset: number;
    line: number;
    column: number;
  };
  // Location information for expressions
  export type ExprLocations = {
    start: ExprLocation;
    end: ExprLocation;
  };
  // Base output type from parsing
  export type ExprNode = {
    type: string;
    content: Expr;
    location: ExprLocations;
  };
  export type Expr = string | ExprNode[];
  // try-catch with instanceof during parsing
  export interface SyntaxError {
    message: string;
    expected: string;
    found: string;
    location: ExprLocations;
    name: string;
  }
}
