// @flow

import React, { Component } from 'react';
import classnames from 'classnames';

import Loader from 'views/components/LoadingSpinner';
import ExternalLink from 'views/components/ExternalLink';

import type { Contributor } from 'types/contributor';

import getContributors from 'apis/contributor';

import StaticPage from './StaticPage';
import styles from './ContributorsContainer.scss';

type Props = {};

type State = {
  contributors: ?Array<Contributor>,
  isLoading: boolean,
  isError: boolean,
  errorMessage: string,
};

const title = 'Contributors';

class ContributorsContainer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      contributors: null,
      isLoading: true,
      isError: false,
      errorMessage: '',
    };
  }

  componentDidMount() {
    getContributors()
      .then((contributors) => {
        this.setState({
          contributors,
          isLoading: false,
        });
      })
      .catch((err) => {
        this.setState({
          isError: true,
          errorMessage: err.message,
          isLoading: false,
        });
      });
  }

  render() {
    return (
      <StaticPage title={title}>
        <h2>{title}</h2>
        <hr />
        <p>
          NUSMods is a 100% student-run, open source project. We rely on the continuous support of
          our valued contributors and the NUS student community. Many students have reported issues,
          suggested improvements, and even contributed code. Join us to make NUS a better place for
          its students (your friends)!
        </p>
        <br />
        {this.state.isLoading && <Loader />}
        {this.state.isError && (
          <div className="alert alert-danger">
            <strong>Something went wrong!</strong>
            {this.state.errorMessage}
          </div>
        )}
        {this.state.contributors && (
          <div className="row">
            {this.state.contributors.map((contributor) => (
              <div className="col-md-3 col-6 text-center" key={contributor.id}>
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
                    {contributor.contributions} commit
                    {contributor.contributions !== 1 && 's'}
                  </ExternalLink>
                </p>
              </div>
            ))}
          </div>
        )}
      </StaticPage>
    );
  }
}

export default ContributorsContainer;
