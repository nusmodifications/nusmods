import React from 'react';

const Footer = () => {
  return (
    <footer className="nm-footer text-muted">
      <div className="container">
        <ul className="nm-footer-links">
          <li><a href="https://github.com/nusmodifications/nusmods">GitHub</a></li>
          <li><a href="https://www.facebook.com/nusmods">Facebook</a></li>
          <li><a href="https://twitter.com/nusmods">Twitter</a></li>
          <li><a href="http://blog.nusmods.com/">Blog</a></li>
          <li><a href="https://github.com/nusmodifications/nusmods-api">API</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/faq">FAQ</a></li>
        </ul>
        {/* TODO: Change team to link to internal page. */}
        {/* TODO: Change contributors link to internal page */}
        {/* TODO: Add last updated timestamp */}
        <p>Designed and built with all the love in the world by <a href="https://github.com/nusmodifications" target="_blank" rel="noopener noreferrer">@nusmodifications</a>. Maintained by the <a href="https://github.com/orgs/nusmodifications/people" rel="noopener noreferrer">core team</a> with the help of <a href="https://github.com/nusmodifications/nusmods/graphs/contributors" rel="noopener noreferrer">our contributors</a>.</p>
        <p>© Copyright 2016, NUSModifications. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
