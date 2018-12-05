// @flow
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { toggleFeedback } from 'actions/app';
import config from 'config';

import { Mail, Layers, GitHub } from 'views/components/icons';
import ExternalLink from 'views/components/ExternalLink';

import StaticPage from './StaticPage';
import styles from './AboutContainer.scss';

type Props = {
  toggleFeedback: Function,
};

function ContributeContainer(props: Props) {
  return (
    <StaticPage title="Contribute">
      <h3>Help us help you!</h3>
      <p>
        NUSMods is a 100% student-run, open source project. We rely on the continuous support of our
        valued contributors and the NUS student community. Many students have reported issues,
        suggested improvements, and even contributed code. Join us to make NUS a better place for
        its students (your friends)! NUSMods is a fast-evolving project, and there are many things
        to be done. Help us help you!
      </p>

      <h3>Here&apos;s how you can help</h3>

      <div className={classnames('row no-gutters', styles.actionContainer)}>
        <div className={classnames('col-lg', styles.btnContainer)}>
          <button onClick={props.toggleFeedback} className="btn btn-primary btn-svg btn-block">
            <Mail className="svg" />
            We need feedback!
          </button>
        </div>
        <div className={classnames('col-lg', styles.btnContainer)}>
          <ExternalLink
            href={config.contact.messenger}
            className="btn btn-primary btn-svg btn-block"
          >
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

      <h4>Locate the venues</h4>
      <p>
        We also need help in locating the venues. All you have to do is choose a venue and mark
        where it is on the map. If youre at the venue, you can also use your phone&apos;s GPS to get the
        location automatically.
      </p>

      <p>
        <em>- NUSMods Team</em>
      </p>
    </StaticPage>
  );
}

export default connect(
  null,
  { toggleFeedback },
)(ContributeContainer);
