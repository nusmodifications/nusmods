import classnames from 'classnames';
import mpePlaceholder from 'img/mpe-placeholder.png';
import styles from './ModuleFormBeforeSignIn.scss';

type Props = {
  onLogin: () => Promise<void>;
};

const ModuleFormBeforeSignIn: React.FC<Props> = (prop) => (
  <div className={classnames(styles.container, 'col-md-6')}>
    <div className={styles.image}>
      <img src={mpePlaceholder} alt="" />
    </div>
    <h4>Start Module Preference Exercise</h4>
    <p>Select your modules and we will automatically save your changes</p>
    <button
      type="button"
      className='btn btn-outline-primary btn-svg'
      onClick={prop.onLogin}
    >
      Sign In With NUS
    </button>
  </div>
);

export default ModuleFormBeforeSignIn;
