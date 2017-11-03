// @flow

import React from 'react';

import StaticPage from './StaticPage';

export default function AboutContainer() {
  return (
    <StaticPage title="About">
      <h3>A Brief History</h3>
      <p>
        NUSModifications (NUSMods) was founded in 2012 by <a href="http://benghee.eu/">Beng</a> to
        provide a better way for students to plan their school timetables.
        Over time, more features have been added to improve the lives of NUS students.
        Besides timetable planning, NUSMods also serves to be a complete knowledge bank of NUS modules
        by providing useful module-related information such as archived CORS bidding statistics
        and community-driven module reviews and discussions.
      </p>

      <h3>Goals</h3>
      <p>
        In the long term, NUSMods strives to enhance the quality of students&apos;
        lives in school by serving as a one-stop platform that provides useful
        utility tools and an avenue for students to share their knowledge and experiences.
      </p>

      <p>
        As an app built by students for students,
        NUSMods hopes to encourage fellow students to experiment and create original,
        community-engaging work that also improves the lives of NUS students.
        Examples of such initiatives IVLE Cloud Sync and
        Corspedia (which has been integrated into NUSMods as of July 2014).
      </p>

      <h3>Connect with Us!</h3>
      <p>
        We would love to hear your feedback and suggestions on how to make NUSMods even better.
        Please let us know them by leaving a comment
        on our <a href="https://www.facebook.com/NUSMods">Facebook page</a>.
      </p>

      <p><em>- NUSMods Team</em></p>
    </StaticPage>
  );
}
