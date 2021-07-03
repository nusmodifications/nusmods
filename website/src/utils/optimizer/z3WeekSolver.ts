import * as smt from 'smtlib-ext';

const OUTPUT_WEEKS_TO_SIMULATE_VARNAME = 'weeks_to_simulate';
/**
 * Separate solver to solve the Hitting Set NP-Hard problem: finding the minimum number of weeks to simulate.
 * We pass in all the weeks for each lesson as a bitvector, and this generates the smtlib2 string that solves for
 *  the minimum number of weeks to cover all possible clashes.
 *
 *  Mathematically:
 *      - Weeks = { 1...13 }
 *      - Simulated SUBSETOF Weeks
 *      - S = { S_i | S_i SUBSETOF Weeks is a list of weeks that a lesson must be held }
 *      - FORALL(S_i) IN S: S_i intersect Simulated != nullset
 *      - Minimize cardinality of Simulated set (for performance).
 *
 *  Conceptually, imagine if we have four lessons L1 - L4.
 *  Each lesson is held on some set of weeks, say L1 is held on weeks 2, 4, 6, and so on.
 *  We can represent them like this:
 *    L1 = {    2 4 6 }
 *    L2 = {      4 6 }
 *    L3 = { 1        }
 *    L4 = { 1        }
 *  In this example, L1 and L2 must be simulated on week 4 OR week 6 so that if they clash, we can catch it.
 *  Similarly, L3 and L4 must be simulated on week 1 to compute any clashes.
 *  If we were to simulate ALL the weeks here, we would have to sim weeks 1, 2, 4, 6.
 *  However, it's clear that we can get away with just simulating weeks 1 and 4, half as many.
 *
 *  Therefore, we represent each of the lesson week requirements, and the output list of weeks to simulate, as bitvectors.
 *  We assert that each (week constraint BINARYAND output) is not 0, so that each lesson is simulated for at least ONE of their weeks.
 *  Then, we ask the solver to minimize the number of 1s in the output bitvector so that we simulate the min number of weeks.
 * */
export class Z3WeekSolver {
  solver: smt.BaseSolver; // For the actual constraints

  numWeeks: number; // Defines bitvec sizes

  zero: string; // Bitvec of numWeeks length representing 0

  one: string; // Bitvec of numWeeks length representing 1

  constructor(numWeeks: number) {
    this.solver = new smt.BaseSolver('QF_ALL_SUPPORTED');
    this.numWeeks = numWeeks;
    this.zero = this.generateZero();
    this.one = this.generateOne();
    this.solver.add(this.generateDecl(OUTPUT_WEEKS_TO_SIMULATE_VARNAME)); // Add in our required "sim" variable
    this.solver.add(this.generatePopcnt()); // Add in the variable definition for popcount for this weeksize
  }

  /**
   * Indicates that at least one of the weeks in the array must be fulfilled for a particular idString
   * E.g., addWeeks([1, 2], "a") ==> for "a" to be fulfilled, either week 1 or 2 must be simulated.
   * We assume all idStrings need to be fulfilled in the end.
   * The format of the idString is not important.
   * */
  addWeeks(weeks: number[], idStr: string) {
    const values = new Array(this.numWeeks).fill(0);
    weeks.forEach((week: number) => {
      values[week - 1] = 1;
    });
    this.declareConstraint(values, idStr);
  }

  /**
   * Generates the SMTLIB2 code to pass to the solver.
   * Adds all the bitvector constraints for each week, and then asserts that the
   *  number of 1s in the output variable is minimized.
   * Checks sat + returns only the value of the output variable.
   * */
  generateSmtlib2String(): string {
    let constraintStr = '';
    this.solver.forEachStatement((stmt: smt.SNode) => {
      constraintStr += `${stmt}\n`;
    });
    constraintStr = constraintStr.substring(constraintStr.indexOf('\n') + 1);
    const minimizeStr = `(minimize (popCount13 ${OUTPUT_WEEKS_TO_SIMULATE_VARNAME}))\n`;
    // The string that executes the solver and retrives the final model and objectives
    const solveStr = `(check-sat)\n(get-value (${OUTPUT_WEEKS_TO_SIMULATE_VARNAME}))\n(exit)`;
    // Overall SMTLIB2 string to return
    const finalStr = constraintStr + minimizeStr + solveStr;
    // console.log(finalStr);
    return finalStr;
  }

  /// ///////////////
  // Internal Utils
  /// ///////////////

  /**
   * Sets the idStr to the newly declared name of the bitvector,
   *  then asserts that the (final weeks output (SIM_VARNAME) && new bitvector) is not 0.
   * Meaning: at least ONE of the weeks represented by the bitvector MUST be in the output.
   * This ensures that each lesson is simulated.
   * */
  declareConstraint(values: number[], idStr: string): void {
    const bv = this.generateBitvec(values);
    this.solver.add(this.generateDecl(idStr));
    this.solver.assert(smt.Eq(idStr, bv));
    this.solver.assert(smt.NEq(smt.BVAnd(idStr, OUTPUT_WEEKS_TO_SIMULATE_VARNAME), this.zero));
  }

  /**
   * Declare a variable so that we can use that name in assertions
   * */
  generateDecl(varname: string): smt.SExpr {
    return smt.DeclareFun(varname, [], `(_ BitVec ${this.numWeeks})`);
  }

  /**
   * Generically create any bitvec from an array of size numWeeks.
   * If numWeeks is 3, values is [0, 1, 0], the output is #b010
   * */
  generateBitvec(values: number[]): string {
    if (values.length !== this.numWeeks) {
      throw new Error(
        'Programming error: the values array passed to this function must be consistent with the SMT Sort used (BitVec num_weeks)',
      );
    }
    const str = `#b${values.map((val: number) => (val === 0 ? '0' : '1')).join('')}`;
    return str;
  }

  /**
   * Generates the function representing the popCnt (population count) function.
   * popCnt is used during smt solving to count how many 1s there are in a bitvector.
   * */
  generatePopcnt(): string {
    const line1 = `(define-fun popCount13 ((x (_ BitVec ${this.numWeeks}))) (_ BitVec ${this.numWeeks})\n(bvadd\n`;
    let ites = '';
    for (let i = 0; i < this.numWeeks; i++) {
      ites += `(ite (= #b1 ((_ extract ${i} ${i}) x)) ${this.one} ${this.zero})\n`;
    }
    const end = `))`;
    return line1 + ites + end;
  }

  /**
   * Generates a bitvector of all zeroes
   * */
  generateZero(): string {
    return this.generateBitvec(new Array(this.numWeeks).fill(0));
  }

  /**
   * Generates a bitvector of all ones
   * */
  generateOne(): string {
    const arr = new Array(this.numWeeks).fill(0);
    arr[arr.length - 1] = 1;
    return this.generateBitvec(arr);
  }
}
