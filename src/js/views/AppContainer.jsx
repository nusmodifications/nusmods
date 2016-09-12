import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import VirtualizedSelect from 'react-virtualized-select';
import createFilterOptions from 'react-select-fast-filter-options';

import config from 'config';
import { fetchModuleList, loadModule } from 'actions/moduleBank';

import Footer from './layout/Footer';

export class AppContainer extends Component {
  componentDidMount() {
    this.props.fetchModuleList();
    const semesterTimetable = this.props.timetables[config.semester];
    if (semesterTimetable) {
      Object.keys(semesterTimetable).forEach((moduleCode) => {
        // TODO: Handle failed loading of module.
        this.props.loadModule(moduleCode);
      });
    }
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
              <li className="nav-item">
                <Link className="nav-link" to="/settings">Settings</Link>
              </li>
            </ul>
          </nav>
          <br />
          {this.props.fetchModuleListRequest.isPending && !this.props.moduleList.length ?
            <p>Loading...</p> : null
          }
          {this.props.fetchModuleListRequest.isSuccessful || this.props.moduleList.length ?
            this.props.children : null
          }
        </div>
        <Footer/>
      </div>
    );
  }
}

AppContainer.propTypes = {
  children: PropTypes.object,
  loadModule: PropTypes.func,
  fetchModuleList: PropTypes.func,
  moduleList: PropTypes.array,
  moduleListSelect: PropTypes.array,
  timetables: PropTypes.object,
  fetchModuleListRequest: PropTypes.object,
};

AppContainer.contextTypes = {
  router: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    moduleList: state.entities.moduleBank.moduleList,
    moduleListSelect: state.entities.moduleBank.moduleListSelect,
    timetables: state.timetables,
    fetchModuleListRequest: state.requests.fetchModuleListRequest || {},
  };
}

export default connect(
  mapStateToProps,
  {
    fetchModuleList,
    loadModule,
  }
)(AppContainer);
