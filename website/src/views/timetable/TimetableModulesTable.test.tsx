import { shallow, ShallowWrapper } from 'enzyme';

import { CS1010S, CS3216, CS4243 } from '__mocks__/modules';
import { addColors } from 'test-utils/theme';

import { TimetableModulesTableComponent, Props } from './TimetableModulesTable';
import styles from './TimetableModulesTable.scss';

function make(props: Partial<Props> = {}) {
  const addModule = jest.fn();
  const editCustomModule = jest.fn();
  const selectModuleColor = jest.fn();
  const hideLessonInTimetable = jest.fn();
  const showLessonInTimetable = jest.fn();
  const enableTaModeInTimetable = jest.fn();
  const disableTaModeInTimetable = jest.fn();
  const onRemoveModule = jest.fn();
  const resetTombstone = jest.fn();
  const onRemoveCustomModule = jest.fn();

  const wrapper = shallow(
    <TimetableModulesTableComponent
      semester={1}
      readOnly={false}
      horizontalOrientation={false}
      moduleTableOrder="exam"
      modules={[]}
      tombstone={null}
      addModule={addModule}
      editCustomModule={editCustomModule}
      selectModuleColor={selectModuleColor}
      hideLessonInTimetable={hideLessonInTimetable}
      showLessonInTimetable={showLessonInTimetable}
      enableTaModeInTimetable={enableTaModeInTimetable}
      disableTaModeInTimetable={disableTaModeInTimetable}
      onRemoveModule={onRemoveModule}
      onRemoveCustomModule={onRemoveCustomModule}
      resetTombstone={resetTombstone}
      customLessons={[]}
      {...props}
    />,
  );

  return {
    wrapper,
    selectModuleColor,
    onRemoveModule,
    hideLessonInTimetable,
    showLessonInTimetable,
    resetTombstone,
  };
}

function getModules(wrapper: ShallowWrapper) {
  return wrapper.find(`.${styles.modulesTableRow}`).map((ele) => ele.key());
}

function getButtons(wrapper: ShallowWrapper) {
  return wrapper.find(`.${styles.moduleActionButtons} > .btn-group`);
}

describe(TimetableModulesTableComponent, () => {
  const modules = addColors([CS1010S, CS3216]);

  it('should render when empty', () => {
    const { wrapper } = make();
    expect(wrapper.childAt(0).children()).toHaveLength(0);
  });

  it('should display modules in the correct order', () => {
    const orderByExam = getModules(make({ modules }).wrapper);
    expect(orderByExam).toEqual(['CS3216', 'CS1010S']);

    const orderByModuleCode = getModules(make({ modules, moduleTableOrder: 'code' }).wrapper);
    expect(orderByModuleCode).toEqual(['CS1010S', 'CS3216']);
  });

  it('should add tombstone modules back in the correct position', () => {
    // Get the original module order rendering CS1010S, CS4243 and CS3216
    const originalOrder = getModules(
      make({ modules: addColors([CS1010S, CS4243, CS3216]) }).wrapper,
    );

    // Replace CS4243 with a tombstone and check if it remains in the same place
    const tombstone = {
      ...CS4243,
      index: 1,
      colorIndex: 2,
      isHiddenInTimetable: false,
      isTaInTimetable: false,
      canTa: false,
    };

    const moduleCodes = getModules(
      make({ modules: addColors([CS1010S, CS3216]), tombstone }).wrapper,
    );

    expect(moduleCodes).toEqual(originalOrder);
  });

  it('should display buttons correctly', () => {
    // TA button is the 3rd button
    const withoutTaButton = getButtons(make({ modules: addColors([CS1010S]) }).wrapper);
    expect(withoutTaButton.at(0).children()).toHaveLength(2);

    const modulesWithTaAbleModule = addColors([CS1010S], false, false, true);
    const withTaButton = getButtons(make({ modules: modulesWithTaAbleModule }).wrapper);
    expect(withTaButton.at(0).children()).toHaveLength(3);
  });
});
