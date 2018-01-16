// @flow
import type { Store } from 'redux';
import React, { Component } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import type { State as StoreState } from 'reducers';
import type { Semester } from 'types/modules';
import type { SemTimetableConfig } from 'types/timetables';
import { fillColorMapping } from 'utils/colors';
import TimetableContent from 'views/timetable/TimetableContent';
import type { ColorMapping } from 'types/reducers';

type Props = {
  store: Store<StoreState, *, *>,
};

type State = {
  semester: Semester,
  timetable: SemTimetableConfig,
  colors: ColorMapping,
};

export default class TimetableOnly extends Component<Props, State> {
  state = {
    semester: 1,
    timetable: {},
    colors: {},
  };

  render() {
    const { store } = this.props;
    const theme = store.getState().theme.id;

    const { semester, timetable, colors } = this.state;
    const timetableColors = fillColorMapping(timetable, colors);

    return (
      <MemoryRouter initialEntries={['https://nusmods.com']}>
        <Provider store={store}>
          <div id="timetable-only" className={`theme-${theme}`}>
            <TimetableContent
              header={null}
              semester={semester}
              timetable={timetable}
              colors={timetableColors}
              readOnly
            />
          </div>
        </Provider>
      </MemoryRouter>
    );
  }
}
