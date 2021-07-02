import * as smt from 'smtlib-ext';

const SIM_VARNAME = 'weeks_to_simulate';
/**
 * Separate solver to solve the Hitting Set NP-Hard problem: finding the minimum number of weeks to simulate.
 * We pass in all the weeks for each lesson as a bitvector, and this generates the smtlib2 string that solves for
 *  the minimum number of weeks to cover all weeks input so far.
 *
 *
 *  Mathematically:
 *      - Weeks = { 1...13 }
 *      - Simulated SUBSETOF Weeks
 *      - S = { S_i | S_i SUBSETOF Weeks is a list of weeks that a lesson must be held }
 *      - FORALL(S_i) IN S: S_i intersect Simulated != nullset
 * */
export class Z3WeekSolver {
  solver: any; // For the actual constraints

  nuWeeks: number; // Defines bitvec sizes

  zero: string;

  one: string;

  constructor(numWeeks: number) {
    this.solver = new smt.BaseSolver('QF_ALL_SUPPORTED');
    this.nuWeeks = numWeeks;
    this.zero = this.generateZero();
    this.one = this.generateOne();
    this.solver.add(this.generateDecl(SIM_VARNAME)); // Add in our required "sim" variable
    this.solver.add(this.generatePopcnt()); // Add in the variable definition for popcount for this weeksize
  }

  addWeeks(weeks: Array<number>, idStr: string) {
    const values = new Array(this.nuWeeks).fill(0);
    weeks.forEach((week: number) => {
      values[week - 1] = 1;
    });
    this.declareConstraint(values, idStr);
  }

  generateSmtlib2String(): string {
    let constraintStr = '';
    this.solver.forEachStatement((stmt: string) => {
      constraintStr += `${stmt}\n`;
    });
    constraintStr = constraintStr.substring(constraintStr.indexOf('\n') + 1);
    const minimizeStr = `(minimize (popCount13 ${SIM_VARNAME}))\n`;
    // The string that executes the solver and retrives the final model and objectives
    const solveStr = `(check-sat)\n(get-value (${SIM_VARNAME}))\n(exit)`;
    // Overall SMTLIB2 string to return
    const finalStr = constraintStr + minimizeStr + solveStr;
    console.log(finalStr);
    return finalStr;
  }

  /**
   * Utils
   * */
  declareConstraint(values: Array<number>, idStr: string) {
    const bv = this.generateBitvec(values);
    this.solver.add(this.generateDecl(idStr));
    this.solver.assert(smt.Eq(idStr, bv));
    this.solver.assert(smt.NEq(smt.BVAnd(idStr, SIM_VARNAME), this.zero));
    // (assert (not (= (bvand x sim) zerovec)))
  }

  generateDecl(varname: string): any {
    return smt.DeclareFun(varname, [], `(_ BitVec ${this.nuWeeks})`);
  }

  generateBitvec(values: Array<number>) {
    if (values.length !== this.nuWeeks) {
      throw new Error(
        'Programming error: the values array passed to this function must be consistent with the SMT Sort used (BitVec num_weeks)',
      );
    }
    const str = `#b${values.map((val: number) => (val === 0 ? '0' : '1')).join('')}`;
    return str;
  }

  generatePopcnt() {
    const line1 = `(define-fun popCount13 ((x (_ BitVec ${this.nuWeeks}))) (_ BitVec ${this.nuWeeks})\n(bvadd\n`;
    let ites = '';
    for (let i = 0; i < this.nuWeeks; i++) {
      ites += `(ite (= #b1 ((_ extract ${i} ${i}) x)) ${this.one} ${this.zero})\n`;
    }
    const end = `))`;
    return line1 + ites + end;
  }

  generateZero() {
    return this.generateBitvec(new Array(this.nuWeeks).fill(0));
  }

  generateOne() {
    const arr = new Array(this.nuWeeks).fill(0);
    arr[arr.length - 1] = 1;
    return this.generateBitvec(arr);
  }
}
