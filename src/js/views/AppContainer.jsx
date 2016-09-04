import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { getModuleList } from 'actions/moduleList';

export class AppContainer extends Component {
  componentDidMount() {
    this.props.getModuleList();
  }

  render() {
    return (
      <div className="app-container">
        <div className="container">
          <nav className="navbar navbar-dark bg-primary">
            <ul className="nav navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/modules">Modules</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/users">Users</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/reddit">Reddit</Link>
              </li>
            </ul>
          </nav>
          <br />
          {this.props.getModuleListRequest.isPending ? <p>Loading...</p> : null}
          {this.props.getModuleListRequest.isFailure ? <p>An error occurred.</p> : null}
          {this.props.getModuleListRequest.isSuccessful ? this.props.children : null}
        </div>
      </div>
    );
  }
}

AppContainer.propTypes = {
  children: PropTypes.object,
  getModuleList: PropTypes.func,
  getModuleListRequest: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    getModuleListRequest: state.requests.getModuleListRequest || {},
  };
}

export default connect(
  mapStateToProps,
  {
    getModuleList,
  }
)(AppContainer);
