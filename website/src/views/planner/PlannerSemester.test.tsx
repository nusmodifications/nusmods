import { mount } from 'enzyme';
import { DragDropContextProps, DraggableProps, DroppableProps } from 'react-beautiful-dnd';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import { PlannerModuleInfo, Conflict } from 'types/planner';
import configureStore from 'bootstrapping/configure-store';
import createHistory from 'test-utils/createHistory';
import config from 'config';
import PlannerSemester from './PlannerSemester';
import plannerModuleStyles from './PlannerModule.scss';

jest.mock('react-beautiful-dnd', () => ({
  Droppable: ({ children }: DroppableProps) => children({} as any, {} as any),
  Draggable: ({ children }: DraggableProps) => children({} as any, {} as any, {} as any),
  DragDropContext: ({ children }: DragDropContextProps) => children,
}));

function makePlannerSemester(year: string, semester: number, modules: PlannerModuleInfo[]) {
  const { store } = configureStore();
  const { history } = createHistory();

  const addModule = jest.fn();
  const removeModule = jest.fn();
  const addCustomData = jest.fn();
  const setPlaceholderModule = jest.fn();
  const addModuleToTimetable = jest.fn();

  return mount(
    <Provider store={store}>
      <Router history={history}>
        <PlannerSemester
          year={year}
          semester={semester}
          modules={modules}
          addModule={addModule}
          removeModule={removeModule}
          addCustomData={addCustomData}
          setPlaceholderModule={setPlaceholderModule}
          addModuleToTimetable={addModuleToTimetable}
        />
      </Router>
    </Provider>,
  );
}

test('should show conflicts for current year', () => {
  const conflicts: Conflict[] = [
    {
      type: 'semester',
      semestersOffered: [],
    },
  ];

  const modules: PlannerModuleInfo[] = [
    {
      id: '0',
      moduleCode: 'UTC1702G',
      conflicts,
    },
  ];

  const wrapper = makePlannerSemester(config.academicYear, 1, modules);
  expect(wrapper.find(`.${plannerModuleStyles.conflicts}`).exists()).toBe(true);
});

test('should not show conflicts for non-current years', () => {
  const conflicts: Conflict[] = [
    {
      type: 'semester',
      semestersOffered: [],
    },
  ];

  const modules: PlannerModuleInfo[] = [
    {
      id: '0',
      moduleCode: 'UTC1702G',
      conflicts,
    },
  ];

  const wrapper = makePlannerSemester('2015/2016', 1, modules);
  expect(wrapper.find(`.${plannerModuleStyles.conflicts}`).exists()).toBe(false);
});
