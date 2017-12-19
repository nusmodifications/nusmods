// @flow

import React from 'react';
import ScrollSpy from 'react-scrollspy';
import { shallow } from 'enzyme';

import type { Module } from 'types/modules';
import type { TimetableConfig } from 'types/timetables';
/** @var {Module} */
import CS1010S from '__mocks__/modules/CS1010S.json';

import { ModulePageContentComponent } from './ModulePageContent';

// Cannot use _.noop - https://github.com/istanbuljs/babel-plugin-istanbul/issues/116
const noop = () => {};

describe('<ModulePageContent>', () => {
  function make(module: Module = CS1010S, timetables: TimetableConfig = {}) {
    return shallow(
      <ModulePageContentComponent
        module={module}
        timetables={timetables}
        addModule={noop}
        removeModule={noop}
      />,
    );
  }

  test('side menu items should appear in the same order in the document', () => {
    const component = make();
    expect(component.find('[id]').map(ele => ele.prop('id')))
      .toEqual(component.find(ScrollSpy).prop('items'));
  });
});
