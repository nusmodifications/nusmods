import { useCallback, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { enableMpe } from 'featureFlags';
import type { MpeModule, MpeSubmission } from 'types/mpe';
import Modal from 'views/components/Modal';
import {
  fetchMpeModuleList,
  getMpeSubmission,
  getSSOLink,
  getTokenFromStorage,
  getTokenFromUrl,
  MpeSessionExpiredError,
  setToken,
  updateMpeSubmission,
} from '../../apis/mpe';
import { MAX_MODULES, MPE_AY, MPE_SEMESTER } from './constants';
import ModuleForm from './form/ModuleForm';
import ModuleFormBeforeSignIn from './form/ModuleFormBeforeSignIn';
import styles from './MpeContainer.scss';

const MPE_TOKEN_MESSAGE_PREFIX = 'MPE_TOKEN:';

const MpeContainer: React.FC = () => {
  const [isGettingSSOLink, setIsGettingSSOLink] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingPreviousSubmission, setIsLoadingPreviousSubmission] = useState(false);
  const [isSessionExpiredModalOpen, setSessionExpiredModalOpen] = useState(false);

  const moduleListPromise = useRef<Promise<MpeModule[]>>(null);
  const ssoWindow = useRef<Window>(null);

  const [moduleList, setModuleList] = useState<MpeModule[]>();
  const [submission, setSubmission] = useState<MpeSubmission>();

  // HACK: Needed to get the current state of submission into loadPreviousSubmission() without making submission a dep
  const submissionRef = useRef<MpeSubmission>(null);
  submissionRef.current = submission;

  const loadPreviousSubmission = useCallback(() => {
    if (submissionRef.current == null) {
      return;
    }

    setIsLoadingPreviousSubmission(true);
    getMpeSubmission()
      .catch((err) => {
        if (err instanceof MpeSessionExpiredError) {
          setSessionExpiredModalOpen(true);
        }
        throw err; // TODO: Handle not being able to get previous submission, need to let user retry
      })
      .then((previousSubmission) => {
        setSubmission(previousSubmission);
      })
      .finally(() => {
        setIsLoadingPreviousSubmission(false);
      });
  }, []);

  useEffect(() => {
    // If the there is a token in the URL then we've just been redirected back, so we pass the
    // token back to the parent window and exit
    const urlToken = getTokenFromUrl();
    if (urlToken != null) {
      setToken(urlToken);

      if (window.opener) {
        window.opener.postMessage(MPE_TOKEN_MESSAGE_PREFIX + urlToken, window.location.origin);
        window.opener.focus();
        window.close();
        return undefined;
      }
    }

    // If the user already has a token, we try to load their previous submission
    const storedToken = getTokenFromStorage();
    if (storedToken != null) {
      loadPreviousSubmission();
    }

    // Add an event listener to catch the incoming token and
    const tokenListener = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        typeof event.data === 'string' &&
        event.data.startsWith(MPE_TOKEN_MESSAGE_PREFIX)
      ) {
        setIsLoggingIn(false);
        setToken(event.data.slice(MPE_TOKEN_MESSAGE_PREFIX.length));
        loadPreviousSubmission();
      }
    };

    window.addEventListener('message', tokenListener);

    // Fetch module list
    moduleListPromise.current = fetchMpeModuleList()
      .then((data) => setModuleList(data))
      .catch(() => {
        // TODO: Handle fetch module error, probably need to let the user retry
      });

    return () => {
      window.removeEventListener('message', tokenListener);
    };
  }, [loadPreviousSubmission]);

  const onLogin = useCallback(() => {
    setIsGettingSSOLink(true);
    return getSSOLink()
      .then((ssoLink) => {
        setIsLoggingIn(true);
        ssoWindow.current = window.open(ssoLink, 'MPE_SSO');
      })
      .finally(() => {
        setIsGettingSSOLink(false);
      });
  }, []);

  const updateSubmission = (newSubmission: MpeSubmission): Promise<void> =>
    updateMpeSubmission(newSubmission).catch((err) => {
      if (err instanceof MpeSessionExpiredError) {
        setSessionExpiredModalOpen(true);
      }
      throw err;
    });

  return (
    <div className={styles.pageContainer}>
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
      {enableMpe ? (
        <>
          <p>
            For this round of exercise, please{' '}
            <strong>
              indicate the module(s) you would like to read for Semester {MPE_SEMESTER} of AY
              {MPE_AY} (maximum of {MAX_MODULES} modules)
            </strong>{' '}
            and the <strong>type of degree requirement</strong> each module is being used for. Do
            note that there are no validation checks for this MPE (i.e. no timetable clash/requisite
            checks). Information collected here is <strong>solely for planning purposes </strong>{' '}
            and there is no guarantee that you will be allocated the selected modules during the
            ModReg Exercise.
          </p>
          <p>The MPE for this round will be from 1 Mar to 14 Mar 2021.</p>
          <p>
            Participation in the MPE will be used as <strong>one of the tie-breakers</strong> during
            the ModReg Exercise, in cases where the demand exceeds the available quota and students
            have the same Priority Score for a particular module.
          </p>

          <div>
            {submission != null && moduleList != null ? (
              <ModuleForm
                submission={submission}
                mpeModuleList={moduleList}
                updateSubmission={updateSubmission}
              />
            ) : (
              <ModuleFormBeforeSignIn onLogin={onLogin} isLoggingIn={isGettingSSOLink} />
            )}
          </div>
          <Modal
            isOpen={isSessionExpiredModalOpen}
            onRequestClose={() => setSessionExpiredModalOpen(false)}
            shouldCloseOnOverlayClick={false}
            animate
          >
            <p>Your session has expired. Please sign in again!</p>
            <button
              type="button"
              className="btn btn-primary btn-svg"
              onClick={onLogin}
              disabled={isLoggingIn}
            >
              {isGettingSSOLink ? 'Redirecting...' : 'Sign In With NUS'}
            </button>

            <button
              type="button"
              className={classnames('btn btn-outline-primary btn-svg', styles.ErrorButton)}
              onClick={() => setSessionExpiredModalOpen(false)}
            >
              Cancel
            </button>
          </Modal>
        </>
      ) : (
        <>
          <hr />
          <div>MPE is not open.</div>
        </>
      )}
    </div>
  );
};

export default MpeContainer;
