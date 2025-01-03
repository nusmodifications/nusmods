import { Store } from 'redux';
import { Component } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { ModuleCode, Semester } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';
import { fillColorMapping } from 'utils/colors';
import TimetableContent from 'views/timetable/TimetableContent';
import { ColorMapping } from 'types/reducers';
import { State as StoreState } from 'types/state';

type Props = {
  store: Store<StoreState>;
};

type State = {
  semester: Semester;
  timetable: SemTimetableConfig;
  colors: ColorMapping;
  hidden: ModuleCode[];
};

export default class TimetableOnly extends Component<Props, State> {
  override state = {
    semester: 1,
    timetable: {},
    colors: {},
    hidden: [],
    ta: {},
  };

  override render() {
    const { store } = this.props;
    const theme = store.getState().theme.id;

    const { semester, timetable, colors, hidden, ta } = this.state;
    const filledColors = fillColorMapping(timetable, colors);

    return (
      <MemoryRouter initialEntries={['https://nusmods.com']}>
        <Provider store={store}>
          <div id="timetable-only" className={`theme-${theme}`}>
            <TimetableContent
              header={null}
              semester={semester}
              timetable={timetable}
              colors={filledColors}
              hiddenImportedModules={hidden}
              taImportedModules={ta}
              readOnly
            />
          </div>
        </Provider>
      </MemoryRouter>
    );
  }
}
