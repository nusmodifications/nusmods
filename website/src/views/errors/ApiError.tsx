import * as React from 'react';
import classnames from 'classnames';

import RandomKawaii from 'views/components/RandomKawaii';
import Title from 'views/components/Title';
import { breakpointUp } from 'utils/css';

import styles from './ErrorPage.scss';

const defaultPromptText = 'This could be because your device is offline or NUSMods is down :(';

type Props = {
  retry?: () => void;
  dataName?: string;
  promptText?: string;
};

export default class ApiError extends React.PureComponent<Props> {
  override componentDidMount() {
    if (!navigator.onLine) {
      window.addEventListener('online', this.onlineListener);
    }
  }

  override componentWillUnmount() {
    window.removeEventListener('online', this.onlineListener);
  }

  onlineListener = () => {
    if (this.props.retry && navigator.onLine) {
      this.props.retry();
    }
  };

  override render() {
    const { retry, dataName, promptText } = this.props;
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

          <p>{promptText ?? defaultPromptText}</p>
          {/* TODO: Remove hacky message after we figure out what is wrong with Elastic Search. */}
          {dataName === 'course information' && (
            <>
              <strong>Course search might be having issues at the moment. 😟</strong>
              <p>
                If it isn't working, please try the module search{' '}
                {window.innerWidth < breakpointUp('md').minWidth && 'on a desktop browser '}on the
                top right corner of the page instead.
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
