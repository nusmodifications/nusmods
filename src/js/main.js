import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import HelloWorld from 'HelloWorld';

require('main.scss');

ReactDOM.render(
  <HelloWorld />,
  document.getElementById('app')
);
