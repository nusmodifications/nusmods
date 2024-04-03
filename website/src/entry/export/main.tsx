import { createRef } from 'react';
import ReactDOM from 'react-dom';
import { Store } from 'redux';

import { Module } from 'types/modules';
import { ExportData } from 'types/export';

import configureStore from 'bootstrapping/configure-store';
import { setExportedData } from 'actions/export';
import { DARK_COLOR_SCHEME } from 'types/settings';
import { State as StoreState } from 'types/state';

import TimetableOnly from './TimetableOnly';

import 'styles/main.scss';
import './main.scss';

declare global {
  interface Window {
    store: Store<StoreState>;
    setData: (modules: Module[], data: ExportData, callback: () => void) => void;
  }
}

// Set up Redux store
const { store } = configureStore();
window.store = store;

// For Puppeteer to import data
const timetableRef = createRef<TimetableOnly>();
window.setData = function setData(modules, data, callback) {
  const { semester, timetable, colors } = data;

  if (document.body) {
    document.body.classList.toggle('mode-dark', data.settings.colorScheme === DARK_COLOR_SCHEME);
  }

  store.dispatch(setExportedData(modules, data));

  if (timetableRef.current) {
    timetableRef.current.setState(
      {
        semester,
        timetable,
        colors,
      },
      callback,
    );
  }
};

const render = () => {
  const appElement = document.getElementById('app');
  if (!appElement) throw new Error('#app not found');

  ReactDOM.render(<TimetableOnly store={store} ref={timetableRef} />, appElement);
};

render();
