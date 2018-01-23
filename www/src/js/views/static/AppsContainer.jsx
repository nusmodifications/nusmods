// @flow

import React, { Component } from 'react';
import axios from 'axios';

import Loader from 'views/components/LoadingSpinner';
import ExternalLink from 'views/components/ExternalLink';

import StaticPage from './StaticPage';
import styles from './AppsContainer.scss';

const APPS_URL = 'https://nusmodifications.github.io/nusmods-apps/apps.json';

type AppInfo = {
  name: string,
  description: string,
  author: string,
  url: string,
  repository_url?: string,
  icon_url: string,
  tags: Array<string>,
};

type AppEntryProps = {
  app: AppInfo,
};

type Props = {};

type State = {
  appsData: ?[AppInfo],
  isLoading: boolean,
  isError: boolean,
  errorMessage: string,
};

function AppEntry({ app }: AppEntryProps) {
  return (
    <section className={styles.appEntry}>
      <div className="row">
        <div className="col-lg-2 col-sm-3 text-center-md">
          <ExternalLink href={app.url} className={styles.appIcon}>
            <img
              className="rounded-circle img-fluid img-thumbnail"
              src={app.icon_url}
              alt={app.name}
            />
          </ExternalLink>
        </div>
        <div className="col-lg-10 col-sm-9">
          <ExternalLink href={app.url}>
            <h4 className={styles.appName}>{app.name}</h4>
          </ExternalLink>
          <p>
            <small>{app.author}</small>
          </p>
          <p>{app.description}</p>
        </div>
      </div>
    </section>
  );
}

const title = 'Apps';

class AppsContainer extends Component<Props, State> {
  state: State = {
    appsData: null,
    isLoading: true,
    isError: false,
    errorMessage: '',
  };

  componentWillMount() {
    axios
      .get(APPS_URL)
      .then((response) => {
        this.setState({
          appsData: response.data,
          isLoading: false,
        });
      })
      .catch((err) => {
        this.setState({
          isError: true,
          errorMessage: err.message,
          isLoading: false,
        });
      });
  }

  render() {
    return (
      <StaticPage title={title}>
        <h2>{title}</h2>
        <hr />
        <p>A collection of NUS-related apps that may come in handy.</p>
        <p>
          Have an NUS app that you want added to the list? Simply add it to our{' '}
          <ExternalLink href="https://github.com/nusmodifications/nusmods-apps">
            Apps repository
          </ExternalLink>!
        </p>

        {this.state.isLoading && <Loader />}
        {this.state.isError && (
          <div className="alert alert-danger">
            <strong>Something went wrong!</strong>
            {this.state.errorMessage}
          </div>
        )}
        {this.state.appsData &&
          this.state.appsData.map((app) => <AppEntry key={app.name} app={app} />)}
      </StaticPage>
    );
  }
}

export default AppsContainer;
