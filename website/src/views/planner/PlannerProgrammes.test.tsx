import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import { ModuleCode } from 'types/modules';
import configureStore from 'bootstrapping/configure-store';
import createHistory from 'test-utils/createHistory';
import { addPlannerModule, addPlannerProgramme } from 'actions/planner';
import PlannerProgrammes from './PlannerProgrammes';

function makePlannerProgrammes(programmeIds: string[], moduleCodes: ModuleCode[] = []) {
  const { store } = configureStore();
  const { history } = createHistory();

  programmeIds.forEach((programmeId) => store.dispatch(addPlannerProgramme(programmeId)));
  moduleCodes.forEach((moduleCode) =>
    store.dispatch(addPlannerModule('2023/2024', 1, { type: 'module', moduleCode })),
  );

  return mount(
    <Provider store={store}>
      <Router history={history}>
        <PlannerProgrammes />
      </Router>
    </Provider>,
  );
}

test('should render nothing when no programmes are selected', () => {
  const wrapper = makePlannerProgrammes([]);
  expect(wrapper.find(PlannerProgrammes).isEmptyRender()).toBe(true);
});

test('should show unfulfilled requirements for an empty plan', () => {
  const wrapper = makePlannerProgrammes(['cs-focus-artificial-intelligence']);

  expect(wrapper.text()).toContain('Artificial Intelligence');
  expect(wrapper.text()).toContain('Focus Area');
  expect(wrapper.text()).toContain('0/1 courses');
  expect(wrapper.text()).toContain('0/2 courses');
});

test('should show progress once matching modules are planned', () => {
  const wrapper = makePlannerProgrammes(
    ['cs-focus-artificial-intelligence'],
    ['CS3243', 'CS3244', 'CS4243'],
  );

  const text = wrapper.text();
  // CS4243 routes to the level-4000 requirement, CS3243 and CS3244 to the rest
  expect(text).toContain('1/1 courses');
  expect(text).toContain('2/2 courses');
  expect(text).toContain('CS3243, CS3244');
});
