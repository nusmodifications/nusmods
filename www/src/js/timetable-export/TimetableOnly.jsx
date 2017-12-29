// @flow
import React, { Component } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import type { Store } from 'redux';
import type { Semester } from '../types/modules';
import type { SemTimetableConfig } from '../types/timetables';
import TimetableContent from '../views/timetable/TimetableContent';

type Props = {
  store: Store<*, *, *>,
};

type State = {
  semester: Semester,
  timetable: SemTimetableConfig,
};

export default class TimetableOnly extends Component<Props, State> {
  state = {
    semester: 1,
    timetable: {},
  };

  render() {
    const { store } = this.props;
    const { semester, timetable } = this.state;

    return (
      <MemoryRouter>
        <Provider store={store}>
          <TimetableContent header={null} semester={semester} timetable={timetable} readOnly />
        </Provider>
      </MemoryRouter>
    );
  }
}
