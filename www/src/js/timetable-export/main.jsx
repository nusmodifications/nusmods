// @flow
import React from 'react';
import ReactDOM from 'react-dom';

import type { Module } from 'types/modules';
import type { ExportData } from 'types/export';

import configureStore from 'bootstrapping/configure-store';
import { setExportedData } from 'actions/export';
import { DARK_MODE } from 'types/settings';

import TimetableOnly from './TimetableOnly';
import './main.scss';
import '../../styles/main.scss';

// Set up Redux store
const { store } = configureStore();
window.store = store;

// For Puppeteer to import data
window.setData = function setData(modules: Module[], data: ExportData, callback: Function) {
  const { semester, timetable, colors } = data;

  if (document.body) {
    document.body.classList.toggle('mode-dark', data.settings.mode === DARK_MODE);
  }

  store.dispatch(setExportedData(modules, data));

  window.timetableComponent.setState(
    {
      semester,
      timetable,
      colors,
    },
    callback,
  );
};

const render = () => {
  const appElement = document.getElementById('app');
  if (!appElement) throw new Error('#app not found');

  ReactDOM.render(
    <TimetableOnly
      store={store}
      ref={(timetableComponent) => {
        window.timetableComponent = timetableComponent;
      }}
    />,
    appElement,
  );
};

render();
