import { cancelModifyLesson, changeLesson, modifyLesson } from 'actions/timetables';
import { openNotification, popNotification, setOnlineStatus } from 'actions/app';
import { selectSemester } from 'actions/settings';

import reducer from 'reducers/app';

import { Semester } from 'types/modules';
import { AppState } from 'types/reducers';
import { initAction } from 'test-utils/redux';
import lessons from '__mocks__/lessons-array.json';
import { Lesson } from 'types/timetables';

const semester: Semester = 1;
const anotherSemester: Semester = 2;
const lesson: Lesson = lessons[0];
const appInitialState: AppState = {
  activeSemester: semester,
  activeLesson: null,
  isOnline: true,
  isFeedbackModalOpen: false,
  promptRefresh: false,
  notifications: [],
};
const appHasSemesterTwoState: AppState = { ...appInitialState, activeSemester: anotherSemester };
const appHasActiveLessonState: AppState = { ...appInitialState, activeLesson: lesson };

test('app should return initial state', () => {
  const nextState: AppState = reducer(undefined, initAction());

  expect(nextState).toEqual(appInitialState);
});

// Tests for active semester.
test('app should set active semester', () => {
  const action = selectSemester(anotherSemester);
  const nextState: AppState = reducer(appInitialState, action);

  expect(nextState).toEqual(appHasSemesterTwoState);
});

// Tests for active lesson.
test('app should instantiate active lesson', () => {
  const action = modifyLesson(lesson);
  const nextState: AppState = reducer(appInitialState, action);

  expect(nextState).toEqual(appHasActiveLessonState);
});

test('app should set active lesson', () => {
  const anotherLesson: Lesson = lessons[1];
  const action = modifyLesson(anotherLesson);
  const nextState: AppState = reducer(appHasActiveLessonState, action);

  expect(nextState).toEqual({ ...appInitialState, activeLesson: anotherLesson });
});

test('app should accept lesson change and unset active lesson', () => {
  const action = changeLesson(semester, lesson);
  const nextState: AppState = reducer(appInitialState, action);

  expect(nextState).toEqual(appInitialState);
});

test('app should cancel and unset active lesson', () => {
  const nextState: AppState = reducer(appHasActiveLessonState, cancelModifyLesson());

  expect(nextState).toEqual(appInitialState);
});

test('app should subscribe to online status action', () => {
  const nextState = reducer(appInitialState, setOnlineStatus(false));
  expect(nextState).toHaveProperty('isOnline', false);
  expect(reducer(nextState, setOnlineStatus(true))).toHaveProperty('isOnline', true);
});

describe('notification reducers', () => {
  test('queue notifications', () => {
    let state = reducer(appInitialState, openNotification('New notification'));
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0]).toMatchObject({
      message: 'New notification',
    });

    state = reducer(state, openNotification('Second notification'));
    expect(state.notifications).toHaveLength(2);
    expect(state.notifications[1]).toMatchObject({
      message: 'Second notification',
    });
  });

  test('allow new notification to overwrite overwritable notifications', () => {
    let state = appInitialState;

    // Any incoming notification should overwrite an overwritable notification
    state = reducer(
      state,
      openNotification('New notification', {
        overwritable: true,
      }),
    );
    state = reducer(state, openNotification('Second notification'));

    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0]).toMatchObject({ message: 'Second notification' });

    // Overwritable notifications are discarded if there's already another, non-overwritable
    // notification in the queue
    state = reducer(
      state,
      openNotification('Third notification', {
        overwritable: true,
      }),
    );
    expect(state.notifications).toHaveLength(1);

    // Non-overwritable notifications queue up normally
    state = reducer(state, openNotification('Fourth notification'));
    expect(state.notifications).toHaveLength(2);
    expect(state.notifications[1]).toMatchObject({
      message: 'Fourth notification',
    });
  });

  test('allow new priority notification to trump existing ones', () => {
    let state = appInitialState;
    state = reducer(
      state,
      openNotification('New notification', {
        overwritable: true,
        priority: true,
      }),
    );

    // Expect overwritable priority notification to be overwritten
    state = reducer(state, openNotification('Second notification'));
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0]).toMatchObject({ message: 'Second notification' });

    // Expect priority notification to be inserted at the front of the queue
    const pNotif3 = { message: 'Third notification', priority: true };
    state = reducer(state, openNotification(pNotif3.message, { priority: pNotif3.priority }));
    expect(state.notifications).toHaveLength(2);
    expect(state.notifications[0]).toMatchObject(pNotif3);

    // Expect new, overwritable, priority notification to be discarded
    // if non-overwritable notification is in line
    state = reducer(
      state,
      openNotification('Fourth notification', {
        overwritable: true,
        priority: true,
      }),
    );
    expect(state.notifications).toHaveLength(2);
    expect(state.notifications[0]).toMatchObject(pNotif3);
  });

  test('pop notifications', () => {
    // Pop empty queue
    expect(reducer(appInitialState, popNotification()).notifications).toEqual([]);

    // Pop last item
    let state = reducer(appInitialState, openNotification('New notification'));
    state = reducer(state, popNotification());
    expect(state.notifications).toEqual([]);

    state = reducer(appInitialState, openNotification('New notification'));
    state = reducer(state, openNotification('Second notification'));
    state = reducer(state, popNotification());
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0]).toMatchObject({ message: 'Second notification' });
  });
});
