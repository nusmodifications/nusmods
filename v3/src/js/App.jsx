import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

/* eslint-disable import/no-named-as-default */
import AppContainer from 'views/AppContainer';

/* eslint-disable react/prop-types */
export default function App({ store }) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContainer />
      </BrowserRouter>
    </Provider>
  );
}
