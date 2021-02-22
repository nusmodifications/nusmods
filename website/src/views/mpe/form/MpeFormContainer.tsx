import type { MpePreference } from 'types/mpe';
import ModuleFormBeforeSignIn from './ModuleFormBeforeSignIn';
import ModuleForm from './ModuleForm';

type Props = {
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  onLogin: () => Promise<void>;
  getPreferences: () => Promise<MpePreference[]>;
  updatePreferences: (preferences: MpePreference[]) => Promise<string>;
};

const MpeForm: React.FC<Props> = (props) => (
  <div>
    {props.isLoggedIn ? (
      <ModuleForm
        getPreferences={props.getPreferences}
        updatePreferences={props.updatePreferences}
      />
    ) : (
      <ModuleFormBeforeSignIn onLogin={props.onLogin} isLoggingIn={props.isLoggingIn} />
    )}
  </div>
);

export default MpeForm;
