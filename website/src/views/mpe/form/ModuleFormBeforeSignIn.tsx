import { Button } from 'components/ui/button';
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
    <h4>Start Course Planning Exercise</h4>
    <p>Select your courses and we will automatically save your changes</p>
    <Button
      variant="outline"
      type="button"
      className=" btn-svg"
      onClick={onLogin}
      disabled={isLoggingIn}
    >
      {isLoggingIn ? 'Redirecting...' : 'Sign In With NUS'}
    </Button>
  </div>
);

export default ModuleFormBeforeSignIn;
