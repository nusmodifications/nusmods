import { useLayoutEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import type { MpePreference } from 'types/mpe';
import classnames from 'classnames';
import Modal from 'views/components/Modal';
import MpeFormContainer from './form/MpeFormContainer';
import styles from './MpeContainer.scss';
import {
  useProcessLogin,
  getSSOLink,
  getMpePreferences,
  updateMpePreferences,
  ERR_SESSION_EXPIRED,
} from '../../apis/mpe';

const MpeContainer: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGettingSSOLink, setIsGettingSSOLink] = useState(false);
  const isLoggedInOnLoad = useProcessLogin(useLocation(), useHistory());
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useLayoutEffect(() => {
    setIsLoggedIn(isLoggedInOnLoad);
  }, [isLoggedInOnLoad]);

  const onLogin = async (): Promise<void> => {
    try {
      setIsGettingSSOLink(true);
      window.location.href = await getSSOLink();
    } catch (err) {
      setIsLoggedIn(false);
    } finally {
      setIsGettingSSOLink(false);
    }
  };

  const getPreferences = async (): Promise<MpePreference[]> => {
    try {
      return await getMpePreferences();
    } catch (err) {
      if (err === ERR_SESSION_EXPIRED) {
        setIsLoggedIn(false);
        setIsSessionExpired(true);
      }
      throw err;
    }
  };

  const updatePreferences = async (preferences: MpePreference[]): Promise<string> => {
    try {
      return await updateMpePreferences(preferences);
    } catch (err) {
      if (err === ERR_SESSION_EXPIRED) {
        setIsLoggedIn(false);
        setIsSessionExpired(true);
      }
      throw err;
    }
  };

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
        <MpeFormContainer
          isLoggedIn={isLoggedIn}
          isLoggingIn={isGettingSSOLink}
          onLogin={onLogin}
          getPreferences={getPreferences}
          updatePreferences={updatePreferences}
        />
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
