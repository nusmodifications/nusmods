import * as React from 'react';
import classnames from 'classnames';
import Loadable, { LoadingComponentProps } from 'react-loadable';

import { Contributor } from 'types/contributor';
import { getContributors } from 'apis/github';
import ExternalLink from 'views/components/ExternalLink';
import ApiError from 'views/errors/ApiError';
import LoadingSpinner from 'views/components/LoadingSpinner';
import styles from './ContributorList.scss';

export const ContributorListComponent: React.FC<{ contributors: Contributor[] }> = (props) => (
  <div className="row">
    {props.contributors.map((contributor) => (
      <div className="col-md-3 col-6 text-center" key={contributor.id}>
        <ExternalLink href={contributor.html_url}>
          <img
            src={contributor.avatar_url}
            alt={`${contributor.login} thumbnail`}
            className={classnames(styles.thumbnail, 'img-fluid img-thumbnail')}
          />
          <span className={styles.contributorUsername}>{contributor.login}</span>
        </ExternalLink>
        <p className={styles.commits}>
          <ExternalLink
            className="text-muted"
            href={`https://github.com/nusmodifications/nusmods/commits?author=${contributor.login}`}
          >
            {contributor.contributions} {contributor.contributions === 1 ? 'commit' : 'commits'}
          </ExternalLink>
        </p>
      </div>
    ))}
  </div>
);

// Wrapper around ContributorList that loads contributor data
type Props = {
  size?: number;
};

type Export = {
  contributors: Contributor[];
};

const ContributorList = Loadable.Map<Props, Export>({
  loader: {
    contributors: () => getContributors(),
  },
  loading: (props: LoadingComponentProps) => {
    if (props.error) {
      return <ApiError dataName="list of contributors" retry={props.retry} />;
    }
    if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },

  // This is not a proper render function, so prop validation doesn't work
  render(loaded, props) {
    let { contributors } = loaded;
    if (props.size) contributors = contributors.slice(0, props.size);

    return <ContributorListComponent contributors={contributors} />;
  },
});

export default ContributorList;
