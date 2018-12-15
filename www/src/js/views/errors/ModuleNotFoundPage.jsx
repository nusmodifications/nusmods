// @flow
import React, { PureComponent, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Raven from 'raven-js';

import type { ModuleCode } from 'types/modules';
import RandomKawaii from 'views/components/RandomKawaii';
import Title from 'views/components/Title';
import { fetchAllModuleArchive } from 'actions/moduleBank';
import { MODULE_CODE_REGEX } from 'utils/modules';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { availableArchive, isArchiveLoading } from 'selectors/timetables';
import { moduleArchive } from 'views/routes/paths';
import styles from './ErrorPage.scss';

type Props = {
  moduleCode: ModuleCode,

  isLoading: boolean,
  availableArchive: string[],
  fetchModuleArchive: (string) => Promise<*>,
};

export class ModuleNotFoundPageComponent extends PureComponent<Props> {
  componentDidMount() {
    Raven.captureMessage('404 - Module Not Found');

    // If we think this is a module, try checking for archived modules
    if (this.props.moduleCode.match(MODULE_CODE_REGEX)) {
      this.props.fetchModuleArchive(this.props.moduleCode);
    }
  }

  render() {
    const { moduleCode, isLoading } = this.props;
    const eventId = Raven.lastEventId();

    if (isLoading) {
      return <LoadingSpinner />;
    }

    return (
      <div>
        <Title>Module Not Found</Title>

        <div className={styles.container}>
          <h1 className={styles.inlineContainer}>
            <span className={styles.bigCharacter}>4</span>
            <RandomKawaii aria-label="0" title="0" size={100} />
            <span className={styles.bigCharacter}>4</span>
          </h1>

          <h2>Oops, module {moduleCode} not found.</h2>

          {this.props.availableArchive.length ? (
            <Fragment>
              <p>
                {moduleCode} is not mounted this year. However, it was previously mounted in these
                academic years
              </p>

              <ul>
                {this.props.availableArchive.map((year) => (
                  <li key={year}>
                    <Link to={moduleArchive(moduleCode, year)}>{year} archive</Link>
                  </li>
                ))}
              </ul>

              <p>
                Click on them to view the archived module information. Otherwise, if this is not
                what you are looking for, <Link to="/">go back to nusmods.com</Link> or{' '}
                <Link to="/modules">try the module finder</Link>.
              </p>
            </Fragment>
          ) : (
            <Fragment>
              <p>
                This usually means you have a typo in the module code, or the module is not offered
                this year.
                <br /> Are you sure you are at the right page?
              </p>

              <div className={styles.errorButtonContainer}>
                <button
                  className="btn btn-outline-primary btn-svg"
                  onClick={() =>
                    Raven.showReportDialog({
                      eventId,
                    })
                  }
                >
                  {moduleCode} should be here
                </button>
                <Link className="btn btn-outline-primary btn-svg" to="/">
                  Bring me home
                </Link>
              </div>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => ({
    isLoading: isArchiveLoading(state, ownProps.moduleCode),
    availableArchive: availableArchive(state, ownProps.moduleCode),
  }),
  { fetchModuleArchive: fetchAllModuleArchive },
)(ModuleNotFoundPageComponent);
