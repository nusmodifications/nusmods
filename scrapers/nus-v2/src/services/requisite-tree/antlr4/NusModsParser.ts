// Generated from src/services/requisite-tree/antlr4/NusMods.g4 by ANTLR 4.9.0-SNAPSHOT

import { ATN } from 'antlr4ts/atn/ATN';
import { ATNDeserializer } from 'antlr4ts/atn/ATNDeserializer';
import { FailedPredicateException } from 'antlr4ts/FailedPredicateException';
import { NotNull } from 'antlr4ts/Decorators';
import { NoViableAltException } from 'antlr4ts/NoViableAltException';
import { Override } from 'antlr4ts/Decorators';
import { Parser } from 'antlr4ts/Parser';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { ParserATNSimulator } from 'antlr4ts/atn/ParserATNSimulator';
import { ParseTreeListener } from 'antlr4ts/tree/ParseTreeListener';
import { ParseTreeVisitor } from 'antlr4ts/tree/ParseTreeVisitor';
import { RecognitionException } from 'antlr4ts/RecognitionException';
import { RuleContext } from 'antlr4ts/RuleContext';
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { Token } from 'antlr4ts/Token';
import { TokenStream } from 'antlr4ts/TokenStream';
import { Vocabulary } from 'antlr4ts/Vocabulary';
import { VocabularyImpl } from 'antlr4ts/VocabularyImpl';

import * as Utils from 'antlr4ts/misc/Utils';

import { NusModsVisitor } from './NusModsVisitor';

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
  public static readonly RULE_program_types_conditional = 3;
  public static readonly RULE_program_types_gate = 4;
  public static readonly RULE_cohort_conditional = 5;
  public static readonly RULE_subject_years_conditional = 6;
  public static readonly RULE_binop = 7;
  public static readonly RULE_boolean_expr = 8;
  public static readonly RULE_op = 9;
  public static readonly RULE_primitive = 10;
  public static readonly RULE_programs = 11;
  public static readonly RULE_programs_condition = 12;
  public static readonly RULE_programs_values = 13;
  public static readonly RULE_plan_types = 14;
  public static readonly RULE_plan_types_condition = 15;
  public static readonly RULE_cohort_years = 16;
  public static readonly RULE_subject_years = 17;
  public static readonly RULE_special = 18;
  public static readonly RULE_special_condition = 19;
  public static readonly RULE_prereq = 20;
  public static readonly RULE_coreq = 21;
  public static readonly RULE_courses = 22;
  public static readonly RULE_course_items = 23;
  public static readonly RULE_must_be_in = 24;
  public static readonly RULE_must_not_be_in = 25;
  public static readonly RULE_if_in = 26;
  public static readonly RULE_if_not_in = 27;
  public static readonly RULE_contains_number = 28;
  // tslint:disable:no-trailing-whitespace
  public static readonly ruleNames: string[] = [
    'overall',
    'program_types',
    'compound',
    'program_types_conditional',
    'program_types_gate',
    'cohort_conditional',
    'subject_years_conditional',
    'binop',
    'boolean_expr',
    'op',
    'primitive',
    'programs',
    'programs_condition',
    'programs_values',
    'plan_types',
    'plan_types_condition',
    'cohort_years',
    'subject_years',
    'special',
    'special_condition',
    'prereq',
    'coreq',
    'courses',
    'course_items',
    'must_be_in',
    'must_not_be_in',
    'if_in',
    'if_not_in',
    'contains_number',
  ];

  private static readonly _LITERAL_NAMES: Array<string | undefined> = [
    undefined,
    "','",
    "'('",
    "')'",
    "'IF_IN'",
    "'MUST_BE_IN'",
    "'IF_NOT_IN'",
    "'MUST_NOT_BE_IN'",
    "'THEN'",
    "'AND'",
    "'OR'",
    undefined,
    undefined,
    undefined,
    undefined,
    "'COHORT_YEARS'",
    "'SUBJECT_YEARS'",
    "'SPECIAL'",
    undefined,
    undefined,
    "'SUBJECTS'",
    "'UNITS'",
    undefined,
    "'COREQUISITE'",
    "'\"'",
  ];
  private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
    undefined,
    'COMMA',
    'LPAREN',
    'RPAREN',
    'IF_IN',
    'MUST_BE_IN',
    'IF_NOT_IN',
    'MUST_NOT_BE_IN',
    'THEN',
    'AND',
    'OR',
    'PROGRAM_TYPES',
    'PROGRAM_TYPES_VALUE',
    'PROGRAMS',
    'PLAN_TYPES',
    'COHORT_YEARS',
    'SUBJECT_YEARS',
    'SPECIAL',
    'SPECIAL_VALUE',
    'COURSES',
    'SUBJECTS',
    'UNITS',
    'GPA',
    'COREQUISITE',
    'QUOTE',
    'NUMBER',
    'YEARS',
    'PROGRAMS_VALUE',
    'WS',
  ];
  public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(
    NusModsParser._LITERAL_NAMES,
    NusModsParser._SYMBOLIC_NAMES,
    [],
  );

  // @Override
  // @NotNull
  public get vocabulary(): Vocabulary {
    return NusModsParser.VOCABULARY;
  }
  // tslint:enable:no-trailing-whitespace

  // @Override
  public get grammarFileName(): string {
    return 'NusMods.g4';
  }

  // @Override
  public get ruleNames(): string[] {
    return NusModsParser.ruleNames;
  }

  // @Override
  public get serializedATN(): string {
    return NusModsParser._serializedATN;
  }

  protected createFailedPredicateException(
    predicate?: string,
    message?: string,
  ): FailedPredicateException {
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
      this.state = 62;
      this._errHandler.sync(this);
      switch (this.interpreter.adaptivePredict(this._input, 0, this._ctx)) {
        case 1:
          this.enterOuterAlt(_localctx, 1);
          // tslint:disable-next-line:no-empty
          {
          }
          break;

        case 2:
          this.enterOuterAlt(_localctx, 2);
          {
            this.state = 59;
            this.compound();
            this.state = 60;
            this.match(NusModsParser.EOF);
          }
          break;
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public program_types(): Program_typesContext {
    let _localctx: Program_typesContext = new Program_typesContext(this._ctx, this.state);
    this.enterRule(_localctx, 2, NusModsParser.RULE_program_types);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 64;
        this.match(NusModsParser.PROGRAM_TYPES);
        this.state = 67;
        this._errHandler.sync(this);
        switch (this._input.LA(1)) {
          case NusModsParser.IF_IN:
            {
              this.state = 65;
              this.if_in();
            }
            break;
          case NusModsParser.MUST_BE_IN:
            {
              this.state = 66;
              this.must_be_in();
            }
            break;
          default:
            throw new NoViableAltException(this);
        }
        this.state = 69;
        this.match(NusModsParser.PROGRAM_TYPES_VALUE);
        this.state = 74;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === NusModsParser.COMMA) {
          {
            {
              this.state = 70;
              this.match(NusModsParser.COMMA);
              this.state = 71;
              this.match(NusModsParser.PROGRAM_TYPES_VALUE);
            }
          }
          this.state = 76;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public compound(): CompoundContext {
    let _localctx: CompoundContext = new CompoundContext(this._ctx, this.state);
    this.enterRule(_localctx, 4, NusModsParser.RULE_compound);
    try {
      this.state = 87;
      this._errHandler.sync(this);
      switch (this.interpreter.adaptivePredict(this._input, 3, this._ctx)) {
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
            this.match(NusModsParser.LPAREN);
            this.state = 79;
            this.compound();
            this.state = 80;
            this.match(NusModsParser.RPAREN);
          }
          break;

        case 3:
          this.enterOuterAlt(_localctx, 3);
          {
            this.state = 82;
            this.program_types_conditional();
          }
          break;

        case 4:
          this.enterOuterAlt(_localctx, 4);
          {
            this.state = 83;
            this.cohort_conditional();
          }
          break;

        case 5:
          this.enterOuterAlt(_localctx, 5);
          {
            this.state = 84;
            this.subject_years_conditional();
          }
          break;

        case 6:
          this.enterOuterAlt(_localctx, 6);
          {
            this.state = 85;
            this.binop();
          }
          break;

        case 7:
          this.enterOuterAlt(_localctx, 7);
          {
            this.state = 86;
            this.op();
          }
          break;
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public program_types_conditional(): Program_types_conditionalContext {
    let _localctx: Program_types_conditionalContext = new Program_types_conditionalContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 6, NusModsParser.RULE_program_types_conditional);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 89;
        this.program_types_gate();
        this.state = 90;
        this.match(NusModsParser.THEN);
        this.state = 91;
        this.compound();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public program_types_gate(): Program_types_gateContext {
    let _localctx: Program_types_gateContext = new Program_types_gateContext(this._ctx, this.state);
    this.enterRule(_localctx, 8, NusModsParser.RULE_program_types_gate);
    let _la: number;
    try {
      this.state = 105;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case NusModsParser.LPAREN:
          this.enterOuterAlt(_localctx, 1);
          {
            this.state = 93;
            this.match(NusModsParser.LPAREN);
            this.state = 94;
            this.program_types_gate();
            this.state = 95;
            this.match(NusModsParser.RPAREN);
          }
          break;
        case NusModsParser.PROGRAM_TYPES:
          this.enterOuterAlt(_localctx, 2);
          {
            this.state = 97;
            this.program_types();
            this.state = 102;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while (_la === NusModsParser.OR) {
              {
                {
                  this.state = 98;
                  this.match(NusModsParser.OR);
                  this.state = 99;
                  this.program_types();
                }
              }
              this.state = 104;
              this._errHandler.sync(this);
              _la = this._input.LA(1);
            }
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public cohort_conditional(): Cohort_conditionalContext {
    let _localctx: Cohort_conditionalContext = new Cohort_conditionalContext(this._ctx, this.state);
    this.enterRule(_localctx, 10, NusModsParser.RULE_cohort_conditional);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 107;
        this.cohort_years();
        this.state = 108;
        this.match(NusModsParser.THEN);
        this.state = 109;
        this.compound();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public subject_years_conditional(): Subject_years_conditionalContext {
    let _localctx: Subject_years_conditionalContext = new Subject_years_conditionalContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 12, NusModsParser.RULE_subject_years_conditional);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 111;
        this.subject_years();
        this.state = 112;
        this.match(NusModsParser.THEN);
        this.state = 113;
        this.compound();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public binop(): BinopContext {
    let _localctx: BinopContext = new BinopContext(this._ctx, this.state);
    this.enterRule(_localctx, 14, NusModsParser.RULE_binop);
    try {
      this.state = 120;
      this._errHandler.sync(this);
      switch (this.interpreter.adaptivePredict(this._input, 6, this._ctx)) {
        case 1:
          this.enterOuterAlt(_localctx, 1);
          // tslint:disable-next-line:no-empty
          {
          }
          break;

        case 2:
          this.enterOuterAlt(_localctx, 2);
          {
            this.state = 116;
            this.op();
            this.state = 117;
            this.boolean_expr();
            this.state = 118;
            this.compound();
          }
          break;
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public boolean_expr(): Boolean_exprContext {
    let _localctx: Boolean_exprContext = new Boolean_exprContext(this._ctx, this.state);
    this.enterRule(_localctx, 16, NusModsParser.RULE_boolean_expr);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 122;
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
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public op(): OpContext {
    let _localctx: OpContext = new OpContext(this._ctx, this.state);
    this.enterRule(_localctx, 18, NusModsParser.RULE_op);
    try {
      this.state = 129;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case NusModsParser.LPAREN:
          this.enterOuterAlt(_localctx, 1);
          {
            this.state = 124;
            this.match(NusModsParser.LPAREN);
            this.state = 125;
            this.compound();
            this.state = 126;
            this.match(NusModsParser.RPAREN);
          }
          break;
        case NusModsParser.EOF:
        case NusModsParser.RPAREN:
        case NusModsParser.AND:
        case NusModsParser.OR:
        case NusModsParser.PROGRAM_TYPES:
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
            this.state = 128;
            this.primitive();
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public primitive(): PrimitiveContext {
    let _localctx: PrimitiveContext = new PrimitiveContext(this._ctx, this.state);
    this.enterRule(_localctx, 20, NusModsParser.RULE_primitive);
    try {
      this.state = 140;
      this._errHandler.sync(this);
      switch (this.interpreter.adaptivePredict(this._input, 8, this._ctx)) {
        case 1:
          this.enterOuterAlt(_localctx, 1);
          // tslint:disable-next-line:no-empty
          {
          }
          break;

        case 2:
          this.enterOuterAlt(_localctx, 2);
          {
            this.state = 132;
            this.program_types();
          }
          break;

        case 3:
          this.enterOuterAlt(_localctx, 3);
          {
            this.state = 133;
            this.programs();
          }
          break;

        case 4:
          this.enterOuterAlt(_localctx, 4);
          {
            this.state = 134;
            this.plan_types();
          }
          break;

        case 5:
          this.enterOuterAlt(_localctx, 5);
          {
            this.state = 135;
            this.cohort_years();
          }
          break;

        case 6:
          this.enterOuterAlt(_localctx, 6);
          {
            this.state = 136;
            this.subject_years();
          }
          break;

        case 7:
          this.enterOuterAlt(_localctx, 7);
          {
            this.state = 137;
            this.special();
          }
          break;

        case 8:
          this.enterOuterAlt(_localctx, 8);
          {
            this.state = 138;
            this.prereq();
          }
          break;

        case 9:
          this.enterOuterAlt(_localctx, 9);
          {
            this.state = 139;
            this.coreq();
          }
          break;
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public programs(): ProgramsContext {
    let _localctx: ProgramsContext = new ProgramsContext(this._ctx, this.state);
    this.enterRule(_localctx, 22, NusModsParser.RULE_programs);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 142;
        this.match(NusModsParser.PROGRAMS);
        this.state = 143;
        this.programs_condition();
        this.state = 144;
        this.programs_values();
        this.state = 147;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === NusModsParser.THEN) {
          {
            this.state = 145;
            this.match(NusModsParser.THEN);
            this.state = 146;
            this.compound();
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public programs_condition(): Programs_conditionContext {
    let _localctx: Programs_conditionContext = new Programs_conditionContext(this._ctx, this.state);
    this.enterRule(_localctx, 24, NusModsParser.RULE_programs_condition);
    try {
      this.state = 153;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case NusModsParser.IF_IN:
          this.enterOuterAlt(_localctx, 1);
          {
            this.state = 149;
            this.if_in();
          }
          break;
        case NusModsParser.IF_NOT_IN:
          this.enterOuterAlt(_localctx, 2);
          {
            this.state = 150;
            this.if_not_in();
          }
          break;
        case NusModsParser.MUST_BE_IN:
          this.enterOuterAlt(_localctx, 3);
          {
            this.state = 151;
            this.must_be_in();
          }
          break;
        case NusModsParser.MUST_NOT_BE_IN:
          this.enterOuterAlt(_localctx, 4);
          {
            this.state = 152;
            this.must_not_be_in();
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public programs_values(): Programs_valuesContext {
    let _localctx: Programs_valuesContext = new Programs_valuesContext(this._ctx, this.state);
    this.enterRule(_localctx, 26, NusModsParser.RULE_programs_values);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 155;
        this.match(NusModsParser.PROGRAMS_VALUE);
        this.state = 160;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === NusModsParser.COMMA) {
          {
            {
              this.state = 156;
              this.match(NusModsParser.COMMA);
              this.state = 157;
              this.match(NusModsParser.PROGRAMS_VALUE);
            }
          }
          this.state = 162;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public plan_types(): Plan_typesContext {
    let _localctx: Plan_typesContext = new Plan_typesContext(this._ctx, this.state);
    this.enterRule(_localctx, 28, NusModsParser.RULE_plan_types);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 163;
        this.match(NusModsParser.PLAN_TYPES);
        this.state = 164;
        this.plan_types_condition();
        this.state = 165;
        this.programs_values();
        this.state = 168;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === NusModsParser.THEN) {
          {
            this.state = 166;
            this.match(NusModsParser.THEN);
            this.state = 167;
            this.compound();
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public plan_types_condition(): Plan_types_conditionContext {
    let _localctx: Plan_types_conditionContext = new Plan_types_conditionContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 30, NusModsParser.RULE_plan_types_condition);
    try {
      this.state = 174;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case NusModsParser.IF_IN:
          this.enterOuterAlt(_localctx, 1);
          {
            this.state = 170;
            this.if_in();
          }
          break;
        case NusModsParser.IF_NOT_IN:
          this.enterOuterAlt(_localctx, 2);
          {
            this.state = 171;
            this.if_not_in();
          }
          break;
        case NusModsParser.MUST_BE_IN:
          this.enterOuterAlt(_localctx, 3);
          {
            this.state = 172;
            this.must_be_in();
          }
          break;
        case NusModsParser.MUST_NOT_BE_IN:
          this.enterOuterAlt(_localctx, 4);
          {
            this.state = 173;
            this.must_not_be_in();
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public cohort_years(): Cohort_yearsContext {
    let _localctx: Cohort_yearsContext = new Cohort_yearsContext(this._ctx, this.state);
    this.enterRule(_localctx, 32, NusModsParser.RULE_cohort_years);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 176;
        this.match(NusModsParser.COHORT_YEARS);
        this.state = 181;
        this._errHandler.sync(this);
        switch (this._input.LA(1)) {
          case NusModsParser.IF_IN:
            {
              this.state = 177;
              this.if_in();
            }
            break;
          case NusModsParser.IF_NOT_IN:
            {
              this.state = 178;
              this.if_not_in();
            }
            break;
          case NusModsParser.MUST_BE_IN:
            {
              this.state = 179;
              this.must_be_in();
            }
            break;
          case NusModsParser.MUST_NOT_BE_IN:
            {
              this.state = 180;
              this.must_not_be_in();
            }
            break;
          default:
            throw new NoViableAltException(this);
        }
        this.state = 183;
        this.match(NusModsParser.YEARS);
        this.state = 185;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === NusModsParser.YEARS) {
          {
            this.state = 184;
            this.match(NusModsParser.YEARS);
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public subject_years(): Subject_yearsContext {
    let _localctx: Subject_yearsContext = new Subject_yearsContext(this._ctx, this.state);
    this.enterRule(_localctx, 34, NusModsParser.RULE_subject_years);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 187;
        this.match(NusModsParser.SUBJECT_YEARS);
        this.state = 188;
        this.if_in();
        this.state = 189;
        this.match(NusModsParser.YEARS);
        this.state = 191;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === NusModsParser.YEARS) {
          {
            this.state = 190;
            this.match(NusModsParser.YEARS);
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public special(): SpecialContext {
    let _localctx: SpecialContext = new SpecialContext(this._ctx, this.state);
    this.enterRule(_localctx, 36, NusModsParser.RULE_special);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 193;
        this.match(NusModsParser.SPECIAL);
        this.state = 194;
        this.special_condition();
        this.state = 195;
        this.match(NusModsParser.QUOTE);
        this.state = 196;
        this.match(NusModsParser.SPECIAL_VALUE);
        this.state = 197;
        this.match(NusModsParser.QUOTE);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public special_condition(): Special_conditionContext {
    let _localctx: Special_conditionContext = new Special_conditionContext(this._ctx, this.state);
    this.enterRule(_localctx, 38, NusModsParser.RULE_special_condition);
    try {
      this.state = 203;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case NusModsParser.IF_IN:
          this.enterOuterAlt(_localctx, 1);
          {
            this.state = 199;
            this.if_in();
          }
          break;
        case NusModsParser.IF_NOT_IN:
          this.enterOuterAlt(_localctx, 2);
          {
            this.state = 200;
            this.if_not_in();
          }
          break;
        case NusModsParser.MUST_BE_IN:
          this.enterOuterAlt(_localctx, 3);
          {
            this.state = 201;
            this.must_be_in();
          }
          break;
        case NusModsParser.MUST_NOT_BE_IN:
          this.enterOuterAlt(_localctx, 4);
          {
            this.state = 202;
            this.must_not_be_in();
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public prereq(): PrereqContext {
    let _localctx: PrereqContext = new PrereqContext(this._ctx, this.state);
    this.enterRule(_localctx, 40, NusModsParser.RULE_prereq);
    let _la: number;
    try {
      this.state = 216;
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
            this.state = 206;
            this.courses();
          }
          break;
        case NusModsParser.SUBJECTS:
          this.enterOuterAlt(_localctx, 3);
          {
            this.state = 207;
            this.match(NusModsParser.SUBJECTS);
            this.state = 209;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if (_la === NusModsParser.LPAREN) {
              {
                this.state = 208;
                this.contains_number();
              }
            }

            this.state = 211;
            this.programs_values();
          }
          break;
        case NusModsParser.UNITS:
          this.enterOuterAlt(_localctx, 4);
          {
            this.state = 212;
            this.match(NusModsParser.UNITS);
            this.state = 213;
            this.contains_number();
          }
          break;
        case NusModsParser.GPA:
          this.enterOuterAlt(_localctx, 5);
          {
            this.state = 214;
            this.match(NusModsParser.GPA);
            this.state = 215;
            this.contains_number();
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public coreq(): CoreqContext {
    let _localctx: CoreqContext = new CoreqContext(this._ctx, this.state);
    this.enterRule(_localctx, 42, NusModsParser.RULE_coreq);
    try {
      this.state = 226;
      this._errHandler.sync(this);
      switch (this.interpreter.adaptivePredict(this._input, 20, this._ctx)) {
        case 1:
          this.enterOuterAlt(_localctx, 1);
          // tslint:disable-next-line:no-empty
          {
          }
          break;

        case 2:
          this.enterOuterAlt(_localctx, 2);
          {
            this.state = 219;
            this.match(NusModsParser.COREQUISITE);
            this.state = 220;
            this.match(NusModsParser.LPAREN);
            this.state = 221;
            this.courses();
            this.state = 222;
            this.match(NusModsParser.RPAREN);
          }
          break;

        case 3:
          this.enterOuterAlt(_localctx, 3);
          {
            this.state = 224;
            this.match(NusModsParser.COREQUISITE);
            this.state = 225;
            this.courses();
          }
          break;
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public courses(): CoursesContext {
    let _localctx: CoursesContext = new CoursesContext(this._ctx, this.state);
    this.enterRule(_localctx, 44, NusModsParser.RULE_courses);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 228;
        this.match(NusModsParser.COURSES);
        this.state = 230;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === NusModsParser.LPAREN) {
          {
            this.state = 229;
            this.contains_number();
          }
        }

        this.state = 232;
        this.course_items();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public course_items(): Course_itemsContext {
    let _localctx: Course_itemsContext = new Course_itemsContext(this._ctx, this.state);
    this.enterRule(_localctx, 46, NusModsParser.RULE_course_items);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 234;
        this.match(NusModsParser.PROGRAMS_VALUE);
        this.state = 239;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === NusModsParser.COMMA) {
          {
            {
              this.state = 235;
              this.match(NusModsParser.COMMA);
              this.state = 236;
              this.match(NusModsParser.PROGRAMS_VALUE);
            }
          }
          this.state = 241;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public must_be_in(): Must_be_inContext {
    let _localctx: Must_be_inContext = new Must_be_inContext(this._ctx, this.state);
    this.enterRule(_localctx, 48, NusModsParser.RULE_must_be_in);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 242;
        this.match(NusModsParser.MUST_BE_IN);
        this.state = 244;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === NusModsParser.LPAREN) {
          {
            this.state = 243;
            this.contains_number();
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public must_not_be_in(): Must_not_be_inContext {
    let _localctx: Must_not_be_inContext = new Must_not_be_inContext(this._ctx, this.state);
    this.enterRule(_localctx, 50, NusModsParser.RULE_must_not_be_in);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 246;
        this.match(NusModsParser.MUST_NOT_BE_IN);
        this.state = 248;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === NusModsParser.LPAREN) {
          {
            this.state = 247;
            this.contains_number();
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public if_in(): If_inContext {
    let _localctx: If_inContext = new If_inContext(this._ctx, this.state);
    this.enterRule(_localctx, 52, NusModsParser.RULE_if_in);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 250;
        this.match(NusModsParser.IF_IN);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public if_not_in(): If_not_inContext {
    let _localctx: If_not_inContext = new If_not_inContext(this._ctx, this.state);
    this.enterRule(_localctx, 54, NusModsParser.RULE_if_not_in);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 252;
        this.match(NusModsParser.IF_NOT_IN);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public contains_number(): Contains_numberContext {
    let _localctx: Contains_numberContext = new Contains_numberContext(this._ctx, this.state);
    this.enterRule(_localctx, 56, NusModsParser.RULE_contains_number);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 254;
        this.match(NusModsParser.LPAREN);
        this.state = 255;
        this.match(NusModsParser.NUMBER);
        this.state = 256;
        this.match(NusModsParser.RPAREN);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }

  public static readonly _serializedATN: string =
    '\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x1E\u0105\x04' +
    '\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04' +
    '\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r' +
    '\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12' +
    '\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17' +
    '\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C' +
    '\x04\x1D\t\x1D\x04\x1E\t\x1E\x03\x02\x03\x02\x03\x02\x03\x02\x05\x02A' +
    '\n\x02\x03\x03\x03\x03\x03\x03\x05\x03F\n\x03\x03\x03\x03\x03\x03\x03' +
    '\x07\x03K\n\x03\f\x03\x0E\x03N\v\x03\x03\x04\x03\x04\x03\x04\x03\x04\x03' +
    '\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x05\x04Z\n\x04\x03\x05\x03' +
    '\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03' +
    '\x06\x07\x06g\n\x06\f\x06\x0E\x06j\v\x06\x05\x06l\n\x06\x03\x07\x03\x07' +
    '\x03\x07\x03\x07\x03\b\x03\b\x03\b\x03\b\x03\t\x03\t\x03\t\x03\t\x03\t' +
    '\x05\t{\n\t\x03\n\x03\n\x03\v\x03\v\x03\v\x03\v\x03\v\x05\v\x84\n\v\x03' +
    '\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x05\f\x8F\n\f\x03\r' +
    '\x03\r\x03\r\x03\r\x03\r\x05\r\x96\n\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E' +
    '\x05\x0E\x9C\n\x0E\x03\x0F\x03\x0F\x03\x0F\x07\x0F\xA1\n\x0F\f\x0F\x0E' +
    '\x0F\xA4\v\x0F\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x05\x10\xAB\n\x10' +
    '\x03\x11\x03\x11\x03\x11\x03\x11\x05\x11\xB1\n\x11\x03\x12\x03\x12\x03' +
    '\x12\x03\x12\x03\x12\x05\x12\xB8\n\x12\x03\x12\x03\x12\x05\x12\xBC\n\x12' +
    '\x03\x13\x03\x13\x03\x13\x03\x13\x05\x13\xC2\n\x13\x03\x14\x03\x14\x03' +
    '\x14\x03\x14\x03\x14\x03\x14\x03\x15\x03\x15\x03\x15\x03\x15\x05\x15\xCE' +
    '\n\x15\x03\x16\x03\x16\x03\x16\x03\x16\x05\x16\xD4\n\x16\x03\x16\x03\x16' +
    '\x03\x16\x03\x16\x03\x16\x05\x16\xDB\n\x16\x03\x17\x03\x17\x03\x17\x03' +
    '\x17\x03\x17\x03\x17\x03\x17\x03\x17\x05\x17\xE5\n\x17\x03\x18\x03\x18' +
    '\x05\x18\xE9\n\x18\x03\x18\x03\x18\x03\x19\x03\x19\x03\x19\x07\x19\xF0' +
    '\n\x19\f\x19\x0E\x19\xF3\v\x19\x03\x1A\x03\x1A\x05\x1A\xF7\n\x1A\x03\x1B' +
    '\x03\x1B\x05\x1B\xFB\n\x1B\x03\x1C\x03\x1C\x03\x1D\x03\x1D\x03\x1E\x03' +
    '\x1E\x03\x1E\x03\x1E\x03\x1E\x02\x02\x02\x1F\x02\x02\x04\x02\x06\x02\b' +
    '\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02' +
    '\x1C\x02\x1E\x02 \x02"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x022\x024\x02' +
    '6\x028\x02:\x02\x02\x03\x03\x02\v\f\x02\u0118\x02@\x03\x02\x02\x02\x04' +
    'B\x03\x02\x02\x02\x06Y\x03\x02\x02\x02\b[\x03\x02\x02\x02\nk\x03\x02\x02' +
    '\x02\fm\x03\x02\x02\x02\x0Eq\x03\x02\x02\x02\x10z\x03\x02\x02\x02\x12' +
    '|\x03\x02\x02\x02\x14\x83\x03\x02\x02\x02\x16\x8E\x03\x02\x02\x02\x18' +
    '\x90\x03\x02\x02\x02\x1A\x9B\x03\x02\x02\x02\x1C\x9D\x03\x02\x02\x02\x1E' +
    '\xA5\x03\x02\x02\x02 \xB0\x03\x02\x02\x02"\xB2\x03\x02\x02\x02$\xBD\x03' +
    '\x02\x02\x02&\xC3\x03\x02\x02\x02(\xCD\x03\x02\x02\x02*\xDA\x03\x02\x02' +
    '\x02,\xE4\x03\x02\x02\x02.\xE6\x03\x02\x02\x020\xEC\x03\x02\x02\x022\xF4' +
    '\x03\x02\x02\x024\xF8\x03\x02\x02\x026\xFC\x03\x02\x02\x028\xFE\x03\x02' +
    '\x02\x02:\u0100\x03\x02\x02\x02<A\x03\x02\x02\x02=>\x05\x06\x04\x02>?' +
    '\x07\x02\x02\x03?A\x03\x02\x02\x02@<\x03\x02\x02\x02@=\x03\x02\x02\x02' +
    'A\x03\x03\x02\x02\x02BE\x07\r\x02\x02CF\x056\x1C\x02DF\x052\x1A\x02EC' +
    '\x03\x02\x02\x02ED\x03\x02\x02\x02FG\x03\x02\x02\x02GL\x07\x0E\x02\x02' +
    'HI\x07\x03\x02\x02IK\x07\x0E\x02\x02JH\x03\x02\x02\x02KN\x03\x02\x02\x02' +
    'LJ\x03\x02\x02\x02LM\x03\x02\x02\x02M\x05\x03\x02\x02\x02NL\x03\x02\x02' +
    '\x02OZ\x03\x02\x02\x02PQ\x07\x04\x02\x02QR\x05\x06\x04\x02RS\x07\x05\x02' +
    '\x02SZ\x03\x02\x02\x02TZ\x05\b\x05\x02UZ\x05\f\x07\x02VZ\x05\x0E\b\x02' +
    'WZ\x05\x10\t\x02XZ\x05\x14\v\x02YO\x03\x02\x02\x02YP\x03\x02\x02\x02Y' +
    'T\x03\x02\x02\x02YU\x03\x02\x02\x02YV\x03\x02\x02\x02YW\x03\x02\x02\x02' +
    'YX\x03\x02\x02\x02Z\x07\x03\x02\x02\x02[\\\x05\n\x06\x02\\]\x07\n\x02' +
    '\x02]^\x05\x06\x04\x02^\t\x03\x02\x02\x02_`\x07\x04\x02\x02`a\x05\n\x06' +
    '\x02ab\x07\x05\x02\x02bl\x03\x02\x02\x02ch\x05\x04\x03\x02de\x07\f\x02' +
    '\x02eg\x05\x04\x03\x02fd\x03\x02\x02\x02gj\x03\x02\x02\x02hf\x03\x02\x02' +
    '\x02hi\x03\x02\x02\x02il\x03\x02\x02\x02jh\x03\x02\x02\x02k_\x03\x02\x02' +
    '\x02kc\x03\x02\x02\x02l\v\x03\x02\x02\x02mn\x05"\x12\x02no\x07\n\x02' +
    '\x02op\x05\x06\x04\x02p\r\x03\x02\x02\x02qr\x05$\x13\x02rs\x07\n\x02\x02' +
    'st\x05\x06\x04\x02t\x0F\x03\x02\x02\x02u{\x03\x02\x02\x02vw\x05\x14\v' +
    '\x02wx\x05\x12\n\x02xy\x05\x06\x04\x02y{\x03\x02\x02\x02zu\x03\x02\x02' +
    '\x02zv\x03\x02\x02\x02{\x11\x03\x02\x02\x02|}\t\x02\x02\x02}\x13\x03\x02' +
    '\x02\x02~\x7F\x07\x04\x02\x02\x7F\x80\x05\x06\x04\x02\x80\x81\x07\x05' +
    '\x02\x02\x81\x84\x03\x02\x02\x02\x82\x84\x05\x16\f\x02\x83~\x03\x02\x02' +
    '\x02\x83\x82\x03\x02\x02\x02\x84\x15\x03\x02\x02\x02\x85\x8F\x03\x02\x02' +
    '\x02\x86\x8F\x05\x04\x03\x02\x87\x8F\x05\x18\r\x02\x88\x8F\x05\x1E\x10' +
    '\x02\x89\x8F\x05"\x12\x02\x8A\x8F\x05$\x13\x02\x8B\x8F\x05&\x14\x02\x8C' +
    '\x8F\x05*\x16\x02\x8D\x8F\x05,\x17\x02\x8E\x85\x03\x02\x02\x02\x8E\x86' +
    '\x03\x02\x02\x02\x8E\x87\x03\x02\x02\x02\x8E\x88\x03\x02\x02\x02\x8E\x89' +
    '\x03\x02\x02\x02\x8E\x8A\x03\x02\x02\x02\x8E\x8B\x03\x02\x02\x02\x8E\x8C' +
    '\x03\x02\x02\x02\x8E\x8D\x03\x02\x02\x02\x8F\x17\x03\x02\x02\x02\x90\x91' +
    '\x07\x0F\x02\x02\x91\x92\x05\x1A\x0E\x02\x92\x95\x05\x1C\x0F\x02\x93\x94' +
    '\x07\n\x02\x02\x94\x96\x05\x06\x04\x02\x95\x93\x03\x02\x02\x02\x95\x96' +
    '\x03\x02\x02\x02\x96\x19\x03\x02\x02\x02\x97\x9C\x056\x1C\x02\x98\x9C' +
    '\x058\x1D\x02\x99\x9C\x052\x1A\x02\x9A\x9C\x054\x1B\x02\x9B\x97\x03\x02' +
    '\x02\x02\x9B\x98\x03\x02\x02\x02\x9B\x99\x03\x02\x02\x02\x9B\x9A\x03\x02' +
    '\x02\x02\x9C\x1B\x03\x02\x02\x02\x9D\xA2\x07\x1D\x02\x02\x9E\x9F\x07\x03' +
    '\x02\x02\x9F\xA1\x07\x1D\x02\x02\xA0\x9E\x03\x02\x02\x02\xA1\xA4\x03\x02' +
    '\x02\x02\xA2\xA0\x03\x02\x02\x02\xA2\xA3\x03\x02\x02\x02\xA3\x1D\x03\x02' +
    '\x02\x02\xA4\xA2\x03\x02\x02\x02\xA5\xA6\x07\x10\x02\x02\xA6\xA7\x05 ' +
    '\x11\x02\xA7\xAA\x05\x1C\x0F\x02\xA8\xA9\x07\n\x02\x02\xA9\xAB\x05\x06' +
    '\x04\x02\xAA\xA8\x03\x02\x02\x02\xAA\xAB\x03\x02\x02\x02\xAB\x1F\x03\x02' +
    '\x02\x02\xAC\xB1\x056\x1C\x02\xAD\xB1\x058\x1D\x02\xAE\xB1\x052\x1A\x02' +
    '\xAF\xB1\x054\x1B\x02\xB0\xAC\x03\x02\x02\x02\xB0\xAD\x03\x02\x02\x02' +
    '\xB0\xAE\x03\x02\x02\x02\xB0\xAF\x03\x02\x02\x02\xB1!\x03\x02\x02\x02' +
    '\xB2\xB7\x07\x11\x02\x02\xB3\xB8\x056\x1C\x02\xB4\xB8\x058\x1D\x02\xB5' +
    '\xB8\x052\x1A\x02\xB6\xB8\x054\x1B\x02\xB7\xB3\x03\x02\x02\x02\xB7\xB4' +
    '\x03\x02\x02\x02\xB7\xB5\x03\x02\x02\x02\xB7\xB6\x03\x02\x02\x02\xB8\xB9' +
    '\x03\x02\x02\x02\xB9\xBB\x07\x1C\x02\x02\xBA\xBC\x07\x1C\x02\x02\xBB\xBA' +
    '\x03\x02\x02\x02\xBB\xBC\x03\x02\x02\x02\xBC#\x03\x02\x02\x02\xBD\xBE' +
    '\x07\x12\x02\x02\xBE\xBF\x056\x1C\x02\xBF\xC1\x07\x1C\x02\x02\xC0\xC2' +
    '\x07\x1C\x02\x02\xC1\xC0\x03\x02\x02\x02\xC1\xC2\x03\x02\x02\x02\xC2%' +
    '\x03\x02\x02\x02\xC3\xC4\x07\x13\x02\x02\xC4\xC5\x05(\x15\x02\xC5\xC6' +
    "\x07\x1A\x02\x02\xC6\xC7\x07\x14\x02\x02\xC7\xC8\x07\x1A\x02\x02\xC8\'" +
    '\x03\x02\x02\x02\xC9\xCE\x056\x1C\x02\xCA\xCE\x058\x1D\x02\xCB\xCE\x05' +
    '2\x1A\x02\xCC\xCE\x054\x1B\x02\xCD\xC9\x03\x02\x02\x02\xCD\xCA\x03\x02' +
    '\x02\x02\xCD\xCB\x03\x02\x02\x02\xCD\xCC\x03\x02\x02\x02\xCE)\x03\x02' +
    '\x02\x02\xCF\xDB\x03\x02\x02\x02\xD0\xDB\x05.\x18\x02\xD1\xD3\x07\x16' +
    '\x02\x02\xD2\xD4\x05:\x1E\x02\xD3\xD2\x03\x02\x02\x02\xD3\xD4\x03\x02' +
    '\x02\x02\xD4\xD5\x03\x02\x02\x02\xD5\xDB\x05\x1C\x0F\x02\xD6\xD7\x07\x17' +
    '\x02\x02\xD7\xDB\x05:\x1E\x02\xD8\xD9\x07\x18\x02\x02\xD9\xDB\x05:\x1E' +
    '\x02\xDA\xCF\x03\x02\x02\x02\xDA\xD0\x03\x02\x02\x02\xDA\xD1\x03\x02\x02' +
    '\x02\xDA\xD6\x03\x02\x02\x02\xDA\xD8\x03\x02\x02\x02\xDB+\x03\x02\x02' +
    '\x02\xDC\xE5\x03\x02\x02\x02\xDD\xDE\x07\x19\x02\x02\xDE\xDF\x07\x04\x02' +
    '\x02\xDF\xE0\x05.\x18\x02\xE0\xE1\x07\x05\x02\x02\xE1\xE5\x03\x02\x02' +
    '\x02\xE2\xE3\x07\x19\x02\x02\xE3\xE5\x05.\x18\x02\xE4\xDC\x03\x02\x02' +
    '\x02\xE4\xDD\x03\x02\x02\x02\xE4\xE2\x03\x02\x02\x02\xE5-\x03\x02\x02' +
    '\x02\xE6\xE8\x07\x15\x02\x02\xE7\xE9\x05:\x1E\x02\xE8\xE7\x03\x02\x02' +
    '\x02\xE8\xE9\x03\x02\x02\x02\xE9\xEA\x03\x02\x02\x02\xEA\xEB\x050\x19' +
    '\x02\xEB/\x03\x02\x02\x02\xEC\xF1\x07\x1D\x02\x02\xED\xEE\x07\x03\x02' +
    '\x02\xEE\xF0\x07\x1D\x02\x02\xEF\xED\x03\x02\x02\x02\xF0\xF3\x03\x02\x02' +
    '\x02\xF1\xEF\x03\x02\x02\x02\xF1\xF2\x03\x02\x02\x02\xF21\x03\x02\x02' +
    '\x02\xF3\xF1\x03\x02\x02\x02\xF4\xF6\x07\x07\x02\x02\xF5\xF7\x05:\x1E' +
    '\x02\xF6\xF5\x03\x02\x02\x02\xF6\xF7\x03\x02\x02\x02\xF73\x03\x02\x02' +
    '\x02\xF8\xFA\x07\t\x02\x02\xF9\xFB\x05:\x1E\x02\xFA\xF9\x03\x02\x02\x02' +
    '\xFA\xFB\x03\x02\x02\x02\xFB5\x03\x02\x02\x02\xFC\xFD\x07\x06\x02\x02' +
    '\xFD7\x03\x02\x02\x02\xFE\xFF\x07\b\x02\x02\xFF9\x03\x02\x02\x02\u0100' +
    '\u0101\x07\x04\x02\x02\u0101\u0102\x07\x1B\x02\x02\u0102\u0103\x07\x05' +
    '\x02\x02\u0103;\x03\x02\x02\x02\x1B@ELYhkz\x83\x8E\x95\x9B\xA2\xAA\xB0' +
    '\xB7\xBB\xC1\xCD\xD3\xDA\xE4\xE8\xF1\xF6\xFA';
  public static __ATN: ATN;
  public static get _ATN(): ATN {
    if (!NusModsParser.__ATN) {
      NusModsParser.__ATN = new ATNDeserializer().deserialize(
        Utils.toCharArray(NusModsParser._serializedATN),
      );
    }

    return NusModsParser.__ATN;
  }
}

export class OverallContext extends ParserRuleContext {
  public compound(): CompoundContext | undefined {
    return this.tryGetRuleContext(0, CompoundContext);
  }
  public EOF(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.EOF, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_overall;
  }
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
  public PROGRAM_TYPES(): TerminalNode {
    return this.getToken(NusModsParser.PROGRAM_TYPES, 0);
  }
  public PROGRAM_TYPES_VALUE(): TerminalNode[];
  public PROGRAM_TYPES_VALUE(i: number): TerminalNode;
  public PROGRAM_TYPES_VALUE(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(NusModsParser.PROGRAM_TYPES_VALUE);
    } else {
      return this.getToken(NusModsParser.PROGRAM_TYPES_VALUE, i);
    }
  }
  public if_in(): If_inContext | undefined {
    return this.tryGetRuleContext(0, If_inContext);
  }
  public must_be_in(): Must_be_inContext | undefined {
    return this.tryGetRuleContext(0, Must_be_inContext);
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
  public get ruleIndex(): number {
    return NusModsParser.RULE_program_types;
  }
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
  public LPAREN(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.LPAREN, 0);
  }
  public compound(): CompoundContext | undefined {
    return this.tryGetRuleContext(0, CompoundContext);
  }
  public RPAREN(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.RPAREN, 0);
  }
  public program_types_conditional(): Program_types_conditionalContext | undefined {
    return this.tryGetRuleContext(0, Program_types_conditionalContext);
  }
  public cohort_conditional(): Cohort_conditionalContext | undefined {
    return this.tryGetRuleContext(0, Cohort_conditionalContext);
  }
  public subject_years_conditional(): Subject_years_conditionalContext | undefined {
    return this.tryGetRuleContext(0, Subject_years_conditionalContext);
  }
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
  public get ruleIndex(): number {
    return NusModsParser.RULE_compound;
  }
  // @Override
  public accept<Result>(visitor: NusModsVisitor<Result>): Result {
    if (visitor.visitCompound) {
      return visitor.visitCompound(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class Program_types_conditionalContext extends ParserRuleContext {
  public program_types_gate(): Program_types_gateContext {
    return this.getRuleContext(0, Program_types_gateContext);
  }
  public THEN(): TerminalNode {
    return this.getToken(NusModsParser.THEN, 0);
  }
  public compound(): CompoundContext {
    return this.getRuleContext(0, CompoundContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_program_types_conditional;
  }
  // @Override
  public accept<Result>(visitor: NusModsVisitor<Result>): Result {
    if (visitor.visitProgram_types_conditional) {
      return visitor.visitProgram_types_conditional(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class Program_types_gateContext extends ParserRuleContext {
  public LPAREN(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.LPAREN, 0);
  }
  public program_types_gate(): Program_types_gateContext | undefined {
    return this.tryGetRuleContext(0, Program_types_gateContext);
  }
  public RPAREN(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.RPAREN, 0);
  }
  public program_types(): Program_typesContext[];
  public program_types(i: number): Program_typesContext;
  public program_types(i?: number): Program_typesContext | Program_typesContext[] {
    if (i === undefined) {
      return this.getRuleContexts(Program_typesContext);
    } else {
      return this.getRuleContext(i, Program_typesContext);
    }
  }
  public OR(): TerminalNode[];
  public OR(i: number): TerminalNode;
  public OR(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(NusModsParser.OR);
    } else {
      return this.getToken(NusModsParser.OR, i);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_program_types_gate;
  }
  // @Override
  public accept<Result>(visitor: NusModsVisitor<Result>): Result {
    if (visitor.visitProgram_types_gate) {
      return visitor.visitProgram_types_gate(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class Cohort_conditionalContext extends ParserRuleContext {
  public cohort_years(): Cohort_yearsContext {
    return this.getRuleContext(0, Cohort_yearsContext);
  }
  public THEN(): TerminalNode {
    return this.getToken(NusModsParser.THEN, 0);
  }
  public compound(): CompoundContext {
    return this.getRuleContext(0, CompoundContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_cohort_conditional;
  }
  // @Override
  public accept<Result>(visitor: NusModsVisitor<Result>): Result {
    if (visitor.visitCohort_conditional) {
      return visitor.visitCohort_conditional(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class Subject_years_conditionalContext extends ParserRuleContext {
  public subject_years(): Subject_yearsContext {
    return this.getRuleContext(0, Subject_yearsContext);
  }
  public THEN(): TerminalNode {
    return this.getToken(NusModsParser.THEN, 0);
  }
  public compound(): CompoundContext {
    return this.getRuleContext(0, CompoundContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_subject_years_conditional;
  }
  // @Override
  public accept<Result>(visitor: NusModsVisitor<Result>): Result {
    if (visitor.visitSubject_years_conditional) {
      return visitor.visitSubject_years_conditional(this);
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
  public get ruleIndex(): number {
    return NusModsParser.RULE_binop;
  }
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
  public AND(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.AND, 0);
  }
  public OR(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.OR, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_boolean_expr;
  }
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
  public LPAREN(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.LPAREN, 0);
  }
  public compound(): CompoundContext | undefined {
    return this.tryGetRuleContext(0, CompoundContext);
  }
  public RPAREN(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.RPAREN, 0);
  }
  public primitive(): PrimitiveContext | undefined {
    return this.tryGetRuleContext(0, PrimitiveContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_op;
  }
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
  public program_types(): Program_typesContext | undefined {
    return this.tryGetRuleContext(0, Program_typesContext);
  }
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
  public get ruleIndex(): number {
    return NusModsParser.RULE_primitive;
  }
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
  public PROGRAMS(): TerminalNode {
    return this.getToken(NusModsParser.PROGRAMS, 0);
  }
  public programs_condition(): Programs_conditionContext {
    return this.getRuleContext(0, Programs_conditionContext);
  }
  public programs_values(): Programs_valuesContext {
    return this.getRuleContext(0, Programs_valuesContext);
  }
  public THEN(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.THEN, 0);
  }
  public compound(): CompoundContext | undefined {
    return this.tryGetRuleContext(0, CompoundContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_programs;
  }
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
  public if_in(): If_inContext | undefined {
    return this.tryGetRuleContext(0, If_inContext);
  }
  public if_not_in(): If_not_inContext | undefined {
    return this.tryGetRuleContext(0, If_not_inContext);
  }
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
  public get ruleIndex(): number {
    return NusModsParser.RULE_programs_condition;
  }
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
  public get ruleIndex(): number {
    return NusModsParser.RULE_programs_values;
  }
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
  public PLAN_TYPES(): TerminalNode {
    return this.getToken(NusModsParser.PLAN_TYPES, 0);
  }
  public plan_types_condition(): Plan_types_conditionContext {
    return this.getRuleContext(0, Plan_types_conditionContext);
  }
  public programs_values(): Programs_valuesContext {
    return this.getRuleContext(0, Programs_valuesContext);
  }
  public THEN(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.THEN, 0);
  }
  public compound(): CompoundContext | undefined {
    return this.tryGetRuleContext(0, CompoundContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_plan_types;
  }
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
  public if_in(): If_inContext | undefined {
    return this.tryGetRuleContext(0, If_inContext);
  }
  public if_not_in(): If_not_inContext | undefined {
    return this.tryGetRuleContext(0, If_not_inContext);
  }
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
  public get ruleIndex(): number {
    return NusModsParser.RULE_plan_types_condition;
  }
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
  public COHORT_YEARS(): TerminalNode {
    return this.getToken(NusModsParser.COHORT_YEARS, 0);
  }
  public YEARS(): TerminalNode[];
  public YEARS(i: number): TerminalNode;
  public YEARS(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(NusModsParser.YEARS);
    } else {
      return this.getToken(NusModsParser.YEARS, i);
    }
  }
  public if_in(): If_inContext | undefined {
    return this.tryGetRuleContext(0, If_inContext);
  }
  public if_not_in(): If_not_inContext | undefined {
    return this.tryGetRuleContext(0, If_not_inContext);
  }
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
  public get ruleIndex(): number {
    return NusModsParser.RULE_cohort_years;
  }
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
  public SUBJECT_YEARS(): TerminalNode {
    return this.getToken(NusModsParser.SUBJECT_YEARS, 0);
  }
  public if_in(): If_inContext {
    return this.getRuleContext(0, If_inContext);
  }
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
  public get ruleIndex(): number {
    return NusModsParser.RULE_subject_years;
  }
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
  public SPECIAL(): TerminalNode {
    return this.getToken(NusModsParser.SPECIAL, 0);
  }
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
  public SPECIAL_VALUE(): TerminalNode {
    return this.getToken(NusModsParser.SPECIAL_VALUE, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_special;
  }
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
  public if_in(): If_inContext | undefined {
    return this.tryGetRuleContext(0, If_inContext);
  }
  public if_not_in(): If_not_inContext | undefined {
    return this.tryGetRuleContext(0, If_not_inContext);
  }
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
  public get ruleIndex(): number {
    return NusModsParser.RULE_special_condition;
  }
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
  public SUBJECTS(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.SUBJECTS, 0);
  }
  public programs_values(): Programs_valuesContext | undefined {
    return this.tryGetRuleContext(0, Programs_valuesContext);
  }
  public contains_number(): Contains_numberContext | undefined {
    return this.tryGetRuleContext(0, Contains_numberContext);
  }
  public UNITS(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.UNITS, 0);
  }
  public GPA(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.GPA, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_prereq;
  }
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
  public COREQUISITE(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.COREQUISITE, 0);
  }
  public LPAREN(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.LPAREN, 0);
  }
  public courses(): CoursesContext | undefined {
    return this.tryGetRuleContext(0, CoursesContext);
  }
  public RPAREN(): TerminalNode | undefined {
    return this.tryGetToken(NusModsParser.RPAREN, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_coreq;
  }
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
  public COURSES(): TerminalNode {
    return this.getToken(NusModsParser.COURSES, 0);
  }
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
  public get ruleIndex(): number {
    return NusModsParser.RULE_courses;
  }
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
  public get ruleIndex(): number {
    return NusModsParser.RULE_course_items;
  }
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
  public MUST_BE_IN(): TerminalNode {
    return this.getToken(NusModsParser.MUST_BE_IN, 0);
  }
  public contains_number(): Contains_numberContext | undefined {
    return this.tryGetRuleContext(0, Contains_numberContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_must_be_in;
  }
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
  public MUST_NOT_BE_IN(): TerminalNode {
    return this.getToken(NusModsParser.MUST_NOT_BE_IN, 0);
  }
  public contains_number(): Contains_numberContext | undefined {
    return this.tryGetRuleContext(0, Contains_numberContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_must_not_be_in;
  }
  // @Override
  public accept<Result>(visitor: NusModsVisitor<Result>): Result {
    if (visitor.visitMust_not_be_in) {
      return visitor.visitMust_not_be_in(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class If_inContext extends ParserRuleContext {
  public IF_IN(): TerminalNode {
    return this.getToken(NusModsParser.IF_IN, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_if_in;
  }
  // @Override
  public accept<Result>(visitor: NusModsVisitor<Result>): Result {
    if (visitor.visitIf_in) {
      return visitor.visitIf_in(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class If_not_inContext extends ParserRuleContext {
  public IF_NOT_IN(): TerminalNode {
    return this.getToken(NusModsParser.IF_NOT_IN, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_if_not_in;
  }
  // @Override
  public accept<Result>(visitor: NusModsVisitor<Result>): Result {
    if (visitor.visitIf_not_in) {
      return visitor.visitIf_not_in(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class Contains_numberContext extends ParserRuleContext {
  public LPAREN(): TerminalNode {
    return this.getToken(NusModsParser.LPAREN, 0);
  }
  public NUMBER(): TerminalNode {
    return this.getToken(NusModsParser.NUMBER, 0);
  }
  public RPAREN(): TerminalNode {
    return this.getToken(NusModsParser.RPAREN, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return NusModsParser.RULE_contains_number;
  }
  // @Override
  public accept<Result>(visitor: NusModsVisitor<Result>): Result {
    if (visitor.visitContains_number) {
      return visitor.visitContains_number(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
