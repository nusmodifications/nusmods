import { BFS1001, CS1010S, CS3216 } from '__mocks__/modules';
import { TaModulesConfig } from 'types/timetables';
import { countShownMCs, countTotalMCs } from './ModulesTableFooter';

describe(countTotalMCs, () => {
  it('should count total MCs', () => {
    const modules = [BFS1001, CS1010S, CS3216];
    expect(countTotalMCs(modules)).toEqual(9);
  });
});

describe(countShownMCs, () => {
  it('should not count hidden modules', () => {
    const modules = [BFS1001, CS1010S, CS3216];
    const hiddenInTimetable = [CS3216.moduleCode];
    expect(countShownMCs(modules, hiddenInTimetable, {})).toEqual(4);
  });

  it('should not count TA modules', () => {
    const modules = [BFS1001, CS1010S, CS3216];
    const taInTimetable: TaModulesConfig = {
      [CS1010S.moduleCode]: [],
      [CS3216.moduleCode]: ['Tutorial'],
    };
    expect(countShownMCs(modules, [], taInTimetable)).toEqual(4);
  });
});
