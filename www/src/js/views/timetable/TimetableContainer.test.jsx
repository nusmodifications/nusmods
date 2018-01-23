// @flow

import React from 'react';
import { Redirect } from 'react-router-dom';
import { shallow, type ShallowWrapper } from 'enzyme';
import type { SemTimetableConfig } from 'types/timetables';
import type { ModulesMap } from 'reducers/moduleBank';

import createHistory from 'test-utils/createHistory';

import { timetablePage, semesterForTimetablePage, timetableShare } from 'views/routes/paths';

/** @var {Module} */
import CS1010S from '__mocks__/modules/CS1010S.json';
/** @var {Module} */
import CS3216 from '__mocks__/modules/CS3216.json';

import { TimetableContainerComponent } from './TimetableContainer';
import TimetableContent from './TimetableContent';
import LoadingSpinner from '../components/LoadingSpinner';

function create(
  path: string,
  params: { [string]: ?string } = {},
  timetable: SemTimetableConfig = {},
  modules: ModulesMap = { CS1010S, CS3216 },
) {
  const router = createHistory(path);
  router.match.params = params;

  const selectSemester = jest.fn();
  const setTimetable = jest.fn();
  const fetchTimetableModules = jest.fn();
  const openNotification = jest.fn();
  const undo = jest.fn();

  return {
    selectSemester,
    setTimetable,
    fetchTimetableModules,
    history: router.history,

    wrapper: shallow(
      <TimetableContainerComponent
        activeSemester={1}
        semester={semesterForTimetablePage(params.semester)}
        timetable={timetable}
        colors={{}}
        modules={modules}
        isV2TimetableMigrated
        selectSemester={selectSemester}
        setTimetable={setTimetable}
        fetchTimetableModules={fetchTimetableModules}
        openNotification={openNotification}
        undo={undo}
        {...router}
      />,
    ),
  };
}

function createWithImport(
  importedTimetable: SemTimetableConfig,
  modules: ModulesMap = {},
  existingTimetable: SemTimetableConfig = {},
) {
  const semester = 1;
  const path = timetableShare(semester, importedTimetable);
  return create(path, { semester: 'sem-1', action: 'share' }, existingTimetable, modules);
}

function expectRedirect(wrapper: ShallowWrapper, to = timetablePage(1)) {
  expect(wrapper.type()).toEqual(Redirect);
  expect(wrapper.prop('to')).toEqual(to);
}

test('should redirect to activeSemester when semester is empty', () => {
  expectRedirect(create('/timetable').wrapper);
});

test('should redirect to homepage when the URL is invalid', () => {
  expectRedirect(create('/timetable/hello', { semester: 'hello' }).wrapper);
  expectRedirect(create('/timetable/sem-3', { semester: 'sem-3' }).wrapper);
  expectRedirect(create('/timetable/sem-1/hello', { semester: '1', action: 'hello' }).wrapper);
  expectRedirect(create('/timetable/2017-2018', { semester: '2017-2018' }).wrapper);
  expectRedirect(
    create('/timetable/2017-2018/sem2', { semester: '2017-2018', action: 'sem2' }).wrapper,
  );
  expectRedirect(
    create('/timetable/2017-2018/share', { semester: '2017-2018', action: 'share' }).wrapper,
  );
  expectRedirect(
    create('/timetable/2017-2018/v1', { semester: '2017-2018', action: 'v1' }).wrapper,
  );
});

test('should load modules from imported timetable', () => {
  const timetable = { CS2105: { Lecture: '1' } };
  const container = createWithImport(timetable);
  expect(container.fetchTimetableModules).toBeCalledWith([timetable]);
});

test('should display spinner when loading modules', () => {
  const timetable = { CS2105: { Lecture: '1' } };
  const wrapper = createWithImport(timetable).wrapper;

  expect(wrapper.type()).toEqual(LoadingSpinner);
});

test('should display imported timetable', () => {
  const timetable = { CS2105: { Lecture: '1' } };
  const wrapper = createWithImport(timetable, { CS2105: CS3216 }).wrapper;
  const timetableContentWrapper = wrapper.children(TimetableContent);
  expect(timetableContentWrapper.type()).toEqual(TimetableContent);
  expect(timetableContentWrapper.props()).toMatchObject({
    timetable,
    readOnly: true,
  });
});

test('should display saved timetable when there is no imported timetable', () => {
  const semester = 1;
  const timetable = { CS1010S: { Lecture: '1' } };

  const wrapper = create(timetablePage(semester), { semester: 'sem-1' }, timetable).wrapper;
  const timetableContentWrapper = wrapper.children(TimetableContent);
  expect(timetableContentWrapper.type()).toEqual(TimetableContent);
  expect(timetableContentWrapper.props()).toMatchObject({
    timetable,
    readOnly: false,
  });
});
