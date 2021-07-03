import { Z3WeekSolver } from 'utils/optimizer/z3WeekSolver';

test('should generate 1-vector correctly', () => {
  const solver = new Z3WeekSolver(3);
  expect(solver.generateOne()).toEqual('#b001');
});

test('should generate 0-vector correctly', () => {
  const solver = new Z3WeekSolver(3);
  expect(solver.generateZero()).toEqual('#b000');
});

test('should generate 3-week popCnt correctly', () => {
  const solver = new Z3WeekSolver(3);
  expect(solver.generatePopcnt()).toEqual(`(define-fun popCount13 ((x (_ BitVec 3))) (_ BitVec 3)
(bvadd
(ite (= #b1 ((_ extract 0 0) x)) #b001 #b000)
(ite (= #b1 ((_ extract 1 1) x)) #b001 #b000)
(ite (= #b1 ((_ extract 2 2) x)) #b001 #b000)
))`);
});

test('should generate 3-week bitvec correctly', () => {
  const solver = new Z3WeekSolver(3);
  expect(solver.generateBitvec([0, 1, 0])).toEqual('#b010');
});

test('should error when 3-week bitvec is too small', () => {
  const solver = new Z3WeekSolver(3);
  expect(() => solver.generateBitvec([0, 1])).toThrow(Error);
});

test('should error when 3-week bitvec is too large', () => {
  const solver = new Z3WeekSolver(3);
  expect(() => solver.generateBitvec([0, 1, 0, 1])).toThrow(Error);
});

test('should declare bitvec for 3-week case correctly', () => {
  const solver = new Z3WeekSolver(3);
  expect(solver.generateDecl('testvar').toString()).toEqual(
    '(declare-fun testvar () (_ BitVec 3))',
  );
});

test('should create 6 week solver string correctly (manually generated smtlib code from external tools)', () => {
  // Y M D H M (10:30)
  const solver = new Z3WeekSolver(6);
  solver.addWeeks([2, 4, 6], 'x');
  solver.addWeeks([4, 6], 'y');
  solver.addWeeks([1], 'z');
  const outStr = solver.generateSmtlib2String();
  expect(outStr).toEqual(`(declare-fun weeks_to_simulate () (_ BitVec 6))
(define-fun popCount13 ((x (_ BitVec 6))) (_ BitVec 6)
(bvadd
(ite (= #b1 ((_ extract 0 0) x)) #b000001 #b000000)
(ite (= #b1 ((_ extract 1 1) x)) #b000001 #b000000)
(ite (= #b1 ((_ extract 2 2) x)) #b000001 #b000000)
(ite (= #b1 ((_ extract 3 3) x)) #b000001 #b000000)
(ite (= #b1 ((_ extract 4 4) x)) #b000001 #b000000)
(ite (= #b1 ((_ extract 5 5) x)) #b000001 #b000000)
))
(declare-fun x () (_ BitVec 6))
(assert (= x #b010101))
(assert (not (= (bvand x weeks_to_simulate) #b000000)))
(declare-fun y () (_ BitVec 6))
(assert (= y #b000101))
(assert (not (= (bvand y weeks_to_simulate) #b000000)))
(declare-fun z () (_ BitVec 6))
(assert (= z #b100000))
(assert (not (= (bvand z weeks_to_simulate) #b000000)))
(minimize (popCount13 weeks_to_simulate))
(check-sat)
(get-value (weeks_to_simulate))
(exit)`);
});
