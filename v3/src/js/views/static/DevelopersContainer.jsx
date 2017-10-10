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
  props: Props;
  state: State;

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
        <p><em>NUSMods is an 100% open source project that relies on the continuous support
          of its individual contributors and NUS student community. Many student hackers have
          reported issues, suggested improvements, or even better, write code and contribute patches!
          <br /><br />
          Please reach out to us if you are interested in helping!
          Join us and make NUS a better place for its students (your friends)!
        </em></p>
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
            <div className="col-md-3 col-sm-6 text-center" key={developer.id}>
              <a className="responsive-square mb-2" href={developer.html_url}>
                <img src={developer.avatar_url} alt="" className="responsive-square-content img-fluid" />
              </a>
              <h5 className="mb-0 font-weight-bold">{developer.login}</h5>
              <p>{`${developer.contributions} commits`}</p>
            </div>
          ))}
        </div>}
      </StaticPage>
    );
  }
}

export default DevelopersContainer;
