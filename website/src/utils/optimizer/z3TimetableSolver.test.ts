import {
  Z3TimetableSolver,
  SELECTOR_PREFIX,
  SELECTOR_FULFIL_N_PREFIX,
  SELECTOR_OPTIONAL_PREFIX,
} from 'utils/optimizer/z3TimetableSolver';
import { SlotConstraint, WorkloadCost } from 'types/optimizer';

describe('constructor', () => {
  it('constructs initial time arrays list as expected', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(z3ts.timevars).toEqual(['t0', 't1', 't2', 't3']);
  });

  it('constructs initial time arrays list with string variables', () => {
    const z3ts = new Z3TimetableSolver(4, ['h0', 'h1', 'h2', 'h3']);
    expect(z3ts.timevars).toEqual(['t0_h0', 't1_h1', 't2_h2', 't3_h3']);
  });

  it('errors when too many variable names are passed', () => {
    expect(() => new Z3TimetableSolver(2, ['h0', 'h1', 'h2'])).toThrow();
  });

  it('errors when too few variable names are passed', () => {
    expect(() => new Z3TimetableSolver(2, ['h0'])).toThrow();
  });
});

// Constants for tests
const sc: SlotConstraint = {
  startEndTimes: [[0, 1]],
  ownerId: 7,
  ownerString: '7',
}; // ID 7 assigned to slots 0 and 1
const sc2: SlotConstraint = {
  startEndTimes: [[2, 3]],
  ownerId: 8,
  ownerString: '8',
}; // ID 8 assigned to slots 2 and 3
const scErrorSmaller: SlotConstraint = {
  startEndTimes: [[-2, -3]],
  ownerId: 8,
  ownerString: '8',
};
const scErrorLarger: SlotConstraint = {
  startEndTimes: [[16, 17]],
  ownerId: 8,
  ownerString: '8',
};

describe('addSlotConstraintsFulfilOnlyOne', () => {
  it('generates expected smtlib2 string when choosing between one of two slots', () => {
    const z3ts = new Z3TimetableSolver(4);
    z3ts.addSlotConstraintsFulfilOnlyOne([sc, sc2]);

    // Expect
    const expected = `(declare-fun ${SELECTOR_PREFIX}7_8 () Int)
(declare-fun t0 () Int)
(declare-fun t2 () Int)
(assert (or (= ${SELECTOR_PREFIX}7_8 7) (= ${SELECTOR_PREFIX}7_8 8)))
(assert (= (= ${SELECTOR_PREFIX}7_8 7) (= t0 7)))
(assert (= (= ${SELECTOR_PREFIX}7_8 8) (= t2 8)))
(assert (or (= t0 7) (= t0 -1)))
(assert (or (= t2 8) (= t2 -1)))
(declare-fun BUGFIX_VAR_DONTASK () Int)
(assert-soft (= BUGFIX_VAR_DONTASK 10))
(check-sat)
(get-model)
(get-objectives)
(exit)`;
    // Turn off randomization so that the generated string is also deterministic
    const actual = z3ts.generateSmtlib2String(false);
    expect(actual).toEqual(expected);
  });

  it('generates expected smtlib2 string when choosing between one of two slots with an extra boolean variable', () => {
    const z3ts = new Z3TimetableSolver(4);

    const boolVar = 'booleanSelector';
    z3ts.addSlotConstraintsFulfilOnlyOne([sc, sc2], boolVar);

    // Expect
    const expected = `(declare-fun ${SELECTOR_OPTIONAL_PREFIX}booleanSelector () Bool)
(declare-fun ${SELECTOR_PREFIX}7_8 () Int)
(declare-fun t0 () Int)
(declare-fun t2 () Int)
(assert (= ${SELECTOR_OPTIONAL_PREFIX}booleanSelector (or (= ${SELECTOR_PREFIX}7_8 7) (= ${SELECTOR_PREFIX}7_8 8))))
(assert (= (= ${SELECTOR_PREFIX}7_8 7) (= t0 7)))
(assert (= (= ${SELECTOR_PREFIX}7_8 8) (= t2 8)))
(assert (or (= t0 7) (= t0 -1)))
(assert (or (= t2 8) (= t2 -1)))
(declare-fun BUGFIX_VAR_DONTASK () Int)
(assert-soft (= BUGFIX_VAR_DONTASK 10))
(check-sat)
(get-model)
(get-objectives)
(exit)`;
    // Turn off randomization so that the generated string is also deterministic
    const actual = z3ts.generateSmtlib2String(false);
    expect(actual).toEqual(expected);
  });

  it('errors when slotConstraint when too small a time value is passed', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addSlotConstraintsFulfilOnlyOne([sc2, scErrorSmaller])).toThrow();
  });

  it('errors when slotConstraint when too large a time value is passed', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addSlotConstraintsFulfilOnlyOne([sc2, scErrorLarger])).toThrow();
  });
});

const sc3: SlotConstraint = {
  startEndTimes: [[0, 1]],
  ownerId: 9,
  ownerString: '9',
}; // ID 7 assigned to slots 0 and 1
describe('addSlotConstraintsFulfilExactlyN', () => {
  it('generates expected smtlib2 string when choosing between two of three slots', () => {
    const z3ts = new Z3TimetableSolver(4);
    z3ts.addSlotConstraintsFulfilExactlyN([sc, sc2, sc3], 2);
    // Expect
    const expected = `(declare-fun ${SELECTOR_FULFIL_N_PREFIX}7 () Bool)
(declare-fun ${SELECTOR_FULFIL_N_PREFIX}8 () Bool)
(declare-fun ${SELECTOR_FULFIL_N_PREFIX}9 () Bool)
(declare-fun t0 () Int)
(declare-fun t2 () Int)
(assert (= ${SELECTOR_FULFIL_N_PREFIX}7 (= t0 7)))
(assert (= ${SELECTOR_FULFIL_N_PREFIX}8 (= t2 8)))
(assert (= ${SELECTOR_FULFIL_N_PREFIX}9 (= t0 9)))
(assert ((_ pbeq 2 1 1 1) ${SELECTOR_FULFIL_N_PREFIX}7 ${SELECTOR_FULFIL_N_PREFIX}8 ${SELECTOR_FULFIL_N_PREFIX}9))
(assert (or (= t0 7) (= t0 -1) (= t0 9)))
(assert (or (= t2 8) (= t2 -1)))
(declare-fun BUGFIX_VAR_DONTASK () Int)
(assert-soft (= BUGFIX_VAR_DONTASK 10))
(check-sat)
(get-model)
(get-objectives)
(exit)`;
    // Turn off randomization so that the generated string is also deterministic
    const actual = z3ts.generateSmtlib2String(false);
    expect(actual).toEqual(expected);
  });

  it('errors when slotConstraint when too small a time value is passed', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addSlotConstraintsFulfilExactlyN([sc2, scErrorSmaller], 1)).toThrow();
  });

  it('errors when slotConstraint when too large a time value is passed', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addSlotConstraintsFulfilExactlyN([sc2, scErrorLarger], 1)).toThrow();
  });

  it('errors when asked to choosing less than 0 slots', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addSlotConstraintsFulfilExactlyN([sc, sc2, sc3], -1)).toThrow();
  });
  it('errors when asked to choosing more than the passed slots', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addSlotConstraintsFulfilExactlyN([sc, sc2, sc3], 7)).toThrow();
  });
});

describe('setBooleanSelectorCosts', () => {
  it('generates expected smtlib2 string when setting basic workload costs', () => {
    const z3ts = new Z3TimetableSolver(4);
    const boolSelectorCosts: WorkloadCost[] = [
      {
        varname: 'v1',
        cost: 10,
      },
      {
        varname: 'v2',
        cost: 1,
      },
    ];
    const baseCost = 20;
    const minCost = 1;
    const maxCost = 45;
    z3ts.setBooleanSelectorCosts(boolSelectorCosts, baseCost, minCost, maxCost);
    const expected = `(declare-fun ${SELECTOR_OPTIONAL_PREFIX}v1 () Bool)
(declare-fun ${SELECTOR_OPTIONAL_PREFIX}v2 () Bool)
(declare-fun workloadsum () Int)
(assert (= workloadsum (+ ${baseCost} (ite ${SELECTOR_OPTIONAL_PREFIX}v1 10 0) (ite ${SELECTOR_OPTIONAL_PREFIX}v2 1 0))))
(assert (>= workloadsum ${minCost}))
(assert (<= workloadsum ${maxCost}))
(declare-fun BUGFIX_VAR_DONTASK () Int)
(assert-soft (= BUGFIX_VAR_DONTASK 10))
(check-sat)
(get-model)
(get-objectives)
(exit)`;
    // Turn off randomization so that the generated string is also deterministic
    const actual = z3ts.generateSmtlib2String(false);
    expect(actual).toEqual(expected);
  });

  // TODO: Test minCost > maxCost, baseCost > maxCost, etc, right now there are no UI preventions for this
  // This is OK since it will just return unsat.
});

describe('addNegativevalueSlotConstraintToNConsecutive', () => {
  it('generates expected smtlib2 string when asking for 2 consecutive slots out of a 3 slot period', () => {
    const z3ts = new Z3TimetableSolver(4);
    const scConsec: SlotConstraint = {
      startEndTimes: [[0, 3]],
      ownerId: 7,
      ownerString: '7',
    };
    z3ts.addNegativevalueSlotConstraintToNConsecutive(scConsec, 2);
    // This doesn't include t2 - t3 since a slotConstraint ending with 3 ==> we can't assign to the t3 slot
    // Note that the slots are asserted later to -1 because based on the calls here, they can only take the -1 value
    //   i.e., due to addPossibleValuesToVariable
    const expected = `(declare-fun t0 () Int)
(declare-fun t1 () Int)
(declare-fun t2 () Int)
(assert (or (and (<= t0 -1) (<= t1 -1)) (and (<= t1 -1) (<= t2 -1))))
(assert (= t0 -1))
(assert (= t1 -1))
(assert (= t2 -1))
(declare-fun BUGFIX_VAR_DONTASK () Int)
(assert-soft (= BUGFIX_VAR_DONTASK 10))
(check-sat)
(get-model)
(get-objectives)
(exit)`;
    // Turn off randomization so that the generated string is also deterministic
    const actual = z3ts.generateSmtlib2String(false);
    expect(actual).toEqual(expected);
  });

  it('errors when slotConstraint when too small a time value is passed', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addNegativevalueSlotConstraintToNConsecutive(scErrorSmaller, 1)).toThrow();
  });

  it('errors when slotConstraint when too large a time value is passed', () => {
    const z3ts = new Z3TimetableSolver(4);
    expect(() => z3ts.addNegativevalueSlotConstraintToNConsecutive(scErrorLarger, 1)).toThrow();
  });
});

describe('addCompactnessConstraint', () => {
  it('generates expected smtlib2 string when constraining compactness for all adjacent modules', () => {
    const z3ts = new Z3TimetableSolver(4);
    // sc1: [0, 1], scMiddle: [1, 2], sc2: [2, 3]
    // We will say that sc1 and scMiddle are in a "choose only 1" scenario
    // Then, assert sc2 unconditionally
    // Compactness should assert that t0 and t1 and t2 are all assigned
    const scMiddle: SlotConstraint = {
      startEndTimes: [[1, 2]],
      ownerId: 9,
      ownerString: '9',
    }; // ID 7 assigned to slots 0 and 1
    z3ts.addSlotConstraintsFulfilOnlyOne([sc, scMiddle]);
    z3ts.addSlotConstraintsFulfilOnlyOne([sc2]);
    z3ts.addCompactnessConstraint();
    // We expect to see the compactness constraint between t0, t1, and t2 since t1 is a possible choice and lies between them
    const expected = `(declare-fun SL_7_9 () Int)
(declare-fun t0 () Int)
(declare-fun t1 () Int)
(declare-fun SL_8 () Int)
(declare-fun t2 () Int)
(assert (or (= SL_7_9 7) (= SL_7_9 9)))
(assert (= (= SL_7_9 7) (= t0 7)))
(assert (= (= SL_7_9 9) (= t1 9)))
(assert (= SL_8 8))
(assert (= (= SL_8 8) (= t2 8)))
(assert (or (= t0 7) (= t0 -1)))
(assert (or (= t1 9) (= t1 -1)))
(assert (or (= t2 8) (= t2 -1)))
(assert-soft (= (>= t0 0) (or (= t1 t0) (and (not (= t1 t0)) (>= t1 0)))) :weight 1 :id nextvar)
(assert-soft (= (>= t1 0) (or (= t2 t1) (and (not (= t2 t1)) (>= t2 0)))) :weight 1 :id nextvar)
(declare-fun BUGFIX_VAR_DONTASK () Int)
(assert-soft (= BUGFIX_VAR_DONTASK 10))
(check-sat)
(get-model)
(get-objectives)
(exit)`;
    // Turn off randomization so that the generated string is also deterministic
    const actual = z3ts.generateSmtlib2String(false);
    expect(actual).toEqual(expected);
  });
  it('generates expected smtlib2 string without compactness clauses when no modules are adjacent', () => {
    const z3ts = new Z3TimetableSolver(4);
    z3ts.addSlotConstraintsFulfilOnlyOne([sc]);
    z3ts.addSlotConstraintsFulfilOnlyOne([sc2]);
    z3ts.addCompactnessConstraint();
    // We expect to see no compactness constraints (no assert-softs) since no lessons could possibly be placed next to each other
    const expected = `(declare-fun SL_7 () Int)
(declare-fun t0 () Int)
(declare-fun SL_8 () Int)
(declare-fun t2 () Int)
(assert (= SL_7 7))
(assert (= (= SL_7 7) (= t0 7)))
(assert (= SL_8 8))
(assert (= (= SL_8 8) (= t2 8)))
(assert (or (= t0 7) (= t0 -1)))
(assert (or (= t2 8) (= t2 -1)))
(declare-fun BUGFIX_VAR_DONTASK () Int)
(assert-soft (= BUGFIX_VAR_DONTASK 10))
(check-sat)
(get-model)
(get-objectives)
(exit)`;
    // Turn off randomization so that the generated string is also deterministic
    const actual = z3ts.generateSmtlib2String(false);
    expect(actual).toEqual(expected);
  });
});

it('randomness option generates string containing the options that enforce randomness', () => {
  const z3ts = new Z3TimetableSolver(4);
  const actual = z3ts.generateSmtlib2String(true);
  const randomPart1 = '(set-option :auto_config false)';
  const randomPart2 = '(set-option :smt.phase_selection 5)';
  const randomPart3 = '(set-option :smt.random-seed';
  expect(actual.includes(randomPart1)).toBeTruthy();
  expect(actual.includes(randomPart2)).toBeTruthy();
  expect(actual.includes(randomPart3)).toBeTruthy();
});
