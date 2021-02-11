import { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import classnames from 'classnames';
import MpeFormContainer from './form/MpeFormContainer';
import styles from './MpeContainer.scss';
import type { MpePreference } from 'types/mpe';
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
  useEffect(() => {
    setIsLoggedIn(isLoggedInOnLoad);
  });

  const onLogin = async (): Promise<void> => {
    try {
      window.location.href = await getSSOLink();
    } catch (err) {
      throw err;
    }
  };

  const getPreferences = async (): Promise<MpePreference[]> => {
    try {
      return await getMpePreferences();
    } catch (err) {
      if (err === ERR_SESSION_EXPIRED) {
        setIsLoggedIn(false);
      }
      throw err;
    }
  };

  const updatePreferences = async (
    preferences: MpePreference[]
  ): Promise<string> => {
    try {
      return await updateMpePreferences(preferences);
    } catch (err) {
      if (err === ERR_SESSION_EXPIRED) {
        setIsLoggedIn(false);
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
          The Module Preference Exercise (MPE) is a project initiated by NUS to
          better understand students’ demand for specific modules. Students who
          have completed this exercise{' '}
          <strong>will receive tie-breaker benefit</strong> during the ModReg
          period.
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
      </div>
    </div>
  );
};

export default MpeContainer;
