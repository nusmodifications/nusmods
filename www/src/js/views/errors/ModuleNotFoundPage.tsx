// @flow
import React, { PureComponent, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import classnames from 'classnames';
import * as Sentry from '@sentry/browser';

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
    Sentry.withScope(() => {
      Sentry.captureMessage('404 - Module Not Found');
    });

    // If we think this is a module, try checking for archived modules
    if (this.props.moduleCode.match(MODULE_CODE_REGEX)) {
      this.props.fetchModuleArchive(this.props.moduleCode);
    }
  }

  render() {
    const { moduleCode, isLoading } = this.props;

    if (isLoading) {
      return <LoadingSpinner />;
    }

    return (
      <div className={styles.container}>
        <Title>Module Not Found</Title>

        {this.props.availableArchive.length ? (
          <Fragment>
            <div className={styles.header}>
              <RandomKawaii size={100} />
            </div>

            <h1 className={classnames('h3', styles.header)}>
              <span className={styles.expr}>{moduleCode}</span> is not currently offered
            </h1>

            <p>However, it was previously offered in these academic years</p>

            <div className={styles.buttons}>
              {this.props.availableArchive.map((year) => (
                <Link
                  className="btn btn-outline-primary"
                  to={moduleArchive(moduleCode, year)}
                  key={year}
                >
                  AY
                  {year} archive
                </Link>
              ))}
            </div>

            <p>
              Otherwise, if this is not what you are looking for,{' '}
              <Link to="/">go back to nusmods.com</Link> or{' '}
              <Link to="/modules">try the module finder</Link>.
            </p>
          </Fragment>
        ) : (
          <Fragment>
            <h1 className={styles.heading}>
              <span className={styles.bigCharacter}>4</span>
              <RandomKawaii aria-label="0" title="0" size={100} />
              <span className={styles.bigCharacter}>4</span>
            </h1>

            <h2>Oops, module {moduleCode} not found.</h2>

            <p>
              This usually means you have a typo in the module code, or the module is not offered
              this year.
            </p>

            <div className={styles.buttons}>
              <button className="btn btn-outline-primary" onClick={() => Sentry.showReportDialog()}>
                {moduleCode} should be here
              </button>
              <Link className="btn btn-primary" to="/">
                Bring me home
              </Link>
            </div>
          </Fragment>
        )}
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
