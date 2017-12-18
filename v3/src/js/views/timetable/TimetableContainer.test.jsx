// @flow

import React from 'react';
import { Redirect } from 'react-router-dom';
import { shallow } from 'enzyme';
import type { SemTimetableConfig } from 'types/timetables';
import type { ModulesMap } from 'reducers/entities/moduleBank';

// react-router-dom internal dependency, used here to construct the history
// object needed for testing. This is not added as a dev dependency to avoid
// version desync between the version depended on by react-router-dom
import createHistory from 'history/createMemoryHistory'; // eslint-disable-line import/no-extraneous-dependencies

import { timetablePage, semesterForTimetablePage, timetableShare } from 'views/routes/paths';
import NotFoundPage from 'views/errors/NotFoundPage';

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
  const history = createHistory({ initialEntries: [path] });
  const match = {
    path,
    params,
    url: path,
    isExact: true,
  };

  const selectSemester = jest.fn();
  const setTimetable = jest.fn();
  const fetchModule = jest.fn();

  return {
    history,
    selectSemester,
    setTimetable,
    fetchModule,

    wrapper: shallow(
      <TimetableContainerComponent
        history={history}
        location={history.location}
        match={match}

        activeSemester={1}
        semester={semesterForTimetablePage(params.semester)}
        timetable={timetable}
        colors={{}}
        modules={modules}

        selectSemester={selectSemester}
        setTimetable={setTimetable}
        fetchModule={fetchModule}
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

test('should redirect to activeSemester when semester is empty', () => {
  const wrapper = create('/timetable').wrapper;

  expect(wrapper.type()).toEqual(Redirect);
  expect(wrapper.props()).toMatchObject({ to: timetablePage(1) });
});

test('should show 404 when the URL is invalid', () => {
  expect(create('/timetable/hello', { semester: 'hello' })
    .wrapper.type()).toEqual(NotFoundPage);

  expect(create('/timetable/sem-1/hello', { semester: '1', action: 'hello' })
    .wrapper.type()).toEqual(NotFoundPage);
});

test('should load modules from imported timetable', () => {
  const container = createWithImport({ CS2105: { Lecture: '1' } });
  expect(container.fetchModule).toBeCalledWith('CS2105');
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
  const timetable = { CS2105: { Lecture: '1' } };

  const wrapper = create(timetablePage(semester), { semester: 'sem-1' }, timetable).wrapper;
  const timetableContentWrapper = wrapper.children(TimetableContent);
  expect(timetableContentWrapper.type()).toEqual(TimetableContent);
  expect(timetableContentWrapper.props()).toMatchObject({
    timetable,
    readOnly: false,
  });
});
