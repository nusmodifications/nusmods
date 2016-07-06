import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import AppContainer from 'views/AppContainer';
import NotFoundPage from 'views/NotFoundPage';

import HomePage from 'views/home/HomePage';
import UsersContainer from 'views/users/UsersContainer';
import UserSection from 'views/users/UserSection';

require('main.scss');

ReactDOM.render(
  <Router history={browserHistory}>
    <Route component={AppContainer}>
      <Route path="/" component={HomePage}/>
      <Route path="/users" component={UsersContainer}>
        <Route path=":userId" component={UserSection}/>
      </Route>
      <Route path="*" component={NotFoundPage}/>
    </Route>
  </Router>,
  document.getElementById('app')
);
