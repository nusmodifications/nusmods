import mergeModuleFields from './mergeModuleFields';

describe('mergeModuleFields', () => {
  const mockLog = {
    info: jest.fn(),
    warn: jest.fn(),
  };
  const testModuleCode = 'test';
  const testMergeModule = mergeModuleFields(mockLog, testModuleCode);

  beforeEach(() => {
    Object.values(mockLog).forEach((mock) => {
      mock.mockReset();
    });
  });

  it('throws when module codes are incorrect', () => {
    expect(() => testMergeModule(
      { ModuleCode: testModuleCode },
      { ModuleCode: 'test1' },
    )).toThrow();
    expect(() => testMergeModule(
      { ModuleCode: 'test1' },
      { ModuleCode: testModuleCode },
    )).toThrow();
  });

  it('does not throws when module codes are the correct', () => {
    expect(() => testMergeModule(
      { ModuleCode: testModuleCode },
      { ModuleCode: testModuleCode },
    )).not.toThrow();
  });

  it('merges whichever side that has data', () => {
    const testModule = { Data: 'testData' };
    expect(testMergeModule(
      testModule,
      { Data: '' },
    )).toEqual(testModule);
    expect(testMergeModule(
      { Data: '' },
      testModule,
    )).toEqual(testModule);
  });

  it('removes null data', () => {
    const testModules = [
      { Data: 'nil' },
      { Data: 'n.a.' },
      { Data: 'none' },
      { Data: 'null' },
    ];
    const relevantModule = { Data: 'relevant' };
    testModules.forEach((mod) => {
      expect(testMergeModule(
        mod,
        relevantModule,
      )).toEqual(relevantModule);
      expect(testMergeModule(
        relevantModule,
        mod,
      )).toEqual(relevantModule);
    });
  });

  it('merges whichever side that has strictly more words', () => {
    const testModule = { Data: 'more data' };
    const testModule1 = { Data: 'data' };
    expect(testMergeModule(
      testModule,
      testModule1,
    )).toEqual(testModule);
    expect(testMergeModule(
      testModule1,
      testModule,
    )).toEqual(testModule);
  });

  it('merges whichever side that has a larger array', () => {
    const testModule = { Data: ['more', 'data'] };
    const testModule1 = { Data: ['data'] };
    expect(testMergeModule(
      testModule,
      testModule1,
    )).toEqual(testModule);
    expect(testMergeModule(
      testModule1,
      testModule,
    )).toEqual(testModule);
  });

  it('merges whichever side that has larger object', () => {
    const testModule = { Data: { field1: 'data', field2: 'more data' } };
    const testModule1 = { Data: { field1: 'data' } };
    expect(testMergeModule(
      testModule,
      testModule1,
    )).toEqual(testModule);
    expect(testMergeModule(
      testModule1,
      testModule,
    )).toEqual(testModule);
  });

  it('logs the difference when unable to differentiate [info level]', () => {
    const testModule = { Data: 'this has data' };
    const testModule1 = { Data: 'also has data, but different' };
    expect(testMergeModule(
      testModule,
      testModule1,
    )).toEqual(testModule1);
    expect(mockLog.info).toHaveBeenCalled();
  });

  it('logs the difference when unable to differentiate [warn level]', () => {
    const testModule = { ExamDate: 'this has data' };
    const testModule1 = { ExamDate: 'also has data, but different' };
    expect(testMergeModule(
      testModule,
      testModule1,
    )).toEqual(testModule1);
    expect(mockLog.warn).toHaveBeenCalled();
  });
});
