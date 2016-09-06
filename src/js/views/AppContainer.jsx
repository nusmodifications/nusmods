import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import VirtualizedSelect from 'react-virtualized-select';
import createFilterOptions from 'react-select-fast-filter-options';

import { getModuleList } from 'actions/moduleBank';

export class AppContainer extends Component {
  componentDidMount() {
    this.props.getModuleList();
  }

  render() {
    const filterOptions = createFilterOptions({ options: this.props.moduleListSelect });
    return (
      <div className="app-container">
        <div className="container">
          <nav className="navbar navbar-light bg-faded">
            <Link className="navbar-brand" to="/">NUSMods</Link>
            <form style={{ width: '100%', maxWidth: 400, display: 'inline-block' }}>
              <VirtualizedSelect options={this.props.moduleListSelect}
                filterOptions={filterOptions}
                placeholder="Search module"
                onChange={(moduleCode) => {
                  this.context.router.push(`/modules/${moduleCode.value}`);
                }}
              />
            </form>
            <ul className="nav navbar-nav pull-xs-right">
              <li className="nav-item">
                <Link className="nav-link" to="/timetable">Timetable</Link>
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
  moduleListSelect: PropTypes.array,
  getModuleList: PropTypes.func,
  getModuleListRequest: PropTypes.object,
};

AppContainer.contextTypes = {
  router: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    moduleListSelect: state.entities.moduleBank.moduleListSelect,
    getModuleListRequest: state.requests.getModuleListRequest || {},
  };
}

export default connect(
  mapStateToProps,
  {
    getModuleList,
  }
)(AppContainer);
