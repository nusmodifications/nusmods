import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import config from 'config';
import { fetchModuleList, loadModule } from 'actions/moduleBank';

import ModulesSelect from './components/ModulesSelect';
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
    return (
      <div className="app-container">
        <nav className="navbar navbar-light bg-faded">
          <Link className="navbar-brand" to="/">NUSMods</Link>
          <form style={{ width: '100%', maxWidth: 400, display: 'inline-block' }}>
            <ModulesSelect moduleList={this.props.moduleListSelect}
              onChange={(moduleCode) => {
                this.context.router.push(`/modules/${moduleCode.value}`);
              }}
            />
          </form>
        </nav>
        <br/>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-2">
              <ul className="nav nav-pills nav-stacked">
                <li role="presentation" className="nav-item">
                  <Link className="nav-link" activeClassName="active" to="/timetable">
                    Timetable
                  </Link>
                </li>
                <li role="presentation" className="nav-item">
                  <Link className="nav-link" activeClassName="active" to="/modules">
                    Modules
                  </Link>
                </li>
                <li role="presentation" className="nav-item">
                  <Link className="nav-link" activeClassName="active" to="/settings">
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-md-10">
              {this.props.fetchModuleListRequest.isPending && !this.props.moduleList.length ?
                <p>Loading...</p> : null
              }
              {this.props.fetchModuleListRequest.isSuccessful || this.props.moduleList.length ?
                this.props.children : null
              }
            </div>
          </div>
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
