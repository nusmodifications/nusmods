import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import ExternalLink from 'views/components/ExternalLink';
import config from 'config';
import { toggleFeedback } from 'actions/app';
import { State } from 'types/state';
import styles from './Footer.scss';

type Props = {
  lastUpdatedDate: Date | null;
  toggleFeedback: () => void;
};

export const FooterComponent: React.FC<Props> = (props) => {
  // Try catch because of Chrome crashing on calling toLocaleString with no parameter
  // See https://sentry.io/nusmods/v3/issues/434084130/
  let lastUpdatedText = 'Loading data...';
  if (props.lastUpdatedDate) {
    try {
      lastUpdatedText = `Data correct as at ${props.lastUpdatedDate.toLocaleString()}.`;
    } catch (e) {
      lastUpdatedText = `Data correct as at ${props.lastUpdatedDate.toString()}.`;
    }
  }

  const versionSpan = DISPLAY_COMMIT_HASH && VERSION_STR && (
    <span>
      NUSMods R version{' '}
      <ExternalLink
        href={`https://github.com/nusmodifications/nusmods/commit/${DISPLAY_COMMIT_HASH}`}
      >
        {VERSION_STR}
      </ExternalLink>
      .
    </span>
  );

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
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
            <ExternalLink href="https://api.nusmods.com/v2">API</ExternalLink>
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

          {/* new Date().getMonth() === 9 && (
            <li>
              <Link to="/hacktoberfest">
                <strong>Hacktoberfest!</strong>
              </Link>
            </li>
          ) */}

          <li>
            <Link to="/contribute" className={styles.feedbackBtn}>
              Contribute to NUSMods!
            </Link>
          </li>
        </ul>
        <p>{lastUpdatedText}</p>
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
};

export default connect(
  (state: State) => {
    const lastUpdatedString = state.moduleBank.apiLastUpdatedTimestamp;
    return {
      lastUpdatedDate: lastUpdatedString ? new Date(lastUpdatedString) : null,
    };
  },
  { toggleFeedback },
)(FooterComponent);
