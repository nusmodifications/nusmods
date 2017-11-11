// @flow

import React, { Component } from 'react';
import axios from 'axios';

import Loader from 'views/components/LoadingSpinner';

import StaticPage from './StaticPage';
import styles from './AppsContainer.scss';

const APPS_URL = 'https://nusmodifications.github.io/nusmods-apps/apps.json';

type Props = {};

type State = {
  appsData: ?[Object],
  isLoading: boolean,
  isError: boolean,
  errorMessage: string,
};

type AppEntryProps = {
  app: {
    name: string,
    description: string,
    author: string,
    url: string,
    repository_url?: string,
    icon_url: string,
    tags: Array<string>,
  },
};

function AppEntry({ app }: AppEntryProps) {
  return (
    <section className={styles.appEntry} key={app.name}>
      <div className="row">
        <div className="col-lg-2 col-sm-3 text-center-md">
          <a href={app.url} className={styles.appIcon}>
            <img
              className="rounded-circle img-fluid img-thumbnail"
              src={app.icon_url}
              alt={app.name}
            />
          </a>
        </div>
        <div className="col-lg-10 col-sm-9">
          <h4>{app.name}</h4>
          <p>{app.description}</p>
        </div>
      </div>
    </section>
  );
}

class AppsContainer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      appsData: null,
      isLoading: true,
      isError: false,
      errorMessage: '',
    };
  }

  componentWillMount() {
    const config = {
      transformResponse: [
        (data) => {
          // Remove "callback(" prefix and ")" suffix in apps "json" file
          // so that resulting string is parsable JSON. Then parse it.

          if (!(typeof data === 'string' || data instanceof String)) {
            // Not a string. Maybe the json file is actually json now?
            return data;
          }

          const prefix = 'callback(';
          const suffix = ')';
          let trimmedData = data.trim(); // data might have a trailing newline
          if (trimmedData.startsWith(prefix)) trimmedData = trimmedData.slice(prefix.length);
          if (trimmedData.endsWith(suffix)) trimmedData = trimmedData.slice(0, -suffix.length);
          return JSON.parse(trimmedData);
        },
      ],
    };

    axios.get(APPS_URL, config)
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
      <StaticPage title="Apps">
        <h2>Apps</h2>
        <hr />
        <p>A collection of NUS-related apps that may come in handy.</p>
        <p>Have an NUS app that you want added to the list? Simply add it to
          our <a href="https://github.com/nusmodifications/nusmods-apps">Apps repository</a>!</p>

        {this.state.isLoading && <Loader />}
        {this.state.isError &&
          <div className="alert alert-danger">
            <strong>Something went wrong!</strong>
            {this.state.errorMessage}
          </div>
        }
        {this.state.appsData && this.state.appsData.map(app => <AppEntry key={app.name} app={app} />)}
      </StaticPage>
    );
  }
}

export default AppsContainer;
