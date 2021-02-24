import type { MpePreference } from 'types/mpe';
import ModuleFormBeforeSignIn from './ModuleFormBeforeSignIn';
import ModuleForm from './ModuleForm';

type Props = {
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  onLogin: () => void;
  getPreferences: () => Promise<MpePreference[]>;
  updatePreferences: (preferences: MpePreference[]) => Promise<string>;
};

const MpeFormContainer: React.FC<Props> = ({
  isLoggedIn,
  isLoggingIn,
  onLogin,
  getPreferences,
  updatePreferences,
}) => (
  <div>
    {isLoggedIn ? (
      <ModuleForm getPreferences={getPreferences} updatePreferences={updatePreferences} />
    ) : (
      <ModuleFormBeforeSignIn onLogin={onLogin} isLoggingIn={isLoggingIn} />
    )}
  </div>
);

export default MpeFormContainer;
