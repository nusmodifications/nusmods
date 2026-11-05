import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import configureStore from 'bootstrapping/configure-store';
import { addPlannerProgramme } from 'actions/planner';
import PlannerSettings, { getYearLabels } from 'views/planner/PlannerSettings';

describe(getYearLabels, () => {
  test('should support negative offset', () => {
    expect(getYearLabels(-2, 2)).toEqual([
      '2015/2016',
      '2016/2017',
      '2017/2018', // Current year
      '2018/2019',
      '2019/2020',
    ]);
  });
});

describe('programme selection', () => {
  function makeSettings(initialProgrammes: string[] = []) {
    const { store } = configureStore();
    initialProgrammes.forEach((programmeId) => store.dispatch(addPlannerProgramme(programmeId)));
    const wrapper = mount(
      <Provider store={store}>
        <PlannerSettings onCloseButtonClicked={vi.fn()} />
      </Provider>,
    );
    return { store, wrapper };
  }

  test('should add the selected programme', () => {
    const { store, wrapper } = makeSettings();

    wrapper
      .find('select')
      .simulate('change', { target: { value: 'cs-focus-artificial-intelligence' } });

    expect(store.getState().planner.programmes).toEqual(['cs-focus-artificial-intelligence']);
  });

  test('should remove a selected programme', () => {
    const { store, wrapper } = makeSettings(['soc-minor-computer-science']);

    expect(wrapper.text()).toContain('Minor in Computer Science');
    wrapper.find('button.btn-outline-danger').simulate('click');

    expect(store.getState().planner.programmes).toEqual([]);
  });
});
