import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { Module, ModuleCode } from 'types/modules';
import { CS1010S, CS3216 } from '__mocks__/modules';
import configureStore from 'bootstrapping/configure-store';
import reducers from 'reducers';
import { initAction } from 'test-utils/redux';

import { ModuleExamClashComponent } from './ModuleExamClash';

const initialState = reducers(undefined, initAction());

describe(ModuleExamClashComponent, () => {
  const MODULES = [CS1010S, CS3216];

  function make(moduleCode: ModuleCode, examDate?: string, modules: Module[] = MODULES) {
    const { store } = configureStore(initialState);
    return render(
      <Provider store={store}>
        <ModuleExamClashComponent
          moduleCode={moduleCode}
          modules={modules}
          examDate={examDate}
          semester={1}
        />
      </Provider>,
    );
  }

  test('should return nothing if there are no existing modules', () => {
    const { container } = make('CS1010S', '2016-11-23T09:00+0800', []);
    expect(container).toBeEmptyDOMElement();
  });

  test('should return nothing if the current module has no exams', () => {
    const { container } = make('CS3217');
    expect(container).toBeEmptyDOMElement();
  });

  test('should return nothing if there are no clashes', () => {
    const { container } = make('CS2107', '2016-11-23T13:00+0800');
    expect(container).toBeEmptyDOMElement();
  });

  test('should ignore modules that are already on the timetable', () => {
    const { container } = make('CS1010S', '2016-11-23T09:00+0800');
    expect(container).toBeEmptyDOMElement();
  });

  test('should return all conflicting modules', () => {
    make('CS1010E', '2017-11-29T17:00+0800');
    expect(screen.getByText(/exams at the same time/)).toHaveTextContent(
      /^Your course CS1010S has exams at the same time$/,
    );
  });
});
