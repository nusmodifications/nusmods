import { useCallback, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import classnames from 'classnames';
import { enableCPEx } from 'featureFlags';
import Modal from 'views/components/Modal';
import type { MpeSubmission } from 'types/mpe';
import ExternalLink from 'views/components/ExternalLink';
import {
  getLoginState,
  getSSOLink,
  getMpeSubmission,
  updateMpeSubmission,
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

  const getSubmission = (): Promise<MpeSubmission> =>
    getMpeSubmission().catch((err) => {
      if (err instanceof MpeSessionExpiredError) {
        setIsModalOpen(true);
        setIsLoggedIn(false);
      }
      throw err;
    });

  const updateSubmission = (submission: MpeSubmission): Promise<void> =>
    updateMpeSubmission(submission).catch((err) => {
      if (err instanceof MpeSessionExpiredError) {
        setIsModalOpen(true);
        setIsLoggedIn(false);
      }
      throw err;
    });

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Course Planning Exercise</h1>
        <h4>
          For AY{MPE_AY} - Semester {MPE_SEMESTER}
        </h4>
      </header>

      <h4 className={styles.subtitle}>Overview</h4>
      <p>
        The Course Planning Exercise (CPEx) is a project initiated by NUS to better understand
        students’ demand for specific courses (as decided by the Course Host Departments) and
        facilitate the Departments in their resource and timetable planning.
      </p>
      {enableCPEx ? (
        <>
          <p>
            For this round of exercise, please{' '}
            <strong>
              indicate the course(s) you would like to read for Semester {MPE_SEMESTER} of AY
              {MPE_AY} (maximum of {MAX_MODULES} courses)
            </strong>{' '}
            and the <strong>type of degree requirement</strong> each course is being used for. Do
            note that there are no validation checks for this CPEx (i.e. no timetable
            clash/requisite checks). Information collected here is{' '}
            <strong>solely for planning purposes </strong> and there is no guarantee that you will
            be allocated the selected courses during the CourseReg Exercise.
          </p>
          <p>The CPEx for this round will be from 16 Oct to 20 Oct 2023.</p>
          <p>
            Participation in the CPEx will be used as <strong>one of the tie-breakers</strong>{' '}
            during the CourseReg Exercise, in cases where the demand exceeds the available quota and
            students have the same Priority Score for a particular module.
          </p>
          <p>
            For further questions, please refer to this{' '}
            <ExternalLink href="https://www.nus.edu.sg/registrar/docs/info/cpex/cpex-faqs.pdf">
              FAQ
            </ExternalLink>{' '}
            provided by NUS Registrar's Office.
          </p>
          <div>
            {isLoggedIn ? (
              <MpeFormContainer getSubmission={getSubmission} updateSubmission={updateSubmission} />
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
              OK
            </button>
          </Modal>
        </>
      ) : (
        <>
          <hr />
          <div>CPEx is not open.</div>
        </>
      )}
    </div>
  );
};

export default MpeContainer;
