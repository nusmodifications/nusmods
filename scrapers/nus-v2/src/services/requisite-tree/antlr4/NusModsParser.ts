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
		try {
			this.state = 55;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 0, this._ctx) ) {
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
				this.state = 48;
				this.match(NusModsParser.THEN);
				this.state = 49;
				this.compound();
				this.state = 50;
				this.match(NusModsParser.EOF);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 52;
				this.compound();
				this.state = 53;
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
			this.state = 57;
			this.match(NusModsParser.PROGRAM_TYPES);
			this.state = 60;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case NusModsParser.IF_IN:
				{
				this.state = 58;
				this.match(NusModsParser.IF_IN);
				}
				break;
			case NusModsParser.MUST_BE_IN:
				{
				this.state = 59;
				this.must_be_in();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 62;
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
			this.state = 71;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 2, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				// tslint:disable-next-line:no-empty
				{
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 65;
				this.match(NusModsParser.LPAREN);
				this.state = 66;
				this.compound();
				this.state = 67;
				this.match(NusModsParser.RPAREN);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 69;
				this.binop();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 70;
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
			this.state = 78;
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
				this.state = 74;
				this.op();
				this.state = 75;
				this.boolean_expr();
				this.state = 76;
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
			this.state = 80;
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
			this.state = 87;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case NusModsParser.LPAREN:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 82;
				this.match(NusModsParser.LPAREN);
				this.state = 83;
				this.compound();
				this.state = 84;
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
				this.state = 86;
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
			this.state = 97;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 5, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				// tslint:disable-next-line:no-empty
				{
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 90;
				this.programs();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 91;
				this.plan_types();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 92;
				this.cohort_years();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 93;
				this.subject_years();
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 94;
				this.special();
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 95;
				this.prereq();
				}
				break;

			case 8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 96;
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
			this.state = 99;
			this.match(NusModsParser.PROGRAMS);
			this.state = 100;
			this.programs_condition();
			this.state = 101;
			this.programs_values();
			this.state = 104;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.THEN) {
				{
				this.state = 102;
				this.match(NusModsParser.THEN);
				this.state = 103;
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
			this.state = 110;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case NusModsParser.IF_IN:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 106;
				this.match(NusModsParser.IF_IN);
				}
				break;
			case NusModsParser.IF_NOT_IN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 107;
				this.match(NusModsParser.IF_NOT_IN);
				}
				break;
			case NusModsParser.MUST_BE_IN:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 108;
				this.must_be_in();
				}
				break;
			case NusModsParser.MUST_NOT_BE_IN:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 109;
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
			this.state = 112;
			this.match(NusModsParser.PROGRAMS_VALUE);
			this.state = 117;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === NusModsParser.COMMA) {
				{
				{
				this.state = 113;
				this.match(NusModsParser.COMMA);
				this.state = 114;
				this.match(NusModsParser.PROGRAMS_VALUE);
				}
				}
				this.state = 119;
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
			this.state = 120;
			this.match(NusModsParser.PLAN_TYPES);
			this.state = 121;
			this.plan_types_condition();
			this.state = 122;
			this.programs_values();
			this.state = 125;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.THEN) {
				{
				this.state = 123;
				this.match(NusModsParser.THEN);
				this.state = 124;
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
			this.state = 131;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case NusModsParser.IF_IN:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 127;
				this.match(NusModsParser.IF_IN);
				}
				break;
			case NusModsParser.IF_NOT_IN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 128;
				this.match(NusModsParser.IF_NOT_IN);
				}
				break;
			case NusModsParser.MUST_BE_IN:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 129;
				this.must_be_in();
				}
				break;
			case NusModsParser.MUST_NOT_BE_IN:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 130;
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
			this.state = 133;
			this.match(NusModsParser.COHORT_YEARS);
			this.state = 138;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case NusModsParser.IF_IN:
				{
				this.state = 134;
				this.match(NusModsParser.IF_IN);
				}
				break;
			case NusModsParser.IF_NOT_IN:
				{
				this.state = 135;
				this.match(NusModsParser.IF_NOT_IN);
				}
				break;
			case NusModsParser.MUST_BE_IN:
				{
				this.state = 136;
				this.must_be_in();
				}
				break;
			case NusModsParser.MUST_NOT_BE_IN:
				{
				this.state = 137;
				this.must_not_be_in();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 140;
			this.match(NusModsParser.YEARS);
			this.state = 142;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.YEARS) {
				{
				this.state = 141;
				this.match(NusModsParser.YEARS);
				}
			}

			this.state = 146;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.THEN) {
				{
				this.state = 144;
				this.match(NusModsParser.THEN);
				this.state = 145;
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
			this.state = 148;
			this.match(NusModsParser.SUBJECT_YEARS);
			this.state = 149;
			this.match(NusModsParser.IF_IN);
			this.state = 150;
			this.match(NusModsParser.YEARS);
			this.state = 152;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.YEARS) {
				{
				this.state = 151;
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
			this.state = 154;
			this.match(NusModsParser.SPECIAL);
			this.state = 155;
			this.special_condition();
			this.state = 156;
			this.match(NusModsParser.QUOTE);
			this.state = 157;
			this.match(NusModsParser.SPECIAL_VALUE);
			this.state = 158;
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
			this.state = 164;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case NusModsParser.IF_IN:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 160;
				this.match(NusModsParser.IF_IN);
				}
				break;
			case NusModsParser.IF_NOT_IN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 161;
				this.match(NusModsParser.IF_NOT_IN);
				}
				break;
			case NusModsParser.MUST_BE_IN:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 162;
				this.must_be_in();
				}
				break;
			case NusModsParser.MUST_NOT_BE_IN:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 163;
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
			this.state = 177;
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
				this.state = 167;
				this.courses();
				}
				break;
			case NusModsParser.SUBJECTS:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 168;
				this.match(NusModsParser.SUBJECTS);
				this.state = 170;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === NusModsParser.LPAREN) {
					{
					this.state = 169;
					this.contains_number();
					}
				}

				this.state = 172;
				this.programs_values();
				}
				break;
			case NusModsParser.UNITS:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 173;
				this.match(NusModsParser.UNITS);
				this.state = 174;
				this.contains_number();
				}
				break;
			case NusModsParser.GPA:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 175;
				this.match(NusModsParser.GPA);
				this.state = 176;
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
			this.state = 187;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 18, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				// tslint:disable-next-line:no-empty
				{
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 180;
				this.match(NusModsParser.COREQUISITE);
				this.state = 181;
				this.match(NusModsParser.LPAREN);
				this.state = 182;
				this.courses();
				this.state = 183;
				this.match(NusModsParser.RPAREN);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 185;
				this.match(NusModsParser.COREQUISITE);
				this.state = 186;
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
			this.state = 189;
			this.match(NusModsParser.COURSES);
			this.state = 191;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.LPAREN) {
				{
				this.state = 190;
				this.contains_number();
				}
			}

			this.state = 193;
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
			this.state = 195;
			this.match(NusModsParser.PROGRAMS_VALUE);
			this.state = 200;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === NusModsParser.COMMA) {
				{
				{
				this.state = 196;
				this.match(NusModsParser.COMMA);
				this.state = 197;
				this.match(NusModsParser.PROGRAMS_VALUE);
				}
				}
				this.state = 202;
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
			this.state = 203;
			this.match(NusModsParser.MUST_BE_IN);
			this.state = 205;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === NusModsParser.LPAREN) {
				{
				this.state = 204;
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
			this.state = 207;
			this.match(NusModsParser.MUST_NOT_BE_IN);
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
	public contains_number(): Contains_numberContext {
		let _localctx: Contains_numberContext = new Contains_numberContext(this._ctx, this.state);
		this.enterRule(_localctx, 44, NusModsParser.RULE_contains_number);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 211;
			this.match(NusModsParser.LPAREN);
			this.state = 212;
			this.match(NusModsParser.NUMBER);
			this.state = 213;
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
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x1E\xDA\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x03\x02\x03\x02\x03\x02\x03\x02\x03\x02\x03\x02\x03\x02\x03" +
		"\x02\x03\x02\x05\x02:\n\x02\x03\x03\x03\x03\x03\x03\x05\x03?\n\x03\x03" +
		"\x03\x03\x03\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x05" +
		"\x04J\n\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x05\x05Q\n\x05\x03" +
		"\x06\x03\x06\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x05\x07Z\n\x07\x03" +
		"\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x05\bd\n\b\x03\t\x03\t\x03" +
		"\t\x03\t\x03\t\x05\tk\n\t\x03\n\x03\n\x03\n\x03\n\x05\nq\n\n\x03\v\x03" +
		"\v\x03\v\x07\vv\n\v\f\v\x0E\vy\v\v\x03\f\x03\f\x03\f\x03\f\x03\f\x05\f" +
		"\x80\n\f\x03\r\x03\r\x03\r\x03\r\x05\r\x86\n\r\x03\x0E\x03\x0E\x03\x0E" +
		"\x03\x0E\x03\x0E\x05\x0E\x8D\n\x0E\x03\x0E\x03\x0E\x05\x0E\x91\n\x0E\x03" +
		"\x0E\x03\x0E\x05\x0E\x95\n\x0E\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x05\x0F" +
		"\x9B\n\x0F\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x11\x03" +
		"\x11\x03\x11\x03\x11\x05\x11\xA7\n\x11\x03\x12\x03\x12\x03\x12\x03\x12" +
		"\x05\x12\xAD\n\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x05\x12\xB4" +
		"\n\x12\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x05\x13\xBE\n\x13\x03\x14\x03\x14\x05\x14\xC2\n\x14\x03\x14\x03\x14\x03" +
		"\x15\x03\x15\x03\x15\x07\x15\xC9\n\x15\f\x15\x0E\x15\xCC\v\x15\x03\x16" +
		"\x03\x16\x05\x16\xD0\n\x16\x03\x17\x03\x17\x05\x17\xD4\n\x17\x03\x18\x03" +
		"\x18\x03\x18\x03\x18\x03\x18\x02\x02\x02\x19\x02\x02\x04\x02\x06\x02\b" +
		"\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02" +
		"\x1C\x02\x1E\x02 \x02\"\x02$\x02&\x02(\x02*\x02,\x02.\x02\x02\x03\x03" +
		"\x02\v\f\x02\xEE\x029\x03\x02\x02\x02\x04;\x03\x02\x02\x02\x06I\x03\x02" +
		"\x02\x02\bP\x03\x02\x02\x02\nR\x03\x02\x02\x02\fY\x03\x02\x02\x02\x0E" +
		"c\x03\x02\x02\x02\x10e\x03\x02\x02\x02\x12p\x03\x02\x02\x02\x14r\x03\x02" +
		"\x02\x02\x16z\x03\x02\x02\x02\x18\x85\x03\x02\x02\x02\x1A\x87\x03\x02" +
		"\x02\x02\x1C\x96\x03\x02\x02\x02\x1E\x9C\x03\x02\x02\x02 \xA6\x03\x02" +
		"\x02\x02\"\xB3\x03\x02\x02\x02$\xBD\x03\x02\x02\x02&\xBF\x03\x02\x02\x02" +
		"(\xC5\x03\x02\x02\x02*\xCD\x03\x02\x02\x02,\xD1\x03\x02\x02\x02.\xD5\x03" +
		"\x02\x02\x020:\x03\x02\x02\x0212\x05\x04\x03\x0223\x07\n\x02\x0234\x05" +
		"\x06\x04\x0245\x07\x02\x02\x035:\x03\x02\x02\x0267\x05\x06\x04\x0278\x07" +
		"\x02\x02\x038:\x03\x02\x02\x0290\x03\x02\x02\x0291\x03\x02\x02\x0296\x03" +
		"\x02\x02\x02:\x03\x03\x02\x02\x02;>\x07\r\x02\x02<?\x07\x06\x02\x02=?" +
		"\x05*\x16\x02><\x03\x02\x02\x02>=\x03\x02\x02\x02?@\x03\x02\x02\x02@A" +
		"\x07\x0E\x02\x02A\x05\x03\x02\x02\x02BJ\x03\x02\x02\x02CD\x07\x04\x02" +
		"\x02DE\x05\x06\x04\x02EF\x07\x05\x02\x02FJ\x03\x02\x02\x02GJ\x05\b\x05" +
		"\x02HJ\x05\f\x07\x02IB\x03\x02\x02\x02IC\x03\x02\x02\x02IG\x03\x02\x02" +
		"\x02IH\x03\x02\x02\x02J\x07\x03\x02\x02\x02KQ\x03\x02\x02\x02LM\x05\f" +
		"\x07\x02MN\x05\n\x06\x02NO\x05\x06\x04\x02OQ\x03\x02\x02\x02PK\x03\x02" +
		"\x02\x02PL\x03\x02\x02\x02Q\t\x03\x02\x02\x02RS\t\x02\x02\x02S\v\x03\x02" +
		"\x02\x02TU\x07\x04\x02\x02UV\x05\x06\x04\x02VW\x07\x05\x02\x02WZ\x03\x02" +
		"\x02\x02XZ\x05\x0E\b\x02YT\x03\x02\x02\x02YX\x03\x02\x02\x02Z\r\x03\x02" +
		"\x02\x02[d\x03\x02\x02\x02\\d\x05\x10\t\x02]d\x05\x16\f\x02^d\x05\x1A" +
		"\x0E\x02_d\x05\x1C\x0F\x02`d\x05\x1E\x10\x02ad\x05\"\x12\x02bd\x05$\x13" +
		"\x02c[\x03\x02\x02\x02c\\\x03\x02\x02\x02c]\x03\x02\x02\x02c^\x03\x02" +
		"\x02\x02c_\x03\x02\x02\x02c`\x03\x02\x02\x02ca\x03\x02\x02\x02cb\x03\x02" +
		"\x02\x02d\x0F\x03\x02\x02\x02ef\x07\x0F\x02\x02fg\x05\x12\n\x02gj\x05" +
		"\x14\v\x02hi\x07\n\x02\x02ik\x05\x06\x04\x02jh\x03\x02\x02\x02jk\x03\x02" +
		"\x02\x02k\x11\x03\x02\x02\x02lq\x07\x06\x02\x02mq\x07\b\x02\x02nq\x05" +
		"*\x16\x02oq\x05,\x17\x02pl\x03\x02\x02\x02pm\x03\x02\x02\x02pn\x03\x02" +
		"\x02\x02po\x03\x02\x02\x02q\x13\x03\x02\x02\x02rw\x07\x1D\x02\x02st\x07" +
		"\x03\x02\x02tv\x07\x1D\x02\x02us\x03\x02\x02\x02vy\x03\x02\x02\x02wu\x03" +
		"\x02\x02\x02wx\x03\x02\x02\x02x\x15\x03\x02\x02\x02yw\x03\x02\x02\x02" +
		"z{\x07\x10\x02\x02{|\x05\x18\r\x02|\x7F\x05\x14\v\x02}~\x07\n\x02\x02" +
		"~\x80\x05\x06\x04\x02\x7F}\x03\x02\x02\x02\x7F\x80\x03\x02\x02\x02\x80" +
		"\x17\x03\x02\x02\x02\x81\x86\x07\x06\x02\x02\x82\x86\x07\b\x02\x02\x83" +
		"\x86\x05*\x16\x02\x84\x86\x05,\x17\x02\x85\x81\x03\x02\x02\x02\x85\x82" +
		"\x03\x02\x02\x02\x85\x83\x03\x02\x02\x02\x85\x84\x03\x02\x02\x02\x86\x19" +
		"\x03\x02\x02\x02\x87\x8C\x07\x11\x02\x02\x88\x8D\x07\x06\x02\x02\x89\x8D" +
		"\x07\b\x02\x02\x8A\x8D\x05*\x16\x02\x8B\x8D\x05,\x17\x02\x8C\x88\x03\x02" +
		"\x02\x02\x8C\x89\x03\x02\x02\x02\x8C\x8A\x03\x02\x02\x02\x8C\x8B\x03\x02" +
		"\x02\x02\x8D\x8E\x03\x02\x02\x02\x8E\x90\x07\x1C\x02\x02\x8F\x91\x07\x1C" +
		"\x02\x02\x90\x8F\x03\x02\x02\x02\x90\x91\x03\x02\x02\x02\x91\x94\x03\x02" +
		"\x02\x02\x92\x93\x07\n\x02\x02\x93\x95\x05\x06\x04\x02\x94\x92\x03\x02" +
		"\x02\x02\x94\x95\x03\x02\x02\x02\x95\x1B\x03\x02\x02\x02\x96\x97\x07\x12" +
		"\x02\x02\x97\x98\x07\x06\x02\x02\x98\x9A\x07\x1C\x02\x02\x99\x9B\x07\x1C" +
		"\x02\x02\x9A\x99\x03\x02\x02\x02\x9A\x9B\x03\x02\x02\x02\x9B\x1D\x03\x02" +
		"\x02\x02\x9C\x9D\x07\x13\x02\x02\x9D\x9E\x05 \x11\x02\x9E\x9F\x07\x1A" +
		"\x02\x02\x9F\xA0\x07\x14\x02\x02\xA0\xA1\x07\x1A\x02\x02\xA1\x1F\x03\x02" +
		"\x02\x02\xA2\xA7\x07\x06\x02\x02\xA3\xA7\x07\b\x02\x02\xA4\xA7\x05*\x16" +
		"\x02\xA5\xA7\x05,\x17\x02\xA6\xA2\x03\x02\x02\x02\xA6\xA3\x03\x02\x02" +
		"\x02\xA6\xA4\x03\x02\x02\x02\xA6\xA5\x03\x02\x02\x02\xA7!\x03\x02\x02" +
		"\x02\xA8\xB4\x03\x02\x02\x02\xA9\xB4\x05&\x14\x02\xAA\xAC\x07\x16\x02" +
		"\x02\xAB\xAD\x05.\x18\x02\xAC\xAB\x03\x02\x02\x02\xAC\xAD\x03\x02\x02" +
		"\x02\xAD\xAE\x03\x02\x02\x02\xAE\xB4\x05\x14\v\x02\xAF\xB0\x07\x17\x02" +
		"\x02\xB0\xB4\x05.\x18\x02\xB1\xB2\x07\x18\x02\x02\xB2\xB4\x05.\x18\x02" +
		"\xB3\xA8\x03\x02\x02\x02\xB3\xA9\x03\x02\x02\x02\xB3\xAA\x03\x02\x02\x02" +
		"\xB3\xAF\x03\x02\x02\x02\xB3\xB1\x03\x02\x02\x02\xB4#\x03\x02\x02\x02" +
		"\xB5\xBE\x03\x02\x02\x02\xB6\xB7\x07\x19\x02\x02\xB7\xB8\x07\x04\x02\x02" +
		"\xB8\xB9\x05&\x14\x02\xB9\xBA\x07\x05\x02\x02\xBA\xBE\x03\x02\x02\x02" +
		"\xBB\xBC\x07\x19\x02\x02\xBC\xBE\x05&\x14\x02\xBD\xB5\x03\x02\x02\x02" +
		"\xBD\xB6\x03\x02\x02\x02\xBD\xBB\x03\x02\x02\x02\xBE%\x03\x02\x02\x02" +
		"\xBF\xC1\x07\x15\x02\x02\xC0\xC2\x05.\x18\x02\xC1\xC0\x03\x02\x02\x02" +
		"\xC1\xC2\x03\x02\x02\x02\xC2\xC3\x03\x02\x02\x02\xC3\xC4\x05(\x15\x02" +
		"\xC4\'\x03\x02\x02\x02\xC5\xCA\x07\x1D\x02\x02\xC6\xC7\x07\x03\x02\x02" +
		"\xC7\xC9\x07\x1D\x02\x02\xC8\xC6\x03\x02\x02\x02\xC9\xCC\x03\x02\x02\x02" +
		"\xCA\xC8\x03\x02\x02\x02\xCA\xCB\x03\x02\x02\x02\xCB)\x03\x02\x02\x02" +
		"\xCC\xCA\x03\x02\x02\x02\xCD\xCF\x07\x07\x02\x02\xCE\xD0\x05.\x18\x02" +
		"\xCF\xCE\x03\x02\x02\x02\xCF\xD0\x03\x02\x02\x02\xD0+\x03\x02\x02\x02" +
		"\xD1\xD3\x07\t\x02\x02\xD2\xD4\x05.\x18\x02\xD3\xD2\x03\x02\x02\x02\xD3" +
		"\xD4\x03\x02\x02\x02\xD4-\x03\x02\x02\x02\xD5\xD6\x07\x04\x02\x02\xD6" +
		"\xD7\x07\x1B\x02\x02\xD7\xD8\x07\x05\x02\x02\xD8/\x03\x02\x02\x02\x19" +
		"9>IPYcjpw\x7F\x85\x8C\x90\x94\x9A\xA6\xAC\xB3\xBD\xC1\xCA\xCF\xD3";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!NusModsParser.__ATN) {
			NusModsParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(NusModsParser._serializedATN));
		}

		return NusModsParser.__ATN;
	}

}

export class OverallContext extends ParserRuleContext {
	public program_types(): Program_typesContext | undefined {
		return this.tryGetRuleContext(0, Program_typesContext);
	}
	public THEN(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.THEN, 0); }
	public compound(): CompoundContext | undefined {
		return this.tryGetRuleContext(0, CompoundContext);
	}
	public EOF(): TerminalNode | undefined { return this.tryGetToken(NusModsParser.EOF, 0); }
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


