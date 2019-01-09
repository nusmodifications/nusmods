// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { toggleFeedback } from 'actions/app';
import { Link } from 'react-router-dom';

import type { Contributor } from 'types/contributor';

import config from 'config';
import getContributors from 'apis/contributor';
import { Mail, Layers, GitHub, Zap, Users } from 'views/components/icons';
import ExternalLink from 'views/components/ExternalLink';
import Loader from 'views/components/LoadingSpinner';
import StaticPage from 'views/static/StaticPage';

import UnmappedVenues from './UnmappedVenues';
import ContributorList from './ContributorList';
import styles from './ContributeContainer.scss';

type Props = {
  toggleFeedback: Function,
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
      <StaticPage title="Contribute">
        <h3>Help us help you!</h3>
        <p>
          NUSMods is a 100% student-run, open source project. We rely on the continuous support of
          our valued contributors and the NUS student community. Many students have reported issues,
          suggested improvements, and even contributed code. Join us to make NUS a better place for
          its students (your friends)! NUSMods is a fast-evolving project, and there are many things
          to be done. Help us help you!
        </p>

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

        <h3>Locate the venues</h3>
        <UnmappedVenues />

        <hr />

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
              Here are our top NUSMods contributors, you could be next ;) View all contributors{' '}
              <Link to="/contributors">here</Link>.
            </p>

            <ContributorList contributors={this.state.contributors.slice(0, 12)} />
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
