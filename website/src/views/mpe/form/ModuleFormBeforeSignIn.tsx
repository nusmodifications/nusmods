import classnames from 'classnames';
import styles from './ModuleFormBeforeSignIn.scss';

type Props = {
  placeholder?: true; // placeholder
};

const ModuleFormBeforeSignIn: React.FC<Props> = () => (
  <div className={styles.container}>
    <div className={styles.image}>
      <img src="https://i.ibb.co/rGvCQNd/mpe-Place-Holder.png" alt="Timetable" />
    </div>
    <h4>Start Module Preference Exercise</h4>
    <p>Select your modules and we will automatically save your changes</p>
    <button type="button" className={classnames('btn btn-outline-primary btn-svg')}>
      Sign In With NUS
    </button>
  </div>
);

export default ModuleFormBeforeSignIn;
