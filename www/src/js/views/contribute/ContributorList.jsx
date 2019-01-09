// @flow

import React from 'react';
import ExternalLink from 'views/contribute/ContributeContainer';
import classnames from 'classnames';
import type { Contributor } from 'types/contributor';
import styles from './ContributorList.scss';

type Props = {
  contributors: Contributor[],
};

export default function ContributorList(props: Props) {
  return (
    <div className="row">
      {props.contributors.map((contributor) => (
        <div className="col-md-2 col-6 text-center" key={contributor.id}>
          <ExternalLink href={contributor.html_url}>
            <img
              src={contributor.avatar_url}
              alt={`${contributor.login} thumbnail`}
              className={classnames(styles.thumbnail, 'img-fluid img-thumbnail')}
            />
            <span className={styles.contributorUsername}>{contributor.login}</span>
          </ExternalLink>
          <p>
            <ExternalLink
              className="text-muted"
              href={`https://github.com/nusmodifications/nusmods/commits?author=${
                contributor.login
              }`}
            >
              {contributor.contributions} {contributor.contributions === 1 ? 'commit' : 'commit'}
            </ExternalLink>
          </p>
        </div>
      ))}
    </div>
  );
}
