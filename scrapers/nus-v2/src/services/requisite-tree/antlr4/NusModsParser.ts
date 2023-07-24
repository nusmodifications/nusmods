// Generated from src/services/requisite-tree/antlr4/NusMods.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { NusModsVisitor } from "./NusModsVisitor";


export class NusModsParser extends Parser {
	public static readonly COMMA = 1;
	public static readonly LPAREN = 2;
	public static readonly RPAREN = 3;
	public static readonly IF_IN = 4;
	public static readonly MUST_BE_IN = 5;
	public static readonly IF_NOT_IN = 6;
	public static readonly MUST_NOT_BE_IN = 7;
	public static readonly THEN = 8;
	public static readonly AND = 9;
	public static readonly OR = 10;
	public static readonly PROGRAM_TYPES = 11;
	public static readonly PROGRAM_TYPES_VALUE = 12;
	public static readonly PROGRAMS = 13;
	public static readonly PLAN_TYPES = 14;
	public static readonly COHORT_YEARS = 15;
	public static readonly SUBJECT_YEARS = 16;
	public static readonly SPECIAL = 17;
	public static readonly SPECIAL_VALUE = 18;
	public static readonly COURSES = 19;
	public static readonly SUBJECTS = 20;
	public static readonly UNITS = 21;
	public static readonly GPA = 22;
	public static readonly COREQUISITE = 23;
	public static readonly QUOTE = 24;
	public static readonly NUMBER = 25;
	public static readonly YEARS = 26;
	public static readonly PROGRAMS_VALUE = 27;
	public static readonly WS = 28;
	public static readonly RULE_overall = 0;
	public static readonly RULE_program_types = 1;
	public static readonly RULE_compound = 2;
	public static readonly RULE_binop = 3;
	public static readonly RULE_boolean_expr = 4;
	public static readonly RULE_op = 5;
	public static readonly RULE_primitive = 6;
	public static readonly RULE_programs = 7;
	public static readonly RULE_programs_condition = 8;
	public static readonly RULE_programs_values = 9;
	public static readonly RULE_plan_types = 10;
	public static readonly RULE_plan_types_condition = 11;
	public static readonly RULE_cohort_years = 12;
	public static readonly RULE_subject_years = 13;
	public static readonly RULE_special = 14;
	public static readonly RULE_special_condition = 15;
	public static readonly RULE_prereq = 16;
	public static readonly RULE_coreq = 17;
	public static readonly RULE_courses = 18;
	public static readonly RULE_course_items = 19;
	public static readonly RULE_must_be_in = 20;
	public static readonly RULE_must_not_be_in = 21;
	public static readonly RULE_contains_number = 22;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"overall", "program_types", "compound", "binop", "boolean_expr", "op", 
		"primitive", "programs", "programs_condition", "programs_values", "plan_types", 
		"plan_types_condition", "cohort_years", "subject_years", "special", "special_condition", 
		"prereq", "coreq", "courses", "course_items", "must_be_in", "must_not_be_in", 
		"contains_number",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "','", "'('", "')'", "'IF_IN'", "'MUST_BE_IN'", "'IF_NOT_IN'", 
		"'MUST_NOT_BE_IN'", "'THEN'", "'AND'", "'OR'", undefined, undefined, undefined, 
		undefined, "'COHORT_YEARS'", "'SUBJECT_YEARS'", "'SPECIAL'", undefined, 
		undefined, "'SUBJECTS'", "'UNITS'", undefined, "'COREQUISITE'", "'\"'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "COMMA", "LPAREN", "RPAREN", "IF_IN", "MUST_BE_IN", "IF_NOT_IN", 
		"MUST_NOT_BE_IN", "THEN", "AND", "OR", "PROGRAM_TYPES", "PROGRAM_TYPES_VALUE", 
		"PROGRAMS", "PLAN_TYPES", "COHORT_YEARS", "SUBJECT_YEARS", "SPECIAL", 
		"SPECIAL_VALUE", "COURSES", "SUBJECTS", "UNITS", "GPA", "COREQUISITE", 
		"QUOTE", "NUMBER", "YEARS", "PROGRAMS_VALUE", "WS",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(NusModsParser._LITERAL_NAMES, NusModsParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return NusModsParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "NusMods.g4"; }

	// @Override
	public get ruleNames(): string[] { return NusModsParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return NusModsParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(NusModsParser._ATN, this);
	}
	// @RuleVersion(0)
	public overall(): OverallContext {
		let _localctx: OverallContext = new OverallContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, NusModsParser.RULE_overall);
		let _la: number;
		try {
			this.state = 59;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 1, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				// tslint:disable-next-line:no-empty
				{
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 47;
				this.program_types();
				this.state = 50;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === NusModsParser.AND) {
					{
					this.state = 48;
					this.match(NusModsParser.AND);
					this.state = 49;
					this.program_types();
					}
				}

				this.state = 52;
				this.match(NusModsParser.THEN);
				this.state = 53;
				this.compound();
				this.state = 54;
				this.match(NusModsParser.EOF);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 56;
				this.compound();
				this.state = 57;
				this.match(NusModsParser.EOF);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public program_types(): Program_typesContext {
		let _localctx: Program_typesContext = new Program_typesContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, NusModsParser.RULE_program_types);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 61;
			this.match(NusModsParser.PROGRAM_TYPES);
			this.state = 64;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case NusModsParser.IF_IN:
				{
				this.state = 62;
				this.match(NusModsParser.IF_IN);
				}
				break;
			case NusModsParser.MUST_BE_IN:
				{
				this.state = 63;
				this.must_be_in();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 66;
			this.match(NusModsParser.PROGRAM_TYPES_VALUE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public compound(): CompoundContext {
		let _localctx: CompoundContext = new CompoundContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, NusModsParser.RULE_compound);
		try {
			this.state = 75;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				// tslint:disable-next-line:no-empty
				{
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 69;
				this.match(NusModsParser.LPAREN);
				this.state = 70;
				this.compound();
				this.state = 71;
				this.match(NusModsParser.RPAREN);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 73;
				this.binop();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 74;
				this.op();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public binop(): BinopContext {
		let _localctx: BinopContext = new BinopContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, NusModsParser.RULE_binop);
		try {
			this.state = 82;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 4, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				// tslint:disable-next-line:no-empty
				{
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 78;
				this.op();
				this.state = 79;
				this.boolean_expr();
				this.state = 80;
				this.compound();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public boolean_expr(): Boolean_exprContext {
		let _localctx: Boolean_exprContext = new Boolean_exprContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, NusModsParser.RULE_boolean_expr);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 84;
			_la = this._input.LA(1);
			if (!(_la === NusModsParser.AND || _la === NusModsParser.OR)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public op(): OpContext {
		let _localctx: OpContext = new OpContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, NusModsParser.RULE_op);
		try {
			this.state = 91;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case NusModsParser.LPAREN:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 86;
				this.match(NusModsParser.LPAREN);
				this.state = 87;
				this.compound();
				this.state = 88;
				this.match(NusModsParser.RPAREN);
				}
				break;
			case NusModsParser.EOF:
			case NusModsParser.RPAREN:
			case NusModsParser.AND:
			case NusModsParser.OR:
			case NusModsParser.PROGRAMS:
			case NusModsParser.PLAN_TYPES:
			case NusModsParser.COHORT_YEARS:
			case NusModsParser.SUBJECT_YEARS:
			case NusModsParser.SPECIAL:
			case NusModsParser.COURSES:
			case NusModsParser.SUBJECTS:
			case NusModsParser.UNITS:
			case NusModsParser.GPA:
			case NusModsParser.COREQUISITE:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 90;
				this.primitive();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public primitive(): PrimitiveContext {
		let _localctx: PrimitiveContext = new PrimitiveContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, NusModsParser.RULE_primitive);
		try {
			this.state = 101;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				// tslint:disable-next-line:no-empty
				{
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 94;
				this.programs();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 95;
				this.plan_types();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 96;
				this.cohort_years();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 97;
				this.subject_years();
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 98;
				this.special();
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 99;
				this.prereq();
				}
				break;

			case 8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 100;
				this.coreq();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public programs(): ProgramsContext {
		let _localctx: ProgramsContext = new ProgramsContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, NusModsParser.RULE_programs);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 103;
			this.match(NusModsParser.PROGRAMS);
			this.state = 104;
			this.programs_condition();
			this.state = 105;
			this.programs_values();
			this.state = 108;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.THEN) {
				{
				this.state = 106;
				this.match(NusModsParser.THEN);
				this.state = 107;
				this.compound();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public programs_condition(): Programs_conditionContext {
		let _localctx: Programs_conditionContext = new Programs_conditionContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, NusModsParser.RULE_programs_condition);
		try {
			this.state = 114;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case NusModsParser.IF_IN:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 110;
				this.match(NusModsParser.IF_IN);
				}
				break;
			case NusModsParser.IF_NOT_IN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 111;
				this.match(NusModsParser.IF_NOT_IN);
				}
				break;
			case NusModsParser.MUST_BE_IN:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 112;
				this.must_be_in();
				}
				break;
			case NusModsParser.MUST_NOT_BE_IN:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 113;
				this.must_not_be_in();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public programs_values(): Programs_valuesContext {
		let _localctx: Programs_valuesContext = new Programs_valuesContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, NusModsParser.RULE_programs_values);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 116;
			this.match(NusModsParser.PROGRAMS_VALUE);
			this.state = 121;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === NusModsParser.COMMA) {
				{
				{
				this.state = 117;
				this.match(NusModsParser.COMMA);
				this.state = 118;
				this.match(NusModsParser.PROGRAMS_VALUE);
				}
				}
				this.state = 123;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public plan_types(): Plan_typesContext {
		let _localctx: Plan_typesContext = new Plan_typesContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, NusModsParser.RULE_plan_types);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 124;
			this.match(NusModsParser.PLAN_TYPES);
			this.state = 125;
			this.plan_types_condition();
			this.state = 126;
			this.programs_values();
			this.state = 129;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.THEN) {
				{
				this.state = 127;
				this.match(NusModsParser.THEN);
				this.state = 128;
				this.compound();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public plan_types_condition(): Plan_types_conditionContext {
		let _localctx: Plan_types_conditionContext = new Plan_types_conditionContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, NusModsParser.RULE_plan_types_condition);
		try {
			this.state = 135;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case NusModsParser.IF_IN:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 131;
				this.match(NusModsParser.IF_IN);
				}
				break;
			case NusModsParser.IF_NOT_IN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 132;
				this.match(NusModsParser.IF_NOT_IN);
				}
				break;
			case NusModsParser.MUST_BE_IN:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 133;
				this.must_be_in();
				}
				break;
			case NusModsParser.MUST_NOT_BE_IN:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 134;
				this.must_not_be_in();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public cohort_years(): Cohort_yearsContext {
		let _localctx: Cohort_yearsContext = new Cohort_yearsContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, NusModsParser.RULE_cohort_years);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 137;
			this.match(NusModsParser.COHORT_YEARS);
			this.state = 142;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case NusModsParser.IF_IN:
				{
				this.state = 138;
				this.match(NusModsParser.IF_IN);
				}
				break;
			case NusModsParser.IF_NOT_IN:
				{
				this.state = 139;
				this.match(NusModsParser.IF_NOT_IN);
				}
				break;
			case NusModsParser.MUST_BE_IN:
				{
				this.state = 140;
				this.must_be_in();
				}
				break;
			case NusModsParser.MUST_NOT_BE_IN:
				{
				this.state = 141;
				this.must_not_be_in();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 144;
			this.match(NusModsParser.YEARS);
			this.state = 146;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.YEARS) {
				{
				this.state = 145;
				this.match(NusModsParser.YEARS);
				}
			}

			this.state = 150;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.THEN) {
				{
				this.state = 148;
				this.match(NusModsParser.THEN);
				this.state = 149;
				this.compound();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subject_years(): Subject_yearsContext {
		let _localctx: Subject_yearsContext = new Subject_yearsContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, NusModsParser.RULE_subject_years);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 152;
			this.match(NusModsParser.SUBJECT_YEARS);
			this.state = 153;
			this.match(NusModsParser.IF_IN);
			this.state = 154;
			this.match(NusModsParser.YEARS);
			this.state = 156;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.YEARS) {
				{
				this.state = 155;
				this.match(NusModsParser.YEARS);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public special(): SpecialContext {
		let _localctx: SpecialContext = new SpecialContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, NusModsParser.RULE_special);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 158;
			this.match(NusModsParser.SPECIAL);
			this.state = 159;
			this.special_condition();
			this.state = 160;
			this.match(NusModsParser.QUOTE);
			this.state = 161;
			this.match(NusModsParser.SPECIAL_VALUE);
			this.state = 162;
			this.match(NusModsParser.QUOTE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public special_condition(): Special_conditionContext {
		let _localctx: Special_conditionContext = new Special_conditionContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, NusModsParser.RULE_special_condition);
		try {
			this.state = 168;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case NusModsParser.IF_IN:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 164;
				this.match(NusModsParser.IF_IN);
				}
				break;
			case NusModsParser.IF_NOT_IN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 165;
				this.match(NusModsParser.IF_NOT_IN);
				}
				break;
			case NusModsParser.MUST_BE_IN:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 166;
				this.must_be_in();
				}
				break;
			case NusModsParser.MUST_NOT_BE_IN:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 167;
				this.must_not_be_in();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public prereq(): PrereqContext {
		let _localctx: PrereqContext = new PrereqContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, NusModsParser.RULE_prereq);
		let _la: number;
		try {
			this.state = 181;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case NusModsParser.EOF:
			case NusModsParser.RPAREN:
			case NusModsParser.AND:
			case NusModsParser.OR:
				this.enterOuterAlt(_localctx, 1);
				// tslint:disable-next-line:no-empty
				{
				}
				break;
			case NusModsParser.COURSES:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 171;
				this.courses();
				}
				break;
			case NusModsParser.SUBJECTS:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 172;
				this.match(NusModsParser.SUBJECTS);
				this.state = 174;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === NusModsParser.LPAREN) {
					{
					this.state = 173;
					this.contains_number();
					}
				}

				this.state = 176;
				this.programs_values();
				}
				break;
			case NusModsParser.UNITS:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 177;
				this.match(NusModsParser.UNITS);
				this.state = 178;
				this.contains_number();
				}
				break;
			case NusModsParser.GPA:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 179;
				this.match(NusModsParser.GPA);
				this.state = 180;
				this.contains_number();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public coreq(): CoreqContext {
		let _localctx: CoreqContext = new CoreqContext(this._ctx, this.state);
		this.enterRule(_localctx, 34, NusModsParser.RULE_coreq);
		try {
			this.state = 191;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 19, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				// tslint:disable-next-line:no-empty
				{
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 184;
				this.match(NusModsParser.COREQUISITE);
				this.state = 185;
				this.match(NusModsParser.LPAREN);
				this.state = 186;
				this.courses();
				this.state = 187;
				this.match(NusModsParser.RPAREN);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 189;
				this.match(NusModsParser.COREQUISITE);
				this.state = 190;
				this.courses();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public courses(): CoursesContext {
		let _localctx: CoursesContext = new CoursesContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, NusModsParser.RULE_courses);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 193;
			this.match(NusModsParser.COURSES);
			this.state = 195;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.LPAREN) {
				{
				this.state = 194;
				this.contains_number();
				}
			}

			this.state = 197;
			this.course_items();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public course_items(): Course_itemsContext {
		let _localctx: Course_itemsContext = new Course_itemsContext(this._ctx, this.state);
		this.enterRule(_localctx, 38, NusModsParser.RULE_course_items);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 199;
			this.match(NusModsParser.PROGRAMS_VALUE);
			this.state = 204;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === NusModsParser.COMMA) {
				{
				{
				this.state = 200;
				this.match(NusModsParser.COMMA);
				this.state = 201;
				this.match(NusModsParser.PROGRAMS_VALUE);
				}
				}
				this.state = 206;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public must_be_in(): Must_be_inContext {
		let _localctx: Must_be_inContext = new Must_be_inContext(this._ctx, this.state);
		this.enterRule(_localctx, 40, NusModsParser.RULE_must_be_in);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 207;
			this.match(NusModsParser.MUST_BE_IN);
			this.state = 209;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.LPAREN) {
				{
				this.state = 208;
				this.contains_number();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public must_not_be_in(): Must_not_be_inContext {
		let _localctx: Must_not_be_inContext = new Must_not_be_inContext(this._ctx, this.state);
		this.enterRule(_localctx, 42, NusModsParser.RULE_must_not_be_in);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 211;
			this.match(NusModsParser.MUST_NOT_BE_IN);
			this.state = 213;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.LPAREN) {
				{
				this.state = 212;
				this.contains_number();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public contains_number(): Contains_numberContext {
		let _localctx: Contains_numberContext = new Contains_numberContext(this._ctx, this.state);
		this.enterRule(_localctx, 44, NusModsParser.RULE_contains_number);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 215;
			this.match(NusModsParser.LPAREN);
			this.state = 216;
			this.match(NusModsParser.NUMBER);
			this.state = 217;
			this.match(NusModsParser.RPAREN);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x1E\xDE\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x03\x02\x03\x02\x03\x02\x03\x02\x05\x025\n\x02\x03\x02\x03" +
		"\x02\x03\x02\x03\x02\x03\x02\x03\x02\x03\x02\x05\x02>\n\x02\x03\x03\x03" +
		"\x03\x03\x03\x05\x03C\n\x03\x03\x03\x03\x03\x03\x04\x03\x04\x03\x04\x03" +
		"\x04\x03\x04\x03\x04\x03\x04\x05\x04N\n\x04\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x05\x05U\n\x05\x03\x06\x03\x06\x03\x07\x03\x07\x03\x07\x03" +
		"\x07\x03\x07\x05\x07^\n\x07\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b" +
		"\x03\b\x05\bh\n\b\x03\t\x03\t\x03\t\x03\t\x03\t\x05\to\n\t\x03\n\x03\n" +
		"\x03\n\x03\n\x05\nu\n\n\x03\v\x03\v\x03\v\x07\vz\n\v\f\v\x0E\v}\v\v\x03" +
		"\f\x03\f\x03\f\x03\f\x03\f\x05\f\x84\n\f\x03\r\x03\r\x03\r\x03\r\x05\r" +
		"\x8A\n\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x05\x0E\x91\n\x0E\x03" +
		"\x0E\x03\x0E\x05\x0E\x95\n\x0E\x03\x0E\x03\x0E\x05\x0E\x99\n\x0E\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x05\x0F\x9F\n\x0F\x03\x10\x03\x10\x03\x10\x03" +
		"\x10\x03\x10\x03\x10\x03\x11\x03\x11\x03\x11\x03\x11\x05\x11\xAB\n\x11" +
		"\x03\x12\x03\x12\x03\x12\x03\x12\x05\x12\xB1\n\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x05\x12\xB8\n\x12\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x03\x13\x03\x13\x03\x13\x03\x13\x05\x13\xC2\n\x13\x03\x14\x03\x14\x05" +
		"\x14\xC6\n\x14\x03\x14\x03\x14\x03\x15\x03\x15\x03\x15\x07\x15\xCD\n\x15" +
		"\f\x15\x0E\x15\xD0\v\x15\x03\x16\x03\x16\x05\x16\xD4\n\x16\x03\x17\x03" +
		"\x17\x05\x17\xD8\n\x17\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x02\x02" +
		"\x02\x19\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12" +
		"\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02&" +
		"\x02(\x02*\x02,\x02.\x02\x02\x03\x03\x02\v\f\x02\xF3\x02=\x03\x02\x02" +
		"\x02\x04?\x03\x02\x02\x02\x06M\x03\x02\x02\x02\bT\x03\x02\x02\x02\nV\x03" +
		"\x02\x02\x02\f]\x03\x02\x02\x02\x0Eg\x03\x02\x02\x02\x10i\x03\x02\x02" +
		"\x02\x12t\x03\x02\x02\x02\x14v\x03\x02\x02\x02\x16~\x03\x02\x02\x02\x18" +
		"\x89\x03\x02\x02\x02\x1A\x8B\x03\x02\x02\x02\x1C\x9A\x03\x02\x02\x02\x1E" +
		"\xA0\x03\x02\x02\x02 \xAA\x03\x02\x02\x02\"\xB7\x03\x02\x02\x02$\xC1\x03" +
		"\x02\x02\x02&\xC3\x03\x02\x02\x02(\xC9\x03\x02\x02\x02*\xD1\x03\x02\x02" +
		"\x02,\xD5\x03\x02\x02\x02.\xD9\x03\x02\x02\x020>\x03\x02\x02\x0214\x05" +
		"\x04\x03\x0223\x07\v\x02\x0235\x05\x04\x03\x0242\x03\x02\x02\x0245\x03" +
		"\x02\x02\x0256\x03\x02\x02\x0267\x07\n\x02\x0278\x05\x06\x04\x0289\x07" +
		"\x02\x02\x039>\x03\x02\x02\x02:;\x05\x06\x04\x02;<\x07\x02\x02\x03<>\x03" +
		"\x02\x02\x02=0\x03\x02\x02\x02=1\x03\x02\x02\x02=:\x03\x02\x02\x02>\x03" +
		"\x03\x02\x02\x02?B\x07\r\x02\x02@C\x07\x06\x02\x02AC\x05*\x16\x02B@\x03" +
		"\x02\x02\x02BA\x03\x02\x02\x02CD\x03\x02\x02\x02DE\x07\x0E\x02\x02E\x05" +
		"\x03\x02\x02\x02FN\x03\x02\x02\x02GH\x07\x04\x02\x02HI\x05\x06\x04\x02" +
		"IJ\x07\x05\x02\x02JN\x03\x02\x02\x02KN\x05\b\x05\x02LN\x05\f\x07\x02M" +
		"F\x03\x02\x02\x02MG\x03\x02\x02\x02MK\x03\x02\x02\x02ML\x03\x02\x02\x02" +
		"N\x07\x03\x02\x02\x02OU\x03\x02\x02\x02PQ\x05\f\x07\x02QR\x05\n\x06\x02" +
		"RS\x05\x06\x04\x02SU\x03\x02\x02\x02TO\x03\x02\x02\x02TP\x03\x02\x02\x02" +
		"U\t\x03\x02\x02\x02VW\t\x02\x02\x02W\v\x03\x02\x02\x02XY\x07\x04\x02\x02" +
		"YZ\x05\x06\x04\x02Z[\x07\x05\x02\x02[^\x03\x02\x02\x02\\^\x05\x0E\b\x02" +
		"]X\x03\x02\x02\x02]\\\x03\x02\x02\x02^\r\x03\x02\x02\x02_h\x03\x02\x02" +
		"\x02`h\x05\x10\t\x02ah\x05\x16\f\x02bh\x05\x1A\x0E\x02ch\x05\x1C\x0F\x02" +
		"dh\x05\x1E\x10\x02eh\x05\"\x12\x02fh\x05$\x13\x02g_\x03\x02\x02\x02g`" +
		"\x03\x02\x02\x02ga\x03\x02\x02\x02gb\x03\x02\x02\x02gc\x03\x02\x02\x02" +
		"gd\x03\x02\x02\x02ge\x03\x02\x02\x02gf\x03\x02\x02\x02h\x0F\x03\x02\x02" +
		"\x02ij\x07\x0F\x02\x02jk\x05\x12\n\x02kn\x05\x14\v\x02lm\x07\n\x02\x02" +
		"mo\x05\x06\x04\x02nl\x03\x02\x02\x02no\x03\x02\x02\x02o\x11\x03\x02\x02" +
		"\x02pu\x07\x06\x02\x02qu\x07\b\x02\x02ru\x05*\x16\x02su\x05,\x17\x02t" +
		"p\x03\x02\x02\x02tq\x03\x02\x02\x02tr\x03\x02\x02\x02ts\x03\x02\x02\x02" +
		"u\x13\x03\x02\x02\x02v{\x07\x1D\x02\x02wx\x07\x03\x02\x02xz\x07\x1D\x02" +
		"\x02yw\x03\x02\x02\x02z}\x03\x02\x02\x02{y\x03\x02\x02\x02{|\x03\x02\x02" +
		"\x02|\x15\x03\x02\x02\x02}{\x03\x02\x02\x02~\x7F\x07\x10\x02\x02\x7F\x80" +
		"\x05\x18\r\x02\x80\x83\x05\x14\v\x02\x81\x82\x07\n\x02\x02\x82\x84\x05" +
		"\x06\x04\x02\x83\x81\x03\x02\x02\x02\x83\x84\x03\x02\x02\x02\x84\x17\x03" +
		"\x02\x02\x02\x85\x8A\x07\x06\x02\x02\x86\x8A\x07\b\x02\x02\x87\x8A\x05" +
		"*\x16\x02\x88\x8A\x05,\x17\x02\x89\x85\x03\x02\x02\x02\x89\x86\x03\x02" +
		"\x02\x02\x89\x87\x03\x02\x02\x02\x89\x88\x03\x02\x02\x02\x8A\x19\x03\x02" +
		"\x02\x02\x8B\x90\x07\x11\x02\x02\x8C\x91\x07\x06\x02\x02\x8D\x91\x07\b" +
		"\x02\x02\x8E\x91\x05*\x16\x02\x8F\x91\x05,\x17\x02\x90\x8C\x03\x02\x02" +
		"\x02\x90\x8D\x03\x02\x02\x02\x90\x8E\x03\x02\x02\x02\x90\x8F\x03\x02\x02" +
		"\x02\x91\x92\x03\x02\x02\x02\x92\x94\x07\x1C\x02\x02\x93\x95\x07\x1C\x02" +
		"\x02\x94\x93\x03\x02\x02\x02\x94\x95\x03\x02\x02\x02\x95\x98\x03\x02\x02" +
		"\x02\x96\x97\x07\n\x02\x02\x97\x99\x05\x06\x04\x02\x98\x96\x03\x02\x02" +
		"\x02\x98\x99\x03\x02\x02\x02\x99\x1B\x03\x02\x02\x02\x9A\x9B\x07\x12\x02" +
		"\x02\x9B\x9C\x07\x06\x02\x02\x9C\x9E\x07\x1C\x02\x02\x9D\x9F\x07\x1C\x02" +
		"\x02\x9E\x9D\x03\x02\x02\x02\x9E\x9F\x03\x02\x02\x02\x9F\x1D\x03\x02\x02" +
		"\x02\xA0\xA1\x07\x13\x02\x02\xA1\xA2\x05 \x11\x02\xA2\xA3\x07\x1A\x02" +
		"\x02\xA3\xA4\x07\x14\x02\x02\xA4\xA5\x07\x1A\x02\x02\xA5\x1F\x03\x02\x02" +
		"\x02\xA6\xAB\x07\x06\x02\x02\xA7\xAB\x07\b\x02\x02\xA8\xAB\x05*\x16\x02" +
		"\xA9\xAB\x05,\x17\x02\xAA\xA6\x03\x02\x02\x02\xAA\xA7\x03\x02\x02\x02" +
		"\xAA\xA8\x03\x02\x02\x02\xAA\xA9\x03\x02\x02\x02\xAB!\x03\x02\x02\x02" +
		"\xAC\xB8\x03\x02\x02\x02\xAD\xB8\x05&\x14\x02\xAE\xB0\x07\x16\x02\x02" +
		"\xAF\xB1\x05.\x18\x02\xB0\xAF\x03\x02\x02\x02\xB0\xB1\x03\x02\x02\x02" +
		"\xB1\xB2\x03\x02\x02\x02\xB2\xB8\x05\x14\v\x02\xB3\xB4\x07\x17\x02\x02" +
		"\xB4\xB8\x05.\x18\x02\xB5\xB6\x07\x18\x02\x02\xB6\xB8\x05.\x18\x02\xB7" +
		"\xAC\x03\x02\x02\x02\xB7\xAD\x03\x02\x02\x02\xB7\xAE\x03\x02\x02\x02\xB7" +
		"\xB3\x03\x02\x02\x02\xB7\xB5\x03\x02\x02\x02\xB8#\x03\x02\x02\x02\xB9" +
		"\xC2\x03\x02\x02\x02\xBA\xBB\x07\x19\x02\x02\xBB\xBC\x07\x04\x02\x02\xBC" +
		"\xBD\x05&\x14\x02\xBD\xBE\x07\x05\x02\x02\xBE\xC2\x03\x02\x02\x02\xBF" +
		"\xC0\x07\x19\x02\x02\xC0\xC2\x05&\x14\x02\xC1\xB9\x03\x02\x02\x02\xC1" +
		"\xBA\x03\x02\x02\x02\xC1\xBF\x03\x02\x02\x02\xC2%\x03\x02\x02\x02\xC3" +
		"\xC5\x07\x15\x02\x02\xC4\xC6\x05.\x18\x02\xC5\xC4\x03\x02\x02\x02\xC5" +
		"\xC6\x03\x02\x02\x02\xC6\xC7\x03\x02\x02\x02\xC7\xC8\x05(\x15\x02\xC8" +
		"\'\x03\x02\x02\x02\xC9\xCE\x07\x1D\x02\x02\xCA\xCB\x07\x03\x02\x02\xCB" +
		"\xCD\x07\x1D\x02\x02\xCC\xCA\x03\x02\x02\x02\xCD\xD0\x03\x02\x02\x02\xCE" +
		"\xCC\x03\x02\x02\x02\xCE\xCF\x03\x02\x02\x02\xCF)\x03\x02\x02\x02\xD0" +
		"\xCE\x03\x02\x02\x02\xD1\xD3\x07\x07\x02\x02\xD2\xD4\x05.\x18\x02\xD3" +
		"\xD2\x03\x02\x02\x02\xD3\xD4\x03\x02\x02\x02\xD4+\x03\x02\x02\x02\xD5" +
		"\xD7\x07\t\x02\x02\xD6\xD8\x05.\x18\x02\xD7\xD6\x03\x02\x02\x02\xD7\xD8" +
		"\x03\x02\x02\x02\xD8-\x03\x02\x02\x02\xD9\xDA\x07\x04\x02\x02\xDA\xDB" +
		"\x07\x1B\x02\x02\xDB\xDC\x07\x05\x02\x02\xDC/\x03\x02\x02\x02\x1A4=BM" +
		"T]gnt{\x83\x89\x90\x94\x98\x9E\xAA\xB0\xB7\xC1\xC5\xCE\xD3\xD7";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!NusModsParser.__ATN) {
			NusModsParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(NusModsParser._serializedATN));
		}

		return NusModsParser.__ATN;
	}

}

export class OverallContext extends ParserRuleContext {
	public program_types(): Program_typesContext[];
	public program_types(i: number): Program_typesContext;
	public program_types(i?: number): Program_typesContext | Program_typesContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Program_typesContext);
		} else {
			return this.getRuleContext(i, Program_typesContext);
		}
	}
	public THEN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.THEN, 0); }
	public compound(): CompoundContext | undefined {
		return this.tryGetRuleContext(0, CompoundContext);
	}
	public EOF(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.EOF, 0); }
	public AND(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.AND, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_overall; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitOverall) {
			return visitor.visitOverall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Program_typesContext extends ParserRuleContext {
	public PROGRAM_TYPES(): TerminalNode { return this.getToken(NusModsParser.PROGRAM_TYPES, 0); }
	public PROGRAM_TYPES_VALUE(): TerminalNode { return this.getToken(NusModsParser.PROGRAM_TYPES_VALUE, 0); }
	public IF_IN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.IF_IN, 0); }
	public must_be_in(): Must_be_inContext | undefined {
		return this.tryGetRuleContext(0, Must_be_inContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_program_types; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitProgram_types) {
			return visitor.visitProgram_types(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CompoundContext extends ParserRuleContext {
	public LPAREN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.LPAREN, 0); }
	public compound(): CompoundContext | undefined {
		return this.tryGetRuleContext(0, CompoundContext);
	}
	public RPAREN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.RPAREN, 0); }
	public binop(): BinopContext | undefined {
		return this.tryGetRuleContext(0, BinopContext);
	}
	public op(): OpContext | undefined {
		return this.tryGetRuleContext(0, OpContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_compound; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitCompound) {
			return visitor.visitCompound(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BinopContext extends ParserRuleContext {
	public op(): OpContext | undefined {
		return this.tryGetRuleContext(0, OpContext);
	}
	public boolean_expr(): Boolean_exprContext | undefined {
		return this.tryGetRuleContext(0, Boolean_exprContext);
	}
	public compound(): CompoundContext | undefined {
		return this.tryGetRuleContext(0, CompoundContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_binop; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitBinop) {
			return visitor.visitBinop(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Boolean_exprContext extends ParserRuleContext {
	public AND(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.AND, 0); }
	public OR(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.OR, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_boolean_expr; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitBoolean_expr) {
			return visitor.visitBoolean_expr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OpContext extends ParserRuleContext {
	public LPAREN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.LPAREN, 0); }
	public compound(): CompoundContext | undefined {
		return this.tryGetRuleContext(0, CompoundContext);
	}
	public RPAREN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.RPAREN, 0); }
	public primitive(): PrimitiveContext | undefined {
		return this.tryGetRuleContext(0, PrimitiveContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_op; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitOp) {
			return visitor.visitOp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PrimitiveContext extends ParserRuleContext {
	public programs(): ProgramsContext | undefined {
		return this.tryGetRuleContext(0, ProgramsContext);
	}
	public plan_types(): Plan_typesContext | undefined {
		return this.tryGetRuleContext(0, Plan_typesContext);
	}
	public cohort_years(): Cohort_yearsContext | undefined {
		return this.tryGetRuleContext(0, Cohort_yearsContext);
	}
	public subject_years(): Subject_yearsContext | undefined {
		return this.tryGetRuleContext(0, Subject_yearsContext);
	}
	public special(): SpecialContext | undefined {
		return this.tryGetRuleContext(0, SpecialContext);
	}
	public prereq(): PrereqContext | undefined {
		return this.tryGetRuleContext(0, PrereqContext);
	}
	public coreq(): CoreqContext | undefined {
		return this.tryGetRuleContext(0, CoreqContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_primitive; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitPrimitive) {
			return visitor.visitPrimitive(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ProgramsContext extends ParserRuleContext {
	public PROGRAMS(): TerminalNode { return this.getToken(NusModsParser.PROGRAMS, 0); }
	public programs_condition(): Programs_conditionContext {
		return this.getRuleContext(0, Programs_conditionContext);
	}
	public programs_values(): Programs_valuesContext {
		return this.getRuleContext(0, Programs_valuesContext);
	}
	public THEN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.THEN, 0); }
	public compound(): CompoundContext | undefined {
		return this.tryGetRuleContext(0, CompoundContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_programs; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitPrograms) {
			return visitor.visitPrograms(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Programs_conditionContext extends ParserRuleContext {
	public IF_IN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.IF_IN, 0); }
	public IF_NOT_IN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.IF_NOT_IN, 0); }
	public must_be_in(): Must_be_inContext | undefined {
		return this.tryGetRuleContext(0, Must_be_inContext);
	}
	public must_not_be_in(): Must_not_be_inContext | undefined {
		return this.tryGetRuleContext(0, Must_not_be_inContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_programs_condition; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitPrograms_condition) {
			return visitor.visitPrograms_condition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Programs_valuesContext extends ParserRuleContext {
	public PROGRAMS_VALUE(): TerminalNode[];
	public PROGRAMS_VALUE(i: number): TerminalNode;
	public PROGRAMS_VALUE(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(NusModsParser.PROGRAMS_VALUE);
		} else {
			return this.getToken(NusModsParser.PROGRAMS_VALUE, i);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(NusModsParser.COMMA);
		} else {
			return this.getToken(NusModsParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_programs_values; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitPrograms_values) {
			return visitor.visitPrograms_values(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Plan_typesContext extends ParserRuleContext {
	public PLAN_TYPES(): TerminalNode { return this.getToken(NusModsParser.PLAN_TYPES, 0); }
	public plan_types_condition(): Plan_types_conditionContext {
		return this.getRuleContext(0, Plan_types_conditionContext);
	}
	public programs_values(): Programs_valuesContext {
		return this.getRuleContext(0, Programs_valuesContext);
	}
	public THEN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.THEN, 0); }
	public compound(): CompoundContext | undefined {
		return this.tryGetRuleContext(0, CompoundContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_plan_types; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitPlan_types) {
			return visitor.visitPlan_types(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Plan_types_conditionContext extends ParserRuleContext {
	public IF_IN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.IF_IN, 0); }
	public IF_NOT_IN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.IF_NOT_IN, 0); }
	public must_be_in(): Must_be_inContext | undefined {
		return this.tryGetRuleContext(0, Must_be_inContext);
	}
	public must_not_be_in(): Must_not_be_inContext | undefined {
		return this.tryGetRuleContext(0, Must_not_be_inContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_plan_types_condition; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitPlan_types_condition) {
			return visitor.visitPlan_types_condition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Cohort_yearsContext extends ParserRuleContext {
	public COHORT_YEARS(): TerminalNode { return this.getToken(NusModsParser.COHORT_YEARS, 0); }
	public YEARS(): TerminalNode[];
	public YEARS(i: number): TerminalNode;
	public YEARS(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(NusModsParser.YEARS);
		} else {
			return this.getToken(NusModsParser.YEARS, i);
		}
	}
	public IF_IN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.IF_IN, 0); }
	public IF_NOT_IN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.IF_NOT_IN, 0); }
	public must_be_in(): Must_be_inContext | undefined {
		return this.tryGetRuleContext(0, Must_be_inContext);
	}
	public must_not_be_in(): Must_not_be_inContext | undefined {
		return this.tryGetRuleContext(0, Must_not_be_inContext);
	}
	public THEN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.THEN, 0); }
	public compound(): CompoundContext | undefined {
		return this.tryGetRuleContext(0, CompoundContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_cohort_years; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitCohort_years) {
			return visitor.visitCohort_years(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Subject_yearsContext extends ParserRuleContext {
	public SUBJECT_YEARS(): TerminalNode { return this.getToken(NusModsParser.SUBJECT_YEARS, 0); }
	public IF_IN(): TerminalNode { return this.getToken(NusModsParser.IF_IN, 0); }
	public YEARS(): TerminalNode[];
	public YEARS(i: number): TerminalNode;
	public YEARS(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(NusModsParser.YEARS);
		} else {
			return this.getToken(NusModsParser.YEARS, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_subject_years; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitSubject_years) {
			return visitor.visitSubject_years(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SpecialContext extends ParserRuleContext {
	public SPECIAL(): TerminalNode { return this.getToken(NusModsParser.SPECIAL, 0); }
	public special_condition(): Special_conditionContext {
		return this.getRuleContext(0, Special_conditionContext);
	}
	public QUOTE(): TerminalNode[];
	public QUOTE(i: number): TerminalNode;
	public QUOTE(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(NusModsParser.QUOTE);
		} else {
			return this.getToken(NusModsParser.QUOTE, i);
		}
	}
	public SPECIAL_VALUE(): TerminalNode { return this.getToken(NusModsParser.SPECIAL_VALUE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_special; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitSpecial) {
			return visitor.visitSpecial(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Special_conditionContext extends ParserRuleContext {
	public IF_IN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.IF_IN, 0); }
	public IF_NOT_IN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.IF_NOT_IN, 0); }
	public must_be_in(): Must_be_inContext | undefined {
		return this.tryGetRuleContext(0, Must_be_inContext);
	}
	public must_not_be_in(): Must_not_be_inContext | undefined {
		return this.tryGetRuleContext(0, Must_not_be_inContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_special_condition; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitSpecial_condition) {
			return visitor.visitSpecial_condition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PrereqContext extends ParserRuleContext {
	public courses(): CoursesContext | undefined {
		return this.tryGetRuleContext(0, CoursesContext);
	}
	public SUBJECTS(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.SUBJECTS, 0); }
	public programs_values(): Programs_valuesContext | undefined {
		return this.tryGetRuleContext(0, Programs_valuesContext);
	}
	public contains_number(): Contains_numberContext | undefined {
		return this.tryGetRuleContext(0, Contains_numberContext);
	}
	public UNITS(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.UNITS, 0); }
	public GPA(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.GPA, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_prereq; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitPrereq) {
			return visitor.visitPrereq(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CoreqContext extends ParserRuleContext {
	public COREQUISITE(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.COREQUISITE, 0); }
	public LPAREN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.LPAREN, 0); }
	public courses(): CoursesContext | undefined {
		return this.tryGetRuleContext(0, CoursesContext);
	}
	public RPAREN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.RPAREN, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_coreq; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitCoreq) {
			return visitor.visitCoreq(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CoursesContext extends ParserRuleContext {
	public COURSES(): TerminalNode { return this.getToken(NusModsParser.COURSES, 0); }
	public course_items(): Course_itemsContext {
		return this.getRuleContext(0, Course_itemsContext);
	}
	public contains_number(): Contains_numberContext | undefined {
		return this.tryGetRuleContext(0, Contains_numberContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_courses; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitCourses) {
			return visitor.visitCourses(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Course_itemsContext extends ParserRuleContext {
	public PROGRAMS_VALUE(): TerminalNode[];
	public PROGRAMS_VALUE(i: number): TerminalNode;
	public PROGRAMS_VALUE(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(NusModsParser.PROGRAMS_VALUE);
		} else {
			return this.getToken(NusModsParser.PROGRAMS_VALUE, i);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(NusModsParser.COMMA);
		} else {
			return this.getToken(NusModsParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_course_items; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitCourse_items) {
			return visitor.visitCourse_items(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Must_be_inContext extends ParserRuleContext {
	public MUST_BE_IN(): TerminalNode { return this.getToken(NusModsParser.MUST_BE_IN, 0); }
	public contains_number(): Contains_numberContext | undefined {
		return this.tryGetRuleContext(0, Contains_numberContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_must_be_in; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitMust_be_in) {
			return visitor.visitMust_be_in(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Must_not_be_inContext extends ParserRuleContext {
	public MUST_NOT_BE_IN(): TerminalNode { return this.getToken(NusModsParser.MUST_NOT_BE_IN, 0); }
	public contains_number(): Contains_numberContext | undefined {
		return this.tryGetRuleContext(0, Contains_numberContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_must_not_be_in; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitMust_not_be_in) {
			return visitor.visitMust_not_be_in(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Contains_numberContext extends ParserRuleContext {
	public LPAREN(): TerminalNode { return this.getToken(NusModsParser.LPAREN, 0); }
	public NUMBER(): TerminalNode { return this.getToken(NusModsParser.NUMBER, 0); }
	public RPAREN(): TerminalNode { return this.getToken(NusModsParser.RPAREN, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return NusModsParser.RULE_contains_number; }
	// @Override
	public accept<Result>(visitor: NusModsVisitor<Result>): Result {
		if (visitor.visitContains_number) {
			return visitor.visitContains_number(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


