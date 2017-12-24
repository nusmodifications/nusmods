// @flow
import React from 'react';
import { Link } from 'react-router-dom';

import styles from './Footer.scss';

function Footer() {
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
          <li><a href="https://github.com/nusmodifications/nusmods">GitHub</a></li>
          <li><a href="https://www.facebook.com/nusmods">Facebook</a></li>
          <li><a href="https://twitter.com/nusmods">Twitter</a></li>
          <li><a href="http://blog.nusmods.com/">Blog</a></li>
          <li><a href="https://github.com/nusmodifications/nusmods-api">API</a></li>
          <li><Link to="/apps">Apps</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/team">Team</Link></li>
          <li><Link to="/developers">Developers</Link></li>
          <li><Link to="/faq">FAQ</Link></li>
        </ul>
        {/* TODO: Add API data last updated timestamp */}
        <p>Designed and built with all the love in the world by{' '}
          <a
            href="https://github.com/nusmodifications"
            target="_blank"
            rel="noopener noreferrer"
          >
            @nusmodifications
          </a>.
          Maintained by the <Link to="/team">core team</Link> with the help
          of <Link to="/developers">our contributors</Link>.
        </p>
        <p>© Copyright 2017, NUSModifications. All rights reserved. {versionSpan}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
