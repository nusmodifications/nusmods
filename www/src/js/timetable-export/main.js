import React from 'react';
import ReactDOM from 'react-dom';

import configureStore from 'stores/configure-store';
import TimetableOnly from './TimetableOnly';
import './main.scss';
import '../../styles/main.scss';

const store = configureStore();
window.store = store;

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
