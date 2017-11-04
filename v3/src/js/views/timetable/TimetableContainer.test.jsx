// @flow

import React from 'react';
import { shallow } from 'enzyme';
import type { Semester } from 'types/modules';
import type { SemTimetableConfig } from 'types/timetables';

// react-router-dom internal dependency, used here to construct the history
// object needed for testing. This is not added as a dev dependency to avoid
// version desync between the version depended on by react-router-dom
import createHistory from 'history/createMemoryHistory'; // eslint-disable-line import/no-extraneous-dependencies
import { timetablePage, fromSemester } from 'views/routes/paths';

import { TimetableContainerComponent } from './TimetableContainer';
import { deserializeTimetable } from '../../utils/timetables';

/* eslint-disable no-useless-computed-key */
const TIMETABLE: SemTimetableConfig = {
  CS2104: { Lecture: '1' },
  CS2105: { Lecture: '1' },
};
/* eslint-enable */

function create(semester: Semester, timetable: SemTimetableConfig) {
  const history = createHistory();
  const path = timetablePage(semester);
  const match = {
    path,
    url: path,
    isExact: true,
    params: { semester: fromSemester[semester] },
  };

  return {
    history,
    wrapper: shallow(
      <TimetableContainerComponent
        history={history}
        location={history.location}
        match={match}
        semester={semester}
        timetable={timetable}
        selectSemester={jest.fn()}
        setTimetable={jest.fn()}
        fetchModule={jest.fn()}
      />,
    ),
  };
}

test('should not have query string when there are no modules selected', () => {
  expect(create(1, {}).history.location.search).toBe('');
});

test('should update query string when timetable changes', () => {
  const container = create(1, TIMETABLE);
  expect(container.history.location.search).toMatch('CS2104');
  expect(container.history.location.search).toMatch('CS2105');

  // Simulate lesson choice update
  container.wrapper.setProps({
    timetable: {
      CS2104: { Lecture: '2' },
      CS2105: { Lecture: '1' },
    },
  });
  expect(deserializeTimetable(container.history.location.search).CS2104.Lecture)
    .toBe('2');

  // Simulate deleting module
  container.wrapper.setProps({
    timetable: {
      CS2104: { Lecture: '2' },
    },
  });
  expect(container.history.location.search).not.toMatch('CS2105');
});
