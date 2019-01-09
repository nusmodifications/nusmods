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
import LoadingSpinner from 'views/components/LoadingSpinner';
import ScrollToTop from 'views/components/ScrollToTop';
import Title from 'views/components/Title';
import developerIcon from 'img/icons/programmer.svg';
import contributeIcon from 'img/icons/love.svg';
import venueIcon from 'img/icons/compass.svg';
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
      <div className={styles.pageContainer}>
        <ScrollToTop onComponentDidMount />
        <Title>Contribute</Title>

        <header>
          <img src={contributeIcon} alt="" />
          <h1>Help us help you!</h1>
        </header>

        <p>
          NUSMods is a 100% student-run, open source project. We rely on the continuous support of
          our valued contributors and the NUS student community. Many students have reported issues,
          suggested improvements, and even contributed code. Join us to make NUS a better place for
          its students (your friends)! NUSMods is a fast-evolving project, and there are many things
          to be done. Help us help you!
        </p>

        <div className={classnames('row no-gutters', styles.actionContainer)}>
          <div className={classnames('col-sm', styles.btnContainer)}>
            <button
              onClick={this.props.toggleFeedback}
              className={classnames(styles.bigButton, 'btn btn-outline-primary btn-block')}
            >
              <Mail />
              We need feedback!
            </button>
          </div>
          <div className={classnames('col-sm', styles.btnContainer)}>
            <ExternalLink
              href={config.contact.messenger}
              className={classnames(styles.bigButton, 'btn btn-outline-primary btn-block')}
            >
              <Layers />
              We need designers!
            </ExternalLink>
          </div>
          <div className={classnames('col-sm', styles.btnContainer)}>
            <ExternalLink
              href={config.contact.githubRepo}
              className={classnames(styles.bigButton, 'btn btn-outline-primary btn-block')}
            >
              <GitHub />
              We need code!
            </ExternalLink>
          </div>
        </div>

        <div className={classnames('row no-gutters', styles.actionContainer)}>
          <div className={classnames('col-sm', styles.btnContainer)}>
            <ExternalLink
              href="https://github.com/nusmodifications/nusmods#backers"
              className="btn btn-outline-primary btn-svg btn-block"
            >
              <Zap className="svg" />
              We need backers!
            </ExternalLink>
          </div>
          <div className={classnames('col-sm', styles.btnContainer)}>
            <ExternalLink
              href="https://github.com/nusmodifications/nusmods#sponsors"
              className="btn btn-outline-primary btn-svg btn-block"
            >
              <Users className="svg" />
              We need sponsors!
            </ExternalLink>
          </div>
        </div>

        <hr />

        <header>
          <img src={developerIcon} alt="" />
          <h2>Contributors</h2>
        </header>

        {this.state.isLoading && <LoadingSpinner />}
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

        <hr />

        <header>
          <img src={venueIcon} alt="" />
          <h2>Locate Venues</h2>
        </header>
        <UnmappedVenues />
      </div>
    );
  }
}

const ConnectedContributeContainer = connect(
  null,
  { toggleFeedback },
)(ContributeContainer);

export default ConnectedContributeContainer;
