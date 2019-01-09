// @flow

import React, { Component } from 'react';

import Loader from 'views/components/LoadingSpinner';

import type { Contributor } from 'types/contributor';
import getContributors from 'apis/contributor';
import ContributorList from 'views/contribute/ContributorList';
import StaticPage from './StaticPage';

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
        {this.state.contributors && <ContributorList contributors={this.state.contributors} />}
      </StaticPage>
    );
  }
}

export default ContributorsContainer;
