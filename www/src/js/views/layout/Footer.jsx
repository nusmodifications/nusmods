// @flow
import type { State } from 'reducers';

import React from 'react';
import classnames from 'classnames';
import { connect, type MapStateToProps } from 'react-redux';
import { Link } from 'react-router-dom';

import config from 'config';
import { toggleFeedback } from 'actions/app';
import styles from './Footer.scss';

type Props = {
  lastUpdatedDate: ?Date,
  toggleFeedback: Function,
};

export function FooterComponent(props: Props) {
  const commitHash = process.env.commitHash;
  const versionStr = process.env.versionStr;

  // Try catch because of Chrome crashing on calling toLocaleString with no parameter
  // See https://sentry.io/nusmods/v3/issues/434084130/
  let lastUpdatedText = 'Loading data...';
  if (props.lastUpdatedDate) {
    try {
      lastUpdatedText = `Data correct as ${props.lastUpdatedDate.toLocaleString()}.`;
    } catch (e) {
      lastUpdatedText = `Data correct as ${props.lastUpdatedDate.toString()}.`;
    }
  }

  const versionSpan = commitHash &&
    versionStr && (
      <span>
        NUSMods R version{' '}
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
          <li>
            <a href={config.contact.githubRepo}>GitHub</a>
          </li>
          <li>
            <a href={config.contact.facebook}>Facebook</a>
          </li>
          <li>
            <a href={config.contact.messenger}>Messenger</a>
          </li>
          <li>
            <a href={config.contact.twitter}>Twitter</a>
          </li>
          <li>
            <a href={config.contact.blog}>Blog</a>
          </li>
          <li>
            <a
              href="https://github.com/nusmodifications/nusmods/tree/master/api"
              target="_blank"
              rel="noopener noreferrer"
            >
              API
            </a>
          </li>
          <li>
            <Link to="/apps">Apps</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/team">Team</Link>
          </li>
          <li>
            <Link to="/contributors">Contributors</Link>
          </li>
          <li>
            <Link to="/faq">FAQ</Link>
          </li>
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
        <p>{lastUpdatedText}</p>
        <p>
          Designed and built with all the love in the world by{' '}
          <a href={config.contact.githubOrg} target="_blank" rel="noopener noreferrer">
            @nusmodifications
          </a>. Maintained by the <Link to="/team">core team</Link> with the help of{' '}
          <Link to="/contributors">our contributors</Link>.
        </p>
        <p>Copyright © 2014 - Present, NUSModifications. All rights reserved. {versionSpan}</p>
      </div>
    </footer>
  );
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  const lastUpdatedString = state.moduleBank.apiLastUpdatedTimestamp;
  return {
    lastUpdatedDate: lastUpdatedString && new Date(lastUpdatedString),
  };
};

export default connect(mapStateToProps, { toggleFeedback })(FooterComponent);
