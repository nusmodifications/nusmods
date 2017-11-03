// @flow

import React, { Component } from 'react';
import Helmet from 'react-helmet';
import axios from 'axios';

import config from 'config';
import Loader from 'views/components/LoadingSpinner';

import StaticPage from './StaticPage';

const DEVELOPERS_URL = 'https://api.github.com/repos/NUSModifications/NUSMods/contributors';

type Props = {};

type State = {
  developersData: ?[Object],
  isLoading: boolean,
  isError: boolean,
  errorMessage: string,
};

class DevelopersContainer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      developersData: null,
      isLoading: true,
      isError: false,
      errorMessage: '',
    };
  }

  componentDidMount() {
    axios.get(DEVELOPERS_URL)
      .then((response) => {
        this.setState({
          developersData: response.data,
        });
      })
      .catch((err) => {
        this.setState({
          isError: true,
          errorMessage: err.message,
        });
      })
      .then(() => {
        this.setState({
          isLoading: false,
        });
      });
  }

  render() {
    return (
      <StaticPage>
        <Helmet>
          <title>Developers - {config.brandName}</title>
        </Helmet>
        <h2>Developers</h2>
        <hr />
        <p>NUSMods is an 100% open source project that relies on the continuous support
          of its individual contributors and NUS student community. Many student hackers have
          reported issues, suggested improvements, or even better, write code and contribute patches!</p>
        <p>Please reach out to us if you are interested in helping!
          Join us and make NUS a better place for its students (your friends)!</p>
        <br /><br />

        {this.state.isLoading && <Loader />}
        {this.state.isError &&
          <div className="alert alert-danger">
            <strong>Something went wrong!</strong>
            {this.state.errorMessage}
          </div>
        }
        {this.state.developersData && <div className="row">
          {this.state.developersData.map(developer => (
            <div className="col-md-3 col-6 text-center" key={developer.id}>
              <div className="mb-2">
                <a href={developer.html_url}>
                  <img
                    src={developer.avatar_url}
                    alt={`${developer.login} thumbnail`}
                    className="rounded-circle img-fluid img-thumbnail"
                  />
                </a>
              </div>
              <h5 className="mb-0 font-weight-bold">
                <a
                  href={developer.html_url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {developer.login}
                </a>
              </h5>
              <p>
                <a
                  className="text-muted"
                  href={`https://github.com/nusmodifications/nusmods/commits?author=${developer.login}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {developer.contributions} commits
                </a>
              </p>
            </div>
          ))}
        </div>}
      </StaticPage>
    );
  }
}

export default DevelopersContainer;
