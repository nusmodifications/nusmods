// TODO: Add Flow here
import React, { Component } from 'react';
import Helmet from 'react-helmet';
import config from 'config';

import axios from 'axios';

import Loader from 'views/components/LoadingSpinner';

const DEVELOPERS_URL = 'https://api.github.com/repos/NUSModifications/NUSMods/contributors';

class DevelopersContainer extends Component {
  constructor(props) {
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
      <div className="row">
        <Helmet>
          <title>Developers - {config.brandName}</title>
        </Helmet>
        <div className="col-md-8 offset-md-1">
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
          {!this.state.isLoading && !this.state.isError &&
          <div className="row">
            {this.state.developersData.map(developer => (
              <div className="col-md-3 text-center" key={developer.id}>
                <a href={developer.html_url}>
                  <img src={developer.avatar_url} alt={`${developer.login}'s avatar`} style={{ width: '100%' }} />
                </a>
                <h5>{developer.login}</h5>
                <p>{`${developer.contributions} commits`}</p>
              </div>
            ))}
          </div>
          }
        </div>
      </div>
    );
  }
}

export default DevelopersContainer;
