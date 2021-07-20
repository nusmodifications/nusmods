import * as React from 'react';
import classnames from 'classnames';

import RandomKawaii from 'views/components/RandomKawaii';
import Title from 'views/components/Title';
import { breakpointUp } from 'utils/css';

import styles from './ErrorPage.scss';

type Props = {
  children?: React.ReactNode;
  retry?: () => void;
  dataName?: string;
};

export default class ApiError extends React.PureComponent<Props> {
  componentDidMount() {
    if (!navigator.onLine) {
      window.addEventListener('online', this.onlineListener);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.onlineListener);
  }

  onlineListener = () => {
    if (this.props.retry && navigator.onLine) {
      this.props.retry();
    }
  };

  render() {
    const { retry, dataName } = this.props;
    const message = dataName ? `We can't load the ${dataName}` : "We can't connect to NUSMods";

    return (
      <div>
        <Title>Oh no...</Title>

        <div className={styles.container}>
          <div className={styles.header}>
            <RandomKawaii size={100} />
          </div>

          <h1 className={classnames('h3', styles.header)}>
            <span className={styles.expr}>Oh no...</span> {message}
          </h1>

          <p>This could be because your device is offline or NUSMods is down :(</p>
          {/* TODO: Remove hacky message after we figure out what is wrong with Elastic Search. */}
          {dataName === 'module information' && (
            <>
              <strong>Module search might be having issues at the moment. 😟</strong>
              <p>
                We are currently facing issues with our search services vendor and we are actively
                trying to resolve them. If the module search page isn't working, please use the
                general search function{' '}
                {window.innerWidth < breakpointUp('md').minWidth
                  ? '(on a desktop browser) '
                  : '(the magnifying glass) '}
                on the top right corner of the page to search for modules instead.
              </p>
            </>
          )}

          {retry && (
            <div>
              <button type="button" className="btn btn-primary btn-lg" onClick={retry}>
                Click to try again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}
