// @flow
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import config from 'config';
import { toggleFeedback } from 'actions/app';
import styles from './Footer.scss';

type Props = {
  toggleFeedback: Function,
};

export function FooterComponent(props: Props) {
  const commitHash = process.env.commitHash;
  const versionStr = process.env.versionStr;

  const versionSpan = commitHash && versionStr && (
    <span>
      Version{' '}
      <a
        href={`https://github.com/nusmodifications/nusmods/commit/${commitHash}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {versionStr}
      </a>.
    </span>
  );

  return (
    <footer className={styles.footer}>
      <div className="container">
        <ul className={styles.footerLinks}>
          <li><a href={config.contact.githubRepo}>GitHub</a></li>
          <li><a href={config.contact.facebook}>Facebook</a></li>
          <li><a href={config.contact.messenger}>Messenger</a></li>
          <li><a href={config.contact.twitter}>Twitter</a></li>
          <li><a href={config.contact.blog}>Blog</a></li>
          <li>
            <a href="https://github.com/nusmodifications/nusmods-api" target="_blank" rel="noopener noreferrer">API</a>
          </li>
          <li><Link to="/apps">Apps</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/team">Team</Link></li>
          <li><Link to="/contributors">Contributors</Link></li>
          <li><Link to="/faq">FAQ</Link></li>
          <li>
            <button
              type="button"
              onClick={props.toggleFeedback}
              className={classnames('btn btn-inline', styles.feedbackBtn)}
            >
              Feedback Welcome!
            </button>
          </li>
        </ul>
        {/* TODO: Add API data last updated timestamp */}
        <p>Designed and built with all the love in the world by{' '}
          <a href={config.contact.githubOrg} target="_blank" rel="noopener noreferrer">@nusmodifications</a>.
          Maintained by the <Link to="/team">core team</Link> with the help
          of <Link to="/contributors">our contributors</Link>.
        </p>
        <p>Copyright © 2017 NUSModifications. All rights reserved. {versionSpan}
        </p>
      </div>
    </footer>
  );
}

export default connect(null, { toggleFeedback })(FooterComponent);
