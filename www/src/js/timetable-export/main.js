import React from 'react';
import ReactDOM from 'react-dom';

import configureStore from 'stores/configure-store';
import { setExportedData, setModules } from 'actions/export';
import TimetableOnly from './TimetableOnly';
import './main.scss';
import '../../styles/main.scss';

// Set up Redux store
const store = configureStore();
window.store = store;

// For Puppeteer to import data
window.setData = function setData(modules, data, callback) {
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

const render = () => {
  window.timetableComponent = ReactDOM.render(
    React.createElement(TimetableOnly, {
      store,
      ref: (timetableComponent) => {
        window.timetableComponent = timetableComponent;
      },
    }),
    document.getElementById('app'),
  );
};

render();
