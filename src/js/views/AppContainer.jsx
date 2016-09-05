import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { getModuleList } from 'actions/moduleBank';

export class AppContainer extends Component {
  componentDidMount() {
    this.props.getModuleList();
  }

  render() {
    return (
      <div className="app-container">
        <div className="container">
          <nav className="navbar navbar-light bg-faded">
            <Link className="navbar-brand" to="/">NUSMods</Link>
            <form className="form-inline pull-xs-left">
              <input className="form-control" type="text" placeholder="Search modules"/>
            </form>
            <ul className="nav navbar-nav pull-xs-right">
              <li className="nav-item">
                <Link className="nav-link" to="/">Timetable</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/modules">Modules</Link>
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
