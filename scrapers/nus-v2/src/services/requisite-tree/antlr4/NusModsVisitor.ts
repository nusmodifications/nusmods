// Generated from src/services/requisite-tree/antlr4/NusMods.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { OverallContext } from "./NusModsParser";
import { Program_typesContext } from "./NusModsParser";
import { CompoundContext } from "./NusModsParser";
import { BinopContext } from "./NusModsParser";
import { Boolean_exprContext } from "./NusModsParser";
import { OpContext } from "./NusModsParser";
import { PrimitiveContext } from "./NusModsParser";
import { ProgramsContext } from "./NusModsParser";
import { Programs_conditionContext } from "./NusModsParser";
import { Programs_valuesContext } from "./NusModsParser";
import { Plan_typesContext } from "./NusModsParser";
import { Plan_types_conditionContext } from "./NusModsParser";
import { Cohort_yearsContext } from "./NusModsParser";
import { Subject_yearsContext } from "./NusModsParser";
import { SpecialContext } from "./NusModsParser";
import { Special_conditionContext } from "./NusModsParser";
import { PrereqContext } from "./NusModsParser";
import { CoreqContext } from "./NusModsParser";
import { CoursesContext } from "./NusModsParser";
import { Course_itemsContext } from "./NusModsParser";
import { Must_be_inContext } from "./NusModsParser";
import { Must_not_be_inContext } from "./NusModsParser";
import { Contains_numberContext } from "./NusModsParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `NusModsParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface NusModsVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `NusModsParser.overall`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOverall?: (ctx: OverallContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.program_types`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitProgram_types?: (ctx: Program_typesContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.compound`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCompound?: (ctx: CompoundContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.binop`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBinop?: (ctx: BinopContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.boolean_expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBoolean_expr?: (ctx: Boolean_exprContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.op`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOp?: (ctx: OpContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.primitive`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrimitive?: (ctx: PrimitiveContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.programs`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrograms?: (ctx: ProgramsContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.programs_condition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrograms_condition?: (ctx: Programs_conditionContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.programs_values`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrograms_values?: (ctx: Programs_valuesContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.plan_types`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPlan_types?: (ctx: Plan_typesContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.plan_types_condition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPlan_types_condition?: (ctx: Plan_types_conditionContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.cohort_years`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCohort_years?: (ctx: Cohort_yearsContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.subject_years`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubject_years?: (ctx: Subject_yearsContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.special`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSpecial?: (ctx: SpecialContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.special_condition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSpecial_condition?: (ctx: Special_conditionContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.prereq`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrereq?: (ctx: PrereqContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.coreq`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCoreq?: (ctx: CoreqContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.courses`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCourses?: (ctx: CoursesContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.course_items`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCourse_items?: (ctx: Course_itemsContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.must_be_in`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMust_be_in?: (ctx: Must_be_inContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.must_not_be_in`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMust_not_be_in?: (ctx: Must_not_be_inContext) => Result;

	/**
	 * Visit a parse tree produced by `NusModsParser.contains_number`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitContains_number?: (ctx: Contains_numberContext) => Result;
}

