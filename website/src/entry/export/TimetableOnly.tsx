import { Store } from 'redux';
import { Component } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { fillColorMapping } from 'utils/colors';
import TimetableContent from 'views/timetable/TimetableContent';
import { State as StoreState } from 'types/state';
import { ExportData } from 'types/export';

type Props = {
  store: Store<StoreState>;
};

type State = Omit<ExportData, 'theme' | 'settings'>;

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
