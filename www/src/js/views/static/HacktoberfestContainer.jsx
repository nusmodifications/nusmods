// @flow

import React from 'react';
import StaticPage from 'views/static/StaticPage';
import styles from 'views/static/HacktoberfestContainer.scss';
import ExternalLink from 'views/components/ExternalLink';
import HacktoberfestLogo from 'views/static/HacktoberfestLogo';
import { Heart } from 'views/components/icons';
import logo from 'img/nusmods-logo.png';
import shirt from 'img/nusmods-shirts.png';

const title = 'Hacktoberfest!';

export default function TeamContainer() {
  return (
    <StaticPage title={title} className={styles.page}>
      <h2>
        <img src={logo} alt="NUSMods" className={styles.logo} /> <Heart className={styles.heart} />
        <HacktoberfestLogo />
        <span className="sr-only">{title}</span>
      </h2>

      <p>
        Hacktoberfest is a month long celebration of open source. Help contribute to NUSMods by
        opening pull requests in the month of October and get a free T-shirt from GitHub and Digital
        Ocean, as well as exclusive NUSMods shirts!
      </p>

      <img
        src={shirt}
        className={styles.shirts}
        alt="Gray shirts with NUSMods logotype on the front and a hexagonal N NUSMods logo at the back"
      />

      <ol className={styles.steps}>
        <li>
          <ExternalLink href="https://hacktoberfest.digitalocean.com/">Register</ExternalLink> for
          Hacktoberfest
        </li>
        <li>
          Find an{' '}
          <ExternalLink href="https://github.com/nusmodifications/nusmods/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3AHacktoberfest+-label%3ATaken">
            open issues
          </ExternalLink>{' '}
          and claim it by adding a comment
        </li>
        <li>
          <ExternalLink href="https://github.com/nusmodifications/nusmods">
            Fork the repo
          </ExternalLink>{' '}
          and fix the issue. Don&apos;t see an issue you like? You can always{' '}
          <ExternalLink href="https://github.com/nusmodifications/nusmods/issues/new/choose">
            open new ones
          </ExternalLink>!
        </li>
        <li>
          <ExternalLink href="https://github.com/nusmodifications/nusmods/compare">
            Open a pull request
          </ExternalLink>{' '}
          with your changes
        </li>
      </ol>

      <hr />

      <p>
        Need help getting started? Come{' '}
        <ExternalLink href="https://telegram.me/nusmods">talk to us on Telegram</ExternalLink> or
        read{' '}
        <ExternalLink href="https://hacktoberfest.digitalocean.com/#gettingstarted">
          Hacktoberfest&apos;s Getting Started guide
        </ExternalLink>.
      </p>

      <hr />

      <p className={styles.disclaimer}>
        *{' '}
        <small>
          Free NUSMods shirt only available for NUS students on a first-come-first-serve basis.
          NUSMods is not affiliated with Hacktoberfest. Official Hacktoberfest shirt only available
          on a limited basis if you submit five pull requests to any projects on GitHub.
        </small>
      </p>
    </StaticPage>
  );
}
