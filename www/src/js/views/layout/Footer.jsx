// @flow
import type { State } from 'reducers';

import React from 'react';
import classnames from 'classnames';
import { connect, type MapStateToProps } from 'react-redux';
import { Link } from 'react-router-dom';

import ExternalLink from 'views/components/ExternalLink';
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

  const lastUpdatedDate = props.lastUpdatedDate;

  const versionSpan = commitHash &&
    versionStr && (
      <span>
        NUSMods R version{' '}
        <ExternalLink href={`https://github.com/nusmodifications/nusmods/commit/${commitHash}`}>
          {versionStr}
        </ExternalLink>.
      </span>
    );

  return (
    <footer className={styles.footer}>
      <div className="container">
        <ul className={styles.footerLinks}>
          <li>
            <ExternalLink href={config.contact.githubRepo}>GitHub</ExternalLink>
          </li>
          <li>
            <ExternalLink href={config.contact.facebook}>Facebook</ExternalLink>
          </li>
          <li>
            <ExternalLink href={config.contact.messenger}>Messenger</ExternalLink>
          </li>
          <li>
            <ExternalLink href={config.contact.twitter}>Twitter</ExternalLink>
          </li>
          <li>
            <ExternalLink href={config.contact.blog}>Blog</ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://github.com/nusmodifications/nusmods/tree/master/api">
              API
            </ExternalLink>
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
        <p>
          Data correct as at {lastUpdatedDate ? lastUpdatedDate.toLocaleString() : 'Loading...'}.
        </p>
        <p>
          Designed and built with all the love in the world by{' '}
          <ExternalLink href={config.contact.githubOrg}>@nusmodifications</ExternalLink>. Maintained
          by the <Link to="/team">core team</Link> with the help of{' '}
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
