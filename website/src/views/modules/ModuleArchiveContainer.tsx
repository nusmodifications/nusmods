import * as React from 'react';
import { AxiosError } from 'axios';
import { connect, MapDispatchToPropsNonObject } from 'react-redux';
import { match as Match, Navigate, RouteComponentProps, withRouter } from 'react-router-dom';
import deferComponentRender from 'views/hocs/deferComponentRender';
import { get } from 'lodash';

import type { Module, ModuleCode } from 'types/modules';
import type { State as StoreState } from 'types/state';
import type { Dispatch } from 'types/redux';

import { fetchModuleArchive } from 'actions/moduleBank';
import { captureException, retryImport } from 'utils/error';
import ApiError from 'views/errors/ApiError';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { moduleArchive } from 'views/routes/paths';

import { Props as ModulePageContentProp } from './ModulePageContent';

type Params = {
  year: string;
  moduleCode: string;
};

type OwnProps = RouteComponentProps<Params>;

type DispatchProps = {
  fetchModule: () => Promise<Module>;
};

type Props = OwnProps &
  DispatchProps & {
    module: Module | null;
    moduleCode: ModuleCode;
    archiveYear: string;
  };

type State = {
  ModulePageContent: React.ComponentType<ModulePageContentProp> | null;
  error?: Error;
};

/**
 * Wrapper component for the archive page that handles data fetching and error handling.
 * This is very similar to ModulePageContainer except it is used for the archive
 * page, so it uses different code paths for canonical URL, data fetching and
 * error handling - the normal page tries to check the archives if this year's
 * API returns 404, while this page doesn't.
 */
export class ModuleArchiveContainerComponent extends React.PureComponent<Props, State> {
  state: State = {
    ModulePageContent: null,
  };

  componentDidMount() {
    this.fetchModule();
    this.fetchPageImport();
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.moduleCode !== this.props.moduleCode ||
      prevProps.archiveYear !== this.props.archiveYear
    ) {
      this.fetchModule();
    }
  }

  fetchModule = () => {
    this.setState({ error: undefined });
    this.props.fetchModule().catch(this.handleFetchError);
  };

  fetchPageImport() {
    // Try importing ModulePageContent thrice if we're online and
    // getting the "Loading chunk x failed." error.
    retryImport(() => import(/* webpackChunkName: "module" */ 'views/modules/ModulePageContent'))
      .then((module) => this.setState({ ModulePageContent: module.default }))
      .catch(this.handleFetchError);
  }

  handleFetchError = (error: AxiosError) => {
    this.setState({ error });
    captureException(error);
  };

  render() {
    const { ModulePageContent, error } = this.state;
    const { module, moduleCode, match, location, archiveYear } = this.props;

    if (get(error, ['response', 'status'], 200) === 404) {
      return <ModuleNotFoundPage moduleCode={moduleCode} tryArchive={false} />;
    }

    // If there is an error but module data can still be found, we assume module has
    // been loaded at some point, so we just show that instead
    if (error && !module) {
      return <ApiError dataName="module information" retry={this.fetchModule} />;
    }

    // Redirect to canonical URL
    if (module) {
      const canonicalUrl = moduleArchive(moduleCode, archiveYear, module.title);
      if (match.url !== canonicalUrl) {
        return <Navigate to={{ ...location, pathname: canonicalUrl }} />;
      }
    }

    if (module && ModulePageContent) {
      // Unique key forces component to remount whenever the user moves to
      // a new module. This allows the internal state (eg. currently selected
      // timetable semester) of <ModulePageContent> to be consistent
      return (
        <ModulePageContent
          key={`${archiveYear}-${moduleCode}`}
          archiveYear={archiveYear}
          module={module}
        />
      );
    }

    return <LoadingSpinner />;
  }
}

const getPropsFromMatch = (match: Match<Params>) => {
  const { year = '', moduleCode = '' } = match.params;
  return {
    moduleCode: moduleCode.toUpperCase(),
    year: year.replace('-', '/'),
  };
};

const mapStateToProps = ({ moduleBank }: StoreState, ownProps: OwnProps) => {
  const { moduleCode, year } = getPropsFromMatch(ownProps.match);
  return {
    moduleCode,
    archiveYear: year,
    module: get(moduleBank.moduleArchive, [moduleCode, year], null),
  };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) => {
  const { moduleCode, year } = getPropsFromMatch(ownProps.match);
  return {
    fetchModule: () => dispatch<Module>(fetchModuleArchive(moduleCode, year)),
  };
};

const connectedModuleArchiveContainer = connect(
  mapStateToProps,
  // Cast required because the version of Dispatch defined by connect does not have the extensions defined
  // in our Dispatch
  mapDispatchToProps as MapDispatchToPropsNonObject<DispatchProps, OwnProps>,
)(ModuleArchiveContainerComponent);
const routedModuleArchiveContainer = connectedModuleArchiveContainer;
// const routedModuleArchiveContainer = withRouter(connectedModuleArchiveContainer);
export default deferComponentRender(routedModuleArchiveContainer);
