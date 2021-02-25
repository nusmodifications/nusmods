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
import { MAX_MODULES, MPE_AY, MPE_SEMESTER } from './constants';
import ModuleFormBeforeSignIn from './form/ModuleFormBeforeSignIn';
import MpeFormContainer from './form/MpeFormContainer';
import styles from './MpeContainer.scss';

const MpeContainer: React.FC = () => {
  const [isGettingSSOLink, setIsGettingSSOLink] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(getLoginState(useLocation(), useHistory()));

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
        setIsModalOpen(true);
        setIsLoggedIn(false);
      }
      throw err;
    });

  const updatePreferences = (preferences: MpePreference[]): Promise<void> =>
    updateMpePreferences(preferences).catch((err) => {
      if (err instanceof MpeSessionExpiredError) {
        setIsModalOpen(true);
        setIsLoggedIn(false);
      }
      throw err;
    });

  return (
    <div className={styles.pageContainer}>
      <div className={classnames(styles.innerContainer, 'col-md-12 col-lg-9')}>
        <header className={styles.header}>
          <h1>Module Planning Exercise</h1>
          <h4>
            For AY{MPE_AY} - Semester {MPE_SEMESTER}
          </h4>
        </header>

        <h4 className={styles.subtitle}>Overview</h4>

        <p>
          The Module Planning Exercise (MPE) is a project initiated by NUS to better understand
          students’ demand for specific modules (as decided by the Module Host Departments) and
          facilitate the Departments in their resource and timetable planning.
        </p>
        <p>
          For this round of exercise, please{' '}
          <strong>
            {' '}
            indicate the module(s) you would like to read for Semester {MPE_SEMESTER} of AY{MPE_AY}{' '}
            (maximum of {MAX_MODULES} modules)
          </strong>{' '}
          and the <strong>type of degree requirement</strong> each module is being used for. Do note
          that there are no validation checks for this MPE (i.e. no timetable clash/requisite
          checks). Information collected here is <strong>solely for planning purposes </strong> and
          there is no guarantee that you will be allocated the selected modules during the ModReg
          Exercise.
        </p>
        <p>The MPE for this round will be from 1 Mar to 14 Mar 2021.</p>
        <p>
          Participation in the MPE will be used as <strong>one of the tie-breakers</strong> during
          the ModReg Exercise, in cases where the demand exceeds the available quota and students
          have the same Priority Score for a particular module.
        </p>
        <div>
          {isLoggedIn ? (
            <MpeFormContainer
              getPreferences={getPreferences}
              updatePreferences={updatePreferences}
            />
          ) : (
            <ModuleFormBeforeSignIn onLogin={onLogin} isLoggingIn={isGettingSSOLink} />
          )}
        </div>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          shouldCloseOnOverlayClick={false}
          animate
        >
          <p>Your session has expired. Please sign in again!</p>
          <button
            type="button"
            className={classnames('btn btn-outline-primary btn-svg', styles.ErrorButton)}
            onClick={() => setIsModalOpen(false)}
          >
            Ok
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default MpeContainer;
