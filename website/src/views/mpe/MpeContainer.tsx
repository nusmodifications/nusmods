import classnames from 'classnames';
import { useLayoutEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styles from './MpeContainer.scss';
import MpeFormContainer from './form/MpeFormContainer';
import getLocalStorage from '../../storage/localStorage';
import { NUS_AUTH_TOKEN } from '../../storage/keys';

type Props = {
  placeholder: true; // Remove this when new props are added.
};
const MpeContainer: React.FC<Props> = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const useNUSLogin = () => {
    const location = useLocation();
    const history = useHistory();
    const tokenParamName = 'token';
    useLayoutEffect(() => {
      const params = new URLSearchParams(location.search);
      const token = params.get(tokenParamName);
      const localStorage = getLocalStorage();
      const insertToken = token !== null ? token : '';
      localStorage.setItem(NUS_AUTH_TOKEN, insertToken);
      params.delete(tokenParamName);
      history.replace({
        search: params.toString(),
      });
      if (insertToken !== '') {
        setIsLoggedIn(true);
      }
    }, [history, location.search]);
  };

  useNUSLogin();

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
        <MpeFormContainer isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
};

export default MpeContainer;
