import * as React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { toggleFeedback } from 'actions/app';
import config from 'config';

import { Mail, Layers, GitHub } from 'react-feather';
import ExternalLink from 'views/components/ExternalLink';

import StaticPage from './StaticPage';
import styles from './AboutContainer.scss';

type Props = {
  toggleFeedback: () => void;
};

const AboutContainer: React.FC<Props> = (props) => (
  <StaticPage title="About">
    <h3>A Brief History</h3>
    <p>
      NUSModifications (NUSMods) was founded in 2012 by{' '}
      <ExternalLink href="http://benghee.eu/">Beng</ExternalLink> to provide a better way for
      students to plan their school timetables. Over time, more features have been added to improve
      the lives of NUS students. Besides timetable planning, NUSMods also serves as a complete
      knowledge bank of NUS courses by providing useful course-related information such as
      community-driven course reviews and discussions.
    </p>

    <h3>Goals</h3>
    <p>
      In the long term, NUSMods strives to enhance the quality of students&apos; lives in school by
      serving as a one-stop platform that provides both useful tools and an avenue for students to
      share their knowledge and experiences.
    </p>

    <p>
      As an app built by students for students, NUSMods hopes to encourage fellow students to
      experiment and create original, community-engaging work that also improves the lives of NUS
      students. Examples of such initiatives are Corspedia, which has been integrated into NUSMods
      as of July 2014, and Modify.sg, which was merged with NUSMods as of December 2017.
    </p>

    <h3>Future</h3>
    <p>
      NUSMods is a fast-evolving project, and there are many things to be done. Help us help you!
    </p>

    <div className={classnames('row no-gutters', styles.actionContainer)}>
      <div className={classnames('col-lg', styles.btnContainer)}>
        <button
          type="button"
          onClick={props.toggleFeedback}
          className="btn btn-primary btn-svg btn-block"
        >
          <Mail className="svg" />
          We need feedback!
        </button>
      </div>
      <div className={classnames('col-lg', styles.btnContainer)}>
        <ExternalLink href={config.contact.messenger} className="btn btn-primary btn-svg btn-block">
          <Layers className="svg" />
          We need designers!
        </ExternalLink>
      </div>
      <div className={classnames('col-lg', styles.btnContainer)}>
        <ExternalLink
          href={config.contact.githubRepo}
          className="btn btn-primary btn-svg btn-block"
        >
          <GitHub className="svg" />
          We need code!
        </ExternalLink>
      </div>
    </div>

    <p>PS, we really need a UI designer. Please hit us up.</p>

    <p>
      <em>- NUSMods Team</em>
    </p>
  </StaticPage>
);

export default connect(null, { toggleFeedback })(AboutContainer);
