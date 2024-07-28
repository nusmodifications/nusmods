import { shallow, ShallowWrapper } from 'enzyme';
import { PlannerModuleInfo, Conflict } from 'types/planner';
import config from 'config';
import PlannerYear from './PlannerYear';
import PlannerSemester from './PlannerSemester';

function makePlannerYear(
  year: string,
  index: number,
  semesters: { [semester: string]: PlannerModuleInfo[] },
) {
  const addModule = jest.fn();
  const removeModule = jest.fn();
  const addCustomData = jest.fn();
  const setPlaceholderModule = jest.fn();
  const addModuleToTimetable = jest.fn();

  return shallow(
    <PlannerYear
      key={year}
      name={`Year ${index + 1}`}
      year={year}
      semesters={semesters}
      addModule={addModule}
      removeModule={removeModule}
      addCustomData={addCustomData}
      setPlaceholderModule={setPlaceholderModule}
      addModuleToTimetable={addModuleToTimetable}
    />,
  );
}

function findConflicts(wrapper: ShallowWrapper) {
  return wrapper
    .find(PlannerSemester)
    .props()
    .modules.every((moduleInfo) => moduleInfo.conflict !== null);
}

test('should show conflict for current year', () => {
  const conflict: Conflict = {
    type: 'semester',
    semestersOffered: [],
  };

  const semesters: { [semester: string]: PlannerModuleInfo[] } = {
    1: [
      {
        id: '0',
        moduleCode: 'UTC1702G',
        conflict,
      },
    ],
  };

  const wrapper = makePlannerYear(config.academicYear, 0, semesters);
  expect(findConflicts(wrapper)).toBe(true);
});

test('should not show conflict for non-current years', () => {
  const conflict: Conflict = {
    type: 'semester',
    semestersOffered: [],
  };

  const semesters = {
    1: [
      {
        id: '0',
        moduleCode: 'UTC1702G',
        conflict,
      },
    ],
  };

  const wrapper = makePlannerYear('2015/2016', 0, semesters);
  expect(findConflicts(wrapper)).toBe(false);
});
