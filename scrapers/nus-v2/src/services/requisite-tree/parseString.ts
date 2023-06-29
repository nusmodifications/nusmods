/* eslint-disable */
// Disabline eslint due to non-camelCase things generated by ANTLR.

import * as R from 'ramda';

import { NusModsLexer, NusModsVisitor } from './antlr4';
import { PrereqTree } from '../../types/modules';
import { Logger } from '../logger';
import { NusModsParser, BinopContext, CompoundContext, Course_itemsContext, CoursesContext, OpContext, OverallContext, PrereqContext, PrimitiveContext, ProgramsContext } from './antlr4/NusModsParser';
import { CharStreams, BufferedTokenStream, ParserRuleContext } from 'antlr4ts';
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'

function generateAndBranch(modules: PrereqTree[]) {
  const children: PrereqTree[] = R.uniq(modules);
  // Simplifying the expression
  if (children.length === 1) {
    return children[0];
  }

  // Simplify conjunction
  // Ignore because TS doesn't recognise Object.hasOwnProperty is a type guard.
  // @ts-ignore
  const result = children.flatMap(child => child.hasOwnProperty('and') ? child.and : child);
  if (result.length === 1) {
    return result[0];
  }
  return {and: result}
}

function generateOrBranch(modules: PrereqTree[]) {
  const children: PrereqTree[] = R.uniq(modules);
  // Simplifying the expression:
  if (children.length === 1) {
    return children[0];
  }
  // Simplify disjunction
  // Ignore because TS doesn't recognise Object.hasOwnProperty is a type guard.
  // @ts-ignore
  const result = children.flatMap(child => child.hasOwnProperty('or') ? child.or : child);
  if (result.length === 1) {
    return result[0];
  }
  return {or: result}
}

/**
 * ReqTreeVisitor, implements the visitor design pattern using
 * the auto generated visitor from ANTLR4.
 */
class ReqTreeVisitor extends AbstractParseTreeVisitor<PrereqTree> implements NusModsVisitor<PrereqTree> {
  errors: Error[]
  constructor() {
    super();
    this.errors = [];
  }

  protected defaultResult(): PrereqTree {
    return "";
  }

  visitWithSingularAlternative(ctx: ParserRuleContext, rule: string): PrereqTree {
    if (ctx.children === undefined) {
      return ""
    }
    // This can have either 0 children (ie all empty and filtered out)
    // Or 1 child (ie one subrule is populated)
    const result = ctx.children.map(child => child.accept(this)).filter(n => n !== '');
    if (result.length !== 0 && result.length !== 1) {
      this.errors.push(new Error(`${rule} has children != 0/1 which is impossible ${result}`));
    }
    return result.length === 0 ? '' : result[0] as PrereqTree;
  }


  // @ts-ignore
  visitOverall?: ((ctx: OverallContext) => PrereqTree) | undefined = (ctx) => {
    return ctx?.compound()?.accept(this);
  }

  visitCompound?: ((ctx: CompoundContext) => PrereqTree) | undefined = (ctx) => {
    return this.visitWithSingularAlternative(ctx, "compound");
  }

  // @ts-ignore
  visitBinop?: ((ctx: BinopContext) => PrereqTree) | undefined = (ctx) => {
    const lhs = ctx?.op()?.accept(this);
    const rhs = ctx?.compound()?.accept(this);
    const boolOp = ctx?.boolean_expr()?.text;
    if (lhs === undefined || rhs === undefined) {
      this.errors.push(new Error(`visitBinop bad lhs/rhs: lhs:${lhs} rhs:${rhs}`))
      return;
    }
    // Simplifying the tree
    if (lhs === '' && rhs === '') {
      return '';
    } else if (lhs === '') {
      return rhs;
    } else if (rhs == '') {
      return lhs;
    }
    switch (boolOp) {
      case 'AND':
        return generateAndBranch([lhs, rhs]);
      case 'OR':
        return generateOrBranch([lhs, rhs]);
      default:
        this.errors.push(new Error(`visitBinop unkown Binop type: ${boolOp}`))
        return;
    }
  }

  visitOp?: ((ctx: OpContext) => PrereqTree) | undefined = (ctx) => {
    return this.visitWithSingularAlternative(ctx, "op");
  }

  visitPrimitive?: ((ctx: PrimitiveContext) => PrereqTree) | undefined = (ctx) => {
    return this.visitWithSingularAlternative(ctx, "primitive");
  }

  visitPrereq?: ((ctx: PrereqContext) => PrereqTree) | undefined = (ctx) => {
    return this.visitWithSingularAlternative(ctx, "prereq");
  }

  visitCourses?: ((ctx: CoursesContext) => PrereqTree) | undefined = (ctx) => {
    const n = parseInt(ctx.contains_number().NUMBER().text, 10);
    const courses = ctx.course_items().PROGRAMS_VALUE().map(node => node.text);
    if (n === 1) {
      // If there's only 1 course required, and many courses are allowed, then it's
      // same as OR of them all.
      return courses.length === 1 ? courses[0] : generateOrBranch(courses);
    }
    return { nOf: [n, courses] };
  }

  visitCourse_items?: ((ctx: Course_itemsContext) => PrereqTree) | undefined = (ctx) => {
    return generateAndBranch(ctx.PROGRAMS_VALUE().map(node => node.text));
  }

}

/**
 * Parses the prerequisite string to produce the tokenized form.
 * @see __tests__/genReqTree.test.js
 */
export default function parseString(prerequisite: string, logger: Logger): PrereqTree | null {
  const chars = CharStreams.fromString(Buffer.from(prerequisite, 'utf-8').toString());
  const lexer = new NusModsLexer(chars);
  // console.log(lexer.getAllTokens())
  const tokens = new BufferedTokenStream(lexer);
  // console.log(tokens.getText());
  const parser = new NusModsParser(tokens);
  const tree = parser.overall();

  const visitor = new ReqTreeVisitor();
  const result = tree.accept(visitor);
  if (visitor.errors.length > 0) {
    console.log(visitor.errors)
    logger.info({ prerequisite, errors: visitor.errors }, 'Encountered parsing errors');
  }
  return result;
}
