import { useCallback, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import classnames from 'classnames';
import Modal from 'views/components/Modal';
import type { MpePreference } from 'types/mpe';
import {
  getLoginState,
  getSSOLink,
  getMpePreferences,
  updateMpePreferences,
  MpeSessionExpiredError,
} from '../../apis/mpe';
import ModuleFormBeforeSignIn from './form/ModuleFormBeforeSignIn';
import ModuleFormContainer from './form/ModuleFormContainer';
import styles from './MpeContainer.scss';

const MpeContainer: React.FC = () => {
  const [isGettingSSOLink, setIsGettingSSOLink] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const isLoggedIn = getLoginState(useLocation(), useHistory());

  const onLogin = useCallback(() => {
    setIsGettingSSOLink(true);
    return getSSOLink()
      .then((ssoLink) => {
        window.location.href = ssoLink;
      })
      .finally(() => {
        setIsGettingSSOLink(false);
      });
  }, []);

  const getPreferences = (): Promise<MpePreference[]> =>
    getMpePreferences().catch((err) => {
      if (err instanceof MpeSessionExpiredError) {
        setIsSessionExpired(true);
      }
      throw err;
    });

  const updatePreferences = (preferences: MpePreference[]): Promise<string> =>
    updateMpePreferences(preferences).catch((err) => {
      if (err instanceof MpeSessionExpiredError) {
        setIsSessionExpired(true);
      }
      throw err;
    });

  return (
    <div className={styles.pageContainer}>
      <div className={classnames(styles.innerContainer, 'col-md-8')}>
        <header className={styles.header}>
          <h1>Module Planning Exercise</h1>
          <h4>AY2021/2022 - Semester 2</h4>
        </header>
        <h4 className={styles.subtitle}>Overview</h4>

        <p>
          The Module Planning Exercise (MPE) is a project initiated by NUS to better understand
          students’ demand for specific modules (as decided by the Module Host Departments) and
          facilitate the Departments in their resource and timetable planning.
        </p>
        <p>
          All current undergraduate and graduate students can{' '}
          <strong>select up to 7 modules per semester.</strong> Do note that there are no validation
          checks for this MPE (i.e. no timetable clash/requisite checks). Information collected here
          is <strong>solely for planning purposes </strong> and there is no guarantee that you will
          be allocated the selected modules during the ModReg Exercise.
        </p>
        <p>
          Participation in the MPE will be used as <strong>one of the tie-breakers</strong> during
          the ModReg Exercise, in cases where the demand exceeds the available quota and students
          have the same Priority Score for a particular module.
        </p>
        <div>
          {isLoggedIn ? (
            <ModuleFormContainer getPreferences={getPreferences} updatePreferences={updatePreferences} />
          ) : (
            <ModuleFormBeforeSignIn onLogin={onLogin} isLoggingIn={isGettingSSOLink} />
          )}
        </div>
        <Modal
          isOpen={isSessionExpired}
          onRequestClose={() => setIsSessionExpired(false)}
          shouldCloseOnOverlayClick={false}
          animate
        >
          Your session has expired. Please sign in again!
          <br /> <br />
          <button
            type="button"
            className={classnames('btn btn-outline-primary btn-svg', styles.ErrorButton)}
            onClick={() => setIsSessionExpired(false)}
          >
            Ok
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default MpeContainer;
