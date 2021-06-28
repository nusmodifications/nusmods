import mpePlaceholder from 'img/mpe-placeholder.png';
import styles from './ModuleFormBeforeSignIn.scss';

type Props = {
  onLogin: () => void;
  isLoggingIn: boolean;
};

const ModuleFormBeforeSignIn: React.FC<Props> = ({ onLogin, isLoggingIn }) => (
  <div className={styles.container}>
    <div className={styles.image}>
      <img src={mpePlaceholder} alt="" />
    </div>
    <h4>Start Module Planning Exercise</h4>
    <p>Select your modules and we will automatically save your changes</p>
    <button
      type="button"
      className="btn btn-outline-primary btn-svg"
      onClick={onLogin}
      disabled={isLoggingIn}
    >
      {isLoggingIn ? 'Redirecting...' : 'Sign In With NUS'}
    </button>
  </div>
);

export default ModuleFormBeforeSignIn;
