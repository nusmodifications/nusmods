import {
  PlannerTimeSchema,
  CustomModuleSchema,
  CustomModuleDataSchema,
  PlannerStateSchema,
} from './planner';

describe('PlannerTimeSchema', () => {
  it('passes with moduleCode only', () => {
    const data = {
      id: '1',
      year: '2024',
      semester: 1,
      index: 0,
      moduleCode: 'CS1010',
    };
    expect(() => PlannerTimeSchema.parse(data)).not.toThrow();
  });

  it('passes with placeholderId only', () => {
    const data = {
      id: '2',
      year: '2024',
      semester: 2,
      index: 1,
      placeholderId: 'geq',
    };
    expect(() => PlannerTimeSchema.parse(data)).not.toThrow();
  });

  it('fails without moduleCode and placeholderId', () => {
    const data = {
      id: '3',
      year: '2024',
      semester: 1,
      index: 0,
    };
    expect(() => PlannerTimeSchema.parse(data)).toThrow();
  });
});

describe('CustomModuleSchema', () => {
  it('passes with valid data', () => {
    expect(() =>
      CustomModuleSchema.parse({
        title: 'Prompt Engineering',
        moduleCredit: 4,
      }),
    ).not.toThrow();
  });

  it('passes with null title', () => {
    expect(() =>
      CustomModuleSchema.parse({
        title: null,
        moduleCredit: 4,
      }),
    ).not.toThrow();
  });

  it('fails if moduleCredit is missing', () => {
    expect(() =>
      CustomModuleSchema.parse({
        title: 'No Credit',
      }),
    ).toThrow();
  });
});

describe('CustomModuleDataSchema', () => {
  it('parses a record of custom modules', () => {
    const data = {
      CS1010A: {
        title: 'CS1010B',
        moduleCredit: 4,
      },
      CS1010S: {
        title: null,
        moduleCredit: 2,
      },
    };
    expect(() => CustomModuleDataSchema.parse(data)).not.toThrow();
  });

  it('fails if any module is invalid', () => {
    const data = {
      invalidMod: {
        title: 'CS1010C',
        moduleCredit: null,
      },
    };
    expect(() => CustomModuleDataSchema.parse(data)).toThrow();
  });
});

describe('PlannerStateSchema', () => {
  it('parses valid planner state', () => {
    const data = {
      minYear: '2024',
      maxYear: '2028',
      iblocs: true,
      modules: {
        '0': {
          id: '1',
          year: '2024',
          semester: 1,
          index: 0,
          moduleCode: 'CS1231S',
        },
        '1': {
          id: '1',
          year: '2024',
          semester: 1,
          index: 1,
          moduleCode: 'CS2030S',
        },
      },
      custom: {
        CS1010A: {
          title: 'CS1010B',
          moduleCredit: 4,
        },
      },
    };
    expect(() => PlannerStateSchema.parse(data)).not.toThrow();
  });

  it('fails if a module inside modules is invalid', () => {
    const data = {
      minYear: '2024',
      maxYear: '2028',
      iblocs: false,
      modules: {
        'mod-bad': {
          id: 'bad',
          year: '2025',
          semester: 1,
          index: 0,
        },
      },
      custom: {},
    };
    expect(() => PlannerStateSchema.parse(data)).toThrow();
  });

  it('removes _persist', () => {
    const data = {
      minYear: '2024',
      maxYear: '2028',
      iblocs: true,
      modules: {
        '0': {
          id: '1',
          year: '2024',
          semester: 1,
          index: 0,
          moduleCode: 'CS1231S',
        },
      },
      custom: {},
    };
    const dataWithPersistConfig = {
      ...data,
      _persist: {
        version: 1,
        rehydrated: true,
      },
    };

    const parsed = PlannerStateSchema.safeParse(dataWithPersistConfig);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(data);
  });
});
