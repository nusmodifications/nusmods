// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import classnames from 'classnames';
import { toggleFeedback } from 'actions/app';
import config from 'config';

import { Mail, Layers, GitHub, Zap, Users } from 'views/components/icons';
import ExternalLink from 'views/components/ExternalLink';
import Loader from 'views/components/LoadingSpinner';
import UnmappedVenues from 'views/components/UnmappedVenues';

import StaticPage from './StaticPage';
import styles from './ContributeContainer.scss';

const CONTRIBUTORS_URL =
  'https://api.github.com/repos/NUSModifications/NUSMods/contributors?per_page=100';
const CONTRIBUTOR_TYPE_USER = 'User';
const CONTRIBUTOR_ID_RENOVATE = 25180681;

type Props = {
  toggleFeedback: Function,
};

type Contributor = {
  avatar_url: string,
  contributions: number,
  events_url: string,
  followers_url: string,
  following_url: string,
  gists_url: string,
  gravatar_id: string,
  html_url: string,
  id: number,
  login: string,
  organizations_ur: string,
  received_events_ur: string,
  repos_ur: string,
  site_admin: boolean,
  starred_ur: string,
  subscriptions_ur: string,
  type: string,
  url: string,
};

type State = {
  contributors: ?Array<Contributor>,
  isLoading: boolean,
  isError: boolean,
  errorMessage: string,
};

class ContributeContainer extends Component<Props, State> {
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
    axios
      .get(CONTRIBUTORS_URL)
      .then((response) => {
        this.setState({
          contributors: response.data,
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
      <StaticPage title="Contribute">
        <h3>Help us help you!</h3>
        <p>
          NUSMods is a 100% student-run, open source project. We rely on the continuous support of
          our valued contributors and the NUS student community. Many students have reported issues,
          suggested improvements, and even contributed code. Join us to make NUS a better place for
          its students (your friends)! NUSMods is a fast-evolving project, and there are many things
          to be done. Help us help you!
        </p>

        {/* <h4>Here&apos;s how you can help</h4> */}

        <div className={classnames('row no-gutters', styles.actionContainer)}>
          <div className={classnames('col-lg', styles.btnContainer)}>
            <button
              onClick={this.props.toggleFeedback}
              className="btn btn-primary btn-svg btn-block"
            >
              <Mail className="svg" />
              We need feedback!
            </button>
          </div>
          <div className={classnames('col-lg', styles.btnContainer)}>
            <ExternalLink
              href={config.contact.messenger}
              className="btn btn-primary btn-svg btn-block"
            >
              <Layers className="svg" />
              We need designers!
            </ExternalLink>
          </div>
          <div className={classnames('col-lg', styles.btnContainer)}>
            <ExternalLink
              href={config.contact.githubRepo}
              className="btn btn-primary btn-svg btn-block"
            >
              <GitHub className="svg" />
              We need code!
            </ExternalLink>
          </div>
        </div>

        <div className={classnames('row no-gutters', styles.actionContainer)}>
          <div className={classnames('col-lg', styles.btnContainer)}>
            <ExternalLink
              href="https://github.com/nusmodifications/nusmods#backers"
              className="btn btn-primary btn-svg btn-block"
            >
              <Zap className="svg" />
              We need backers!
            </ExternalLink>
          </div>
          <div className={classnames('col-lg', styles.btnContainer)}>
            <ExternalLink
              href="https://github.com/nusmodifications/nusmods#sponsors"
              className="btn btn-primary btn-svg btn-block"
            >
              <Users className="svg" />
              We need sponsors!
            </ExternalLink>
          </div>
        </div>

        <hr />
        <br />
        <h3>Locate the venues</h3>
        <UnmappedVenues />

        <hr />
        <br />
        <h3>Contributors</h3>

        {this.state.isLoading && <Loader />}
        {this.state.isError && (
          <div className="alert alert-danger">
            <strong>Something went wrong!</strong>
            {this.state.errorMessage}
          </div>
        )}

        {this.state.contributors && (
          <div>
            <p>
              {this.state.contributors.length} people have contributed to NUSMods, you could be next
              ;)
            </p>

            <div className="row">
              {this.state.contributors
                .filter(
                  (contributor) =>
                    contributor.type === CONTRIBUTOR_TYPE_USER &&
                    // Renovate used to report outdated dependencies as a user via the GitHub API,
                    // hence we need to filter it out by its GitHub user ID.
                    contributor.id !== CONTRIBUTOR_ID_RENOVATE,
                )
                .map((contributor) => (
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
          </div>
        )}
      </StaticPage>
    );
  }
}

export default connect(
  null,
  { toggleFeedback },
)(ContributeContainer);
