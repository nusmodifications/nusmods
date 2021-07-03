// TODO convert to import explicitly
import { SlotConstraint } from 'types/optimizer';

import * as smt from 'smtlib-ext';

// Constants for owner id values that are not lessons
export const UNASSIGNED = -1;
export const FREE = -2;
export const TOOEARLY_LATE = -20;
export const VAR_UNASSIGNED_WEIGHT = 1;
export const BOOLVAR_ASSIGNED_WEIGHT = 100000;

// Prefixes
export const SELECTOR_PREFIX = 'SL_';
export const SELECTOR_FULFIL_N_PREFIX = 'SLKB_';
export const SELECTOR_OPTIONAL_PREFIX = 'OPT_';

export class Z3TimetableSolver {
  timevars: string[]; // ["t0", "t1", ....] representing all possible half-hour slots

  assignedIntvarsPossiblevalues: Record<string, Set<number>>; // What allowed values can each time val have

  boolSelectorsSet: Set<string>; // Basically module names e.g, CS3203, to select or de-select a module

  variablesSolver: smt.BaseSolver; // Just for variables assignment - hack to get the variables assignment ABOVE the constraints

  solver: smt.BaseSolver; // For the actual constraints

  constrainCompactness: boolean; // whether we want all classes to be right after each other as much as possible

  /**
   * Initializes the solvers and all the time variables representing each half-hour slot.
   * These don't have to be half-hours, the solver treats them generically as discrete time units.
   * Callers can also specify the name of each time unit in case t0, t1, etc, is too undescriptive.
   * Generally, this is now called with the day of the week, actual hour and minute, and the week number (for ease of reading)
   * */
  constructor(totalTimeUnits: number, timeUnitNames?: string[]) {
    // Create time variable names based on just the raw time unit, or pass in a list of strings to be appended to the raw time hours
    if (timeUnitNames !== undefined) {
      if (timeUnitNames.length !== totalTimeUnits) {
        throw new Error('Size of time_unit_names array must be equal to total_time_units!');
      } else {
        this.timevars = Array.from(
          new Array(totalTimeUnits),
          (_: number, i: number) => `t${i}_${timeUnitNames[i]}`,
        );
      }
    } else {
      this.timevars = Array.from(new Array(totalTimeUnits), (_: number, i: number) => `t${i}`);
    }
    this.assignedIntvarsPossiblevalues = {};
    this.boolSelectorsSet = new Set();
    this.variablesSolver = new smt.BaseSolver('QF_ALL_SUPPORTED');
    this.solver = new smt.BaseSolver('QF_ALL_SUPPORTED');
    this.constrainCompactness = false;
  }

  /**
     *  Add a list of constraint options, exactly one of which has to be satisfied.
        If a single constraint is passed in, it will definitely be satisfied.

        An optional boolean selector variable name can also be passed in. This makes the fulfilment of the slots optional.
          i.e., only if the boolean selector is true, then the slots are chosen. This represents for e.g., an optional module.
          The solver can decide whether or not the boolean selector is chosen based on the other constraints

        IMPLEMENTATION HISTORY (so that we don't go back to a failed idea if we try to optimize):
        To ensure that only one SlotConstraint is selected, we need to create a new variable that represent this selection:

        v1: (SL78 = 7 or SL78 = 8) and (SL78 = 7 => (.. slot constraints for id 7 ..)) ...

        v2: v1 Doesn't work since due to the single-direction implication, solver can assign all the RHS without triggering LHS selector
        v2: (SL78 = 7 or SL78 = 8) and (SL78 = 7 <=> (.. slot constraints for id 7 ..)) ... [DOUBLE IMPLICATION]

        v3: v2 Doesn't work since the solver just sets one of the hour values to a random number to avoid triggering the LHS condition
        v3: v2 + add a soft constraint to all assigned variables, soft-prefer them to be marked as UNASSIGNED

        v4: Give the constraint selectors user friendly names

        v5: We need three things for us to assign a selector to ONLY one set of time constraints uniquely
            1) Assert for EACH hour-val combo, that (selector == val) == (hour == val)
                - Implication 1: If ANY of those values in that hour block are == val, then the selector is == val
                - Implication 2: if the selector is == val, then ALL those hours must be == val
            2) Set a constraint on each hour slot such that it can only take a value that could feasibly be there due to a real timeslot
                - Otherwise, the solver just puts some random number there, which can be another slot value, or even unassigned
     *
     * */
  addSlotConstraintsFulfilOnlyOne(slots: SlotConstraint[], booleanSelector?: string) {
    // If we are selecting between owner ids 0, 1024, and 2048, the selector variable will be named SL_0_1024_2048
    const selectorVar = `${SELECTOR_PREFIX}${slots.map((slot) => slot.ownerString).join('_')}`;

    // Indicate that we need to declare this later as an unconstrained variable (but we constrain it here instead)
    this.addPossibleValuesToVariable(selectorVar);

    // Create a list of constraints for the possible values the selector can take
    // With same example, we have SL_0_1024_2048 == 0 OR SL_0_1024_2048 == 1024 OR SL_0_1024_2048 == 2048
    const selectorVarPossibleValues: smt.SNode[] = slots.map((slot) =>
      smt.Eq(selectorVar, slot.ownerId),
    );

    // We indicate with the boolean selector that options are selected ONLY IF the boolean selector is true
    if (booleanSelector !== undefined) {
      const selector = `${SELECTOR_OPTIONAL_PREFIX}${booleanSelector}`; // Ensure we have an OPT prefix to indicate an optional mod
      this.boolSelectorsSet.add(selector); // Make sure we declare the selector later
      // Asserts that IF the boolean selector is true, then all the possible values it can take must have at least 1 true (functionally only 1)
      this.solver.assert(smt.Eq(selector, smt.Or(...selectorVarPossibleValues)));
    } else {
      // Asserts unconditionally that the selector must take one of the possible values
      this.solver.assert(smt.Or(...selectorVarPossibleValues));
    }

    // Now, for each slot, create a double implication (equality) between the selector value and each of the constrained hours
    const constraints: smt.SNode[] = slots
      .map((slot) => {
        // Holds all the constraints, assuming this slotconstraint is selected
        const slotRequirements: smt.SNode[] = [];
        slot.startEndTimes.forEach(([startTime, endTime]) => {
          if (this.isSlotConstraintTimeInvalid(startTime, endTime))
            throw new Error(`Slot ${slot} time invalid: ${startTime}, ${endTime}`);
          // Create a constraint to be "owner id" for all the start and end times in the slot constraint
          // If we said: for this slot, time slots t1 and t2 need to be = ID 1024, then
          // t1 == 1024
          // t2 == 1024
          for (let i = startTime; i < endTime; i++) {
            const timevar = this.timevars[i];
            // Make sure we declare this timevar since we use it
            this.addPossibleValuesToVariable(timevar, [slot.ownerId, UNASSIGNED]);
            // For this seletion, constraint the timevar to the owner id requested
            // Assert individually that if a selector is selector, that hour must be selected to it, and vice versa
            slotRequirements.push(
              smt.Eq(smt.Eq(selectorVar, slot.ownerId), smt.Eq(timevar, slot.ownerId)),
            );
          }
        });
        return slotRequirements;
      })
      .flat(); // Flatten in case we return multiple constraints per slot

    // Assert all built-up constraints now
    constraints.forEach((constraint: smt.SNode) => this.solver.assert(constraint));
  }

  /**
   * Use Z3's PbEq / PbLe / PbGe (pseudo-boolean equal / less-than / greater-than) functional to assert that a certain
   * number out of a set of constraints must remain true.
   *
   * This is used to assert that we have at least N free days, for e.g.
   *
   * Each slotconstraint has multiple start/end times, so many hours must be asserted to be true for a slot constraint to be true.
   * ((_ pbeq 2 1 1 1) a b c) --> pseudo-boolean equals: weight a, b, and c as 1, 1 and 1, and make sure total weight == 2 (choose 2 out of 3)
   *
   * Technique: we create a selector for each set of slots, e.g., to constraint t0 = 1, t1 = 1, vs t50 = 2, t51 = 2:
   *  SL_FREEDAY_Monday == (t0 = 1)
   *  SL_FREEDAY_Monday == (t1 = 1)
   *
   *  SL_FREEDAY_Tuesday == (t50 = 2)
   *  SL_FREEDAY_Tuesay == (t51 = 2)
   *
   *  Then:
   *  ((_ pbeq N 1 1) SL_FREEDAY_Monday SL_FREEDAY_Tuesday)
   * */
  addSlotConstraintsFulfilExactlyN(slots: SlotConstraint[], n: number) {
    const selectorVarList: string[] = [];
    if (n < 0 || n > slots.length)
      throw new Error(
        `Selected either too small or too large n (= ${n}) for ${slots.length} slots`,
      );

    // Now, for each slot, create a double implication (equality) between the selector value and each of the constrained hours
    const constraints: smt.SNode[] = slots
      .map((slot) => {
        // Holds all the constraints, assuming this slotconstraint is selected
        const slotRequirements: smt.SNode[] = [];
        // Create a selector variable for this (SLKB = Selector for K-out-of-N, boolean)
        const selectorVar = `${SELECTOR_FULFIL_N_PREFIX}${slot.ownerString}`;
        selectorVarList.push(selectorVar);
        slot.startEndTimes.forEach(([startTime, endTime]) => {
          if (this.isSlotConstraintTimeInvalid(startTime, endTime))
            throw new Error(`Slot ${slot} time invalid: ${startTime}, ${endTime}`);
          // Create a constraint to be owner id for all the start and end times in the slot constraint
          // If we said: for this slot, time slots h1 and h2 need to be = ID 1024, then
          // h1 == 1024
          // h2 == 1024
          for (let i = startTime; i < endTime; i++) {
            const timevar = this.timevars[i];
            // Make sure we declare this timevar since we use it
            this.addPossibleValuesToVariable(timevar, [slot.ownerId, UNASSIGNED]);
            // For this seletion, constraint the timevar to the owner id requested\
            // Assert individually that if the boolean selector is true (selected), that hour must be selected to it, and vice versa
            slotRequirements.push(smt.Eq(selectorVar, smt.Eq(timevar, slot.ownerId)));
          }
        });
        return slotRequirements;
      })
      .flat(); // Flatten in case we return multiple constraints per slot

    // Ensures we declare the selector later
    selectorVarList.forEach((selector: string) => this.boolSelectorsSet.add(selector));

    // Assert all the constraints that relate the selector variable to the selected constrains
    constraints.forEach((constraint: smt.SNode) => this.solver.assert(constraint));

    // Assert a K-out-of-N constraint for the selector variables
    const kOfN: smt.SExpr = smt.PbEq(selectorVarList, new Array(selectorVarList.length).fill(1), n);
    this.solver.assert(kOfN);
  }

  /**
   * Sets the "workload" costs of choosing an optional module, modelled as a cost on the boolean selectors.
   * TODO: naming-wise, make this sound more generic? This seems leaky through the naming but it's not.
   * */
  setBooleanSelectorCosts(
    workloads: [string, number][],
    baseWorkload: number, // Base cost so far (modelling the credits from compulsory modules)
    minWorkload: number, // Minimium workload to satisfy constraints (min modular credits)
    maxWorkload: number, // Maximum workload to satisfy constraints (max modular credits)
  ) {
    // Create a variable for the cost of the boolean selectors, add it to declarations list
    const workloadSumName = 'workloadsum';
    this.assignedIntvarsPossiblevalues[workloadSumName] = new Set();

    const terms: smt.SNode[] = [baseWorkload];
    workloads.forEach(([varname, workload]) => {
      // Make sure varname is declared
      const fullvarname = `${SELECTOR_OPTIONAL_PREFIX}${varname}`;
      this.boolSelectorsSet.add(fullvarname);
      terms.push(smt.If(fullvarname, workload, 0));
    });
    const sumOfTerms = smt.Sum(...terms);
    this.solver.assert(smt.Eq(workloadSumName, sumOfTerms));

    // Assert that the workload should be >= than the minimum workload and <= the maximum workload
    this.solver.assert(smt.GEq(workloadSumName, minWorkload));
    this.solver.assert(smt.LEq(workloadSumName, maxWorkload));
  }

  /**
   * Bit hacky since it requires knowing our owner id constraint format, but basically:
   *  If a slot is assigned to a owner id > 0 (meaning not UNASSIGNED / FREE / etc)
   *      Then: (assert-soft) that the NEXT slot is also assigned > 0
   *  Here, we just set a flag, since this must be done at the end after all variables are assigned
   * */
  addCompactnessConstraint() {
    this.constrainCompactness = true;
  }

  /**
   * Asserts that N CONSECUTIVE time values in the slot constraint are assigned to a NEGATIVE number.
   * This is kind of like a "windowing" function,
   *  where one of the windows within the slot constraint must be consecutively assigned to a negative value.
   * Used to handle free days / starting early/later and lunch hours etc, since those are modelled as negative values.
   * */
  addNegativevalueSlotConstraintToNConsecutive(slot: SlotConstraint, n: number) {
    // Holds all the constraints, assuming this slotconstraint is selected
    const slotRequirements: smt.SNode[] = [];
    // We only care about first slotconstraint slot, multiple slots are meaningless here
    const [startTime, endTime] = slot.startEndTimes[0];
    // Take the startTime --> endTime range as windows of size n
    for (let startT = startTime; startT < endTime - n + 1; startT += 1) {
      // For each window, we need to assert that ALL of the hours are unassigned
      // Then we OR across all windows
      const windowRequirements: smt.SNode[] = [];
      for (let i = 0; i < n; i++) {
        const timevar = this.timevars[startT + i];
        // Make sure we declare this timevar since we use it, at least allow it to be unassigned (negative)
        this.addPossibleValuesToVariable(timevar, [UNASSIGNED]);
        // Assert that the slot is < 0 (either UNASSIGNED / FREE / etc)
        windowRequirements.push(smt.LEq(timevar, -1));
      }
      slotRequirements.push(smt.And(...windowRequirements));
    }
    const finalRequirements = smt.Or(...slotRequirements);
    this.solver.assert(finalRequirements);
  }

  /**
   * Creates a list of variables to declare as Ints later.
   * They can be constrained to have a certain set of values.
   *  This prevents the solver from just assigned some random integer to them and calling it a day.
   * If not constrained, the set will be empty, and we will just declare the varname later.
   * */
  addPossibleValuesToVariable(varname: string, values: number[] = []) {
    if (this.assignedIntvarsPossiblevalues[varname] === undefined) {
      // Make sure we at least have the UNASSIGNED possible value for the var
      this.assignedIntvarsPossiblevalues[varname] = new Set(values);
    } else {
      // No set union. have to add each val independently
      values.forEach((val: number) => this.assignedIntvarsPossiblevalues[varname].add(val));
    }
  }

  isSlotConstraintTimeInvalid(startTime: number, endTime: number) {
    return (
      startTime < 0 ||
      startTime > this.timevars.length - 1 ||
      endTime < 0 ||
      endTime > this.timevars.length - 1
    );
  }

  /**
   * Generates the final SMTLIB2 solve string.
   * Declares all variables and if necessary, ensure that they must be assigned to one of a set of values.
   * If necessary, constrain the timetable to be as compact as possible (has to be done now after all the declarations are made)
   * Randomize the run of the solver by default. Add a bugfix string to force the solver into optimizer mode regardless.
   *  This is necessary due to some obscure bugs within the Z3 wasm (something to do with pthreads that don't exist in WASM)
   * Removes the first line (QF_ALL_SUPPORTED) from the output SMTLIB2 text
   * */
  generateSmtlib2String(randomize = true): string {
    // Declare all the boolean vars
    this.boolSelectorsSet.forEach((boolvar: string) => {
      this.variablesSolver.add(smt.DeclareFun(boolvar, [], 'Bool'));
      // this.variables_solver.add(smt.AssertSoft(boolvar, BOOLVAR_ASSIGNED_WEIGHT, 'defaultval'));
    });

    // For each variable that we use, we need to generate an indicate that it's an integer
    // We also need to assert-soft that each variable should be UNASSIGNED if possible
    Object.keys(this.assignedIntvarsPossiblevalues).forEach((varname: string) => {
      // Declare variable
      this.variablesSolver.add(smt.DeclareFun(varname, [], 'Int'));

      // Constrain the possible values of the var if the set is nonempty
      const varValues: Set<number> = this.assignedIntvarsPossiblevalues[varname];
      if (varValues.size > 0) {
        // [(= t1 7) (= t1 8) (= t1 9)...]
        const possibleValsEq = Array.from(varValues).map((val: number) => smt.Eq(varname, val));
        // Statement that var can take all these values
        const allPossibleValsOr = smt.Or(...possibleValsEq);
        this.solver.assert(allPossibleValsOr);
      }
      // this.variables_solver.add.smt.AssertSoft(smt.Eq(timevar, UNASSIGNED), VAR_UNASSIGNED_WEIGHT, 'defaultval'));
    });

    if (this.constrainCompactness) {
      // Now that all variables are declared, add the constraint-compactness soft asserts
      Object.keys(this.assignedIntvarsPossiblevalues).forEach((varname: string) => {
        // For each variable that is assigned to a mod (owner id > 0), find the next variable that could possibly be assigned,
        // and assert-soft that it IS assigned

        // We only care about time slot vars
        if (!varname.startsWith('t')) return;

        // Get the timeslot ID (e.g., 2044)
        let varId = parseInt(varname.split('_')[0].substring(1), 10);

        // Find the next variable after this one. If it doesn't exist, return
        if (varId + 1 >= this.timevars.length) return;
        varId += 1;
        const nextVarName = this.timevars[varId];
        if (!(nextVarName in this.assignedIntvarsPossiblevalues)) return;
        if (nextVarName === undefined || nextVarName === '') return;

        // If the current var is assigned to a mod, we assert-soft that
        //  the next one is either the same mod (continuation of slot), or a different mod immediately
        const assertSoftNextvarAssigned = smt.AssertSoft(
          smt.Eq(
            smt.GEq(varname, 0),
            smt.Or(
              smt.Eq(nextVarName, varname),
              smt.And(smt.NEq(nextVarName, varname), smt.GEq(nextVarName, 0)),
            ),
          ),
          1,
          'nextvar',
        );
        this.solver.add(assertSoftNextvarAssigned);
      });
    }

    let variablesStr = '';
    this.variablesSolver.forEachStatement((stmt: smt.SNode) => {
      variablesStr += `${stmt}\n`;
    });
    variablesStr = variablesStr.substring(variablesStr.indexOf('\n') + 1);

    let constraintStr = '';
    this.solver.forEachStatement((stmt: smt.SNode) => {
      constraintStr += `${stmt}\n`;
    });
    constraintStr = constraintStr.substring(constraintStr.indexOf('\n') + 1);

    // Makes solver output random
    const randomInt = Math.floor(Math.random() * 100000000);
    const randomPrefix = randomize
      ? `(set-option :auto_config false)\n(set-option :smt.phase_selection 5)\n(set-option :smt.random-seed ${randomInt})\n`
      : '';
    // A random string that fixes a latent bug with pthread creation, likely because it causes the optimizer to kick in
    const fixBugStr =
      '(declare-fun BUGFIX_VAR_DONTASK () Int)\n(assert-soft (= BUGFIX_VAR_DONTASK 10))\n';
    // The string that executes the solver and retrives the final model and objectives
    const solveStr = '(check-sat)\n(get-model)\n(get-objectives)\n(exit)';
    // Overall SMTLIB2 string to return
    const finalStr = randomPrefix + variablesStr + constraintStr + fixBugStr + solveStr;
    // console.log(finalStr);
    return finalStr;
  }
}
