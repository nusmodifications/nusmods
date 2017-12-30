// @flow
import React from 'react';
import ReactDOM from 'react-dom';

import type { Module } from 'types/modules';
import type { ExportData } from 'types/export';

import { Semesters } from 'types/modules';
import configureStore from 'stores/configure-store';
import { setExportedData, setModules } from 'actions/export';
import { setTimetable } from 'actions/timetables';

import TimetableOnly from './TimetableOnly';
import './main.scss';
import '../../styles/main.scss';

// Set up Redux store
const store = configureStore();
window.store = store;

// For Puppeteer to import data
window.setData = function setData(modules: Module[], data: ExportData, callback: Function) {
  store.dispatch(setModules(modules));
  store.dispatch(setExportedData(data));

  window.timetableComponent.setState(
    {
      semester: data.semester,
      timetable: data.timetable,
    },
    callback,
  );
};

window.resetData = function resetData() {
  Semesters.map((semester) => store.dispatch(setTimetable(semester, {})));
};

const render = () => {
  const appElement = document.getElementById('app');
  if (!appElement) throw new Error('#app not found');

  window.timetableComponent = ReactDOM.render(
    React.createElement(TimetableOnly, {
      store,
      ref: (timetableComponent) => {
        window.timetableComponent = timetableComponent;
      },
    }),
    appElement,
  );
};

render();
