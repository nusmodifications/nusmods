import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';

export const DEVELOPERS_URL = 'https://api.github.com/repos/NUSModifications/NUSMods/contributors';

class DevelopersContainer extends Component {
  constructor() {
    super();
    this.state = {
      developersData: null,
      isLoading: true,
    };
  }

  componentDidMount() {
    const self = this;

    fetch('https://api.github.com/repos/NUSModifications/NUSMods/contributors').then(response => (
      response.json()
    )).then((json) => {
      self.setState({
        developersData: json,
        isLoading: false,
      });
    });
  }

  render() {
    let renderComponent = '';

    if (this.state.isLoading) {
      renderComponent = (
        <div className="col-2 offset-md-5">
          <i className="fa fa-circle-o-notch fa-spin" style={{ fontSize: '50px' }} />;
        </div>
      );
    } else {
      renderComponent = this.state.developersData.map(developer => (
        <div className="col-3 text-center" key={developer.id}>
          <a href={developer.html_url}>
            <img src={developer.avatar_url} alt={`${developer.login}'s avatar`} style={{ width: '100%' }} />
          </a>
          <h5>{developer.login}</h5>
          <p>{`${developer.contributions} commits`}</p>
        </div>
      ));
    }
    return (
      <DocumentTitle title="Developers">
        <div className="row">
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

            <div className="row">
              {renderComponent}
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

export default DevelopersContainer;
