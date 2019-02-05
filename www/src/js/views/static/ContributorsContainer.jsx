// @flow

import React from 'react';

import ContributorList from 'views/contribute/ContributorList';
import StaticPage from './StaticPage';

const title = 'Contributors';

function ContributorsContainer() {
  return (
    <StaticPage title={title}>
      <h2>{title}</h2>
      <hr />
      <p>
        NUSMods is a 100% student-run, open source project. We rely on the continuous support of our
        valued contributors and the NUS student community. Many students have reported issues,
        suggested improvements, and even contributed code. Join us to make NUS a better place for
        its students (your friends)!
      </p>
      <br />
      <ContributorList />
    </StaticPage>
  );
}

export default ContributorsContainer;
