import React from 'react';

const reactLogoPath = require('img/react-logo.svg');
const reduxLogoPath = require('img/redux-logo.svg');

const HomePage = () => (
  <div>
    <h1>React Redux Starter</h1>
    <hr />
    <div>
      <img src={reactLogoPath} alt="React Logo" className="logo"/>
      <img src={reduxLogoPath} alt="Redux Logo" className="logo"/>
    </div>
  </div>
);

export default HomePage;
