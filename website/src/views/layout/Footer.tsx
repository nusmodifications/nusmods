import * as React from 'react';
import { connect } from 'react-redux';
import { PreloadingLink } from 'views/routes/PreloadingLink';

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
  const commitHash = process.env.DISPLAY_COMMIT_HASH;
  const versionStr = process.env.VERSION_STR;

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

  const versionSpan = commitHash && versionStr && (
    <span>
      NUSMods R version{' '}
      <ExternalLink href={`https://github.com/nusmodifications/nusmods/commit/${commitHash}`}>
        {versionStr}
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
            <PreloadingLink to="/apps">Apps</PreloadingLink>
          </li>
          <li>
            <PreloadingLink to="/about">About</PreloadingLink>
          </li>
          <li>
            <PreloadingLink to="/team">Team</PreloadingLink>
          </li>
          <li>
            <PreloadingLink to="/contributors">Contributors</PreloadingLink>
          </li>
          <li>
            <PreloadingLink to="/faq">FAQ</PreloadingLink>
          </li>

          {/* new Date().getMonth() === 9 && (
            <li>
              <PreloadingLink to="/hacktoberfest">
                <strong>Hacktoberfest!</strong>
              </PreloadingLink>
            </li>
          ) */}

          <li>
            <PreloadingLink to="/contribute" className={styles.feedbackBtn}>
              Contribute to NUSMods!
            </PreloadingLink>
          </li>
        </ul>
        <p>{lastUpdatedText}</p>
        <p>
          Designed and built with all the love in the world by{' '}
          <ExternalLink href={config.contact.githubOrg}>@nusmodifications</ExternalLink>. Maintained
          by the <PreloadingLink to="/team">core team</PreloadingLink> with the help of{' '}
          <PreloadingLink to="/contributors">our contributors</PreloadingLink>.
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
