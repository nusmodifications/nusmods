import ScrollSpy from 'react-scrollspy';
import { shallow } from 'enzyme';

import { Module } from 'types/modules';
/** @var {Module} */
import { CS1010S } from '__mocks__/modules';

import ModulePageContent from './ModulePageContent';

describe(ModulePageContent, () => {
  function make(module: Module = CS1010S) {
    return shallow(<ModulePageContent module={module} />);
  }

  test('side menu items should appear in the same order in the document', () => {
    const component = make();
    expect(component.find('[id]').map((ele) => ele.prop('id'))).toEqual(
      component.find(ScrollSpy).prop('items'),
    );
  });
});
