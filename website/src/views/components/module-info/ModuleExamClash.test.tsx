import { shallow } from 'enzyme';

import { Module, ModuleCode } from 'types/modules';
import LinkModuleCodes from 'views/components/LinkModuleCodes';

import { CS1010S, CS3216 } from '__mocks__/modules';
import { ModuleExamClashComponent } from './ModuleExamClash';

describe(ModuleExamClashComponent, () => {
  const MODULES = [CS1010S, CS3216];

  function make(moduleCode: ModuleCode, examDate?: string, modules: Module[] = MODULES) {
    return shallow(
      <ModuleExamClashComponent
        moduleCode={moduleCode}
        modules={modules}
        examDate={examDate}
        semester={1}
      />,
    );
  }

  test('should return nothing if there are no existing modules', () => {
    const component = make('CS1010S', '2016-11-23T09:00+0800', []);
    expect(component.isEmptyRender()).toBe(true);
  });

  test('should return nothing if the current module has no exams', () => {
    const component = make('CS3217');
    expect(component.isEmptyRender()).toBe(true);
  });

  test('should return nothing if there are no clashes', () => {
    const component = make('CS2107', '2016-11-23T13:00+0800');
    expect(component.isEmptyRender()).toBe(true);
  });

  test('should ignore modules that are already on the timetable', () => {
    const component = make('CS1010S', '2016-11-23T09:00+0800');
    expect(component.isEmptyRender()).toBe(true);
  });

  test('should return all conflicting modules', () => {
    const component = make('CS1010E', '2017-11-29T17:00+0800');
    const link = component.find(LinkModuleCodes);
    expect(link.children().text()).toEqual('CS1010S');
  });
});
