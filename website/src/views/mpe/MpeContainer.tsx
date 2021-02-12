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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const isLoggedInOnLoad = useProcessLogin(useLocation(), useHistory());
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  useLayoutEffect(() => {
    setIsLoggedIn(isLoggedInOnLoad);
  }, [isLoggedInOnLoad]);

  const onLogin = async (): Promise<void> => {
    window.location.href = await getSSOLink();
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
          <h2>Module Preference Exercise</h2>
          <h4>AY2021/2022 - Semester 2</h4>
        </header>
        <h4 className={styles.subtitle}>Overview</h4>

        <p>
          The Module Preference Exercise (MPE) is a project initiated by NUS to better understand
          students’ demand for specific modules. Students who have completed this exercise{' '}
          <strong>will receive tie-breaker benefit</strong> during the ModReg period.
        </p>
        <p>
          Do take note that this is only a planning exercise;{' '}
          <strong>it does not enroll you in the modules.</strong>
        </p>
        <MpeFormContainer
          isLoggedIn={isLoggedIn}
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
