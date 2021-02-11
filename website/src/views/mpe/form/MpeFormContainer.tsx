import ModuleFormBeforeSignIn from './ModuleFormBeforeSignIn';
import ModuleForm from './ModuleForm';
import type { MpePreference } from 'types/mpe';

type Props = {
  isLoggedIn: boolean;
  onLogin: () => Promise<void>;
  getPreferences: () => Promise<MpePreference[]>;
  updatePreferences: (preferences: MpePreference[]) => Promise<string>;
};

const MpeForm: React.FC<Props> = (props) => {
  return (
    <div>
      {props.isLoggedIn ? (
        <ModuleForm
          getPreferences={props.getPreferences}
          updatePreferences={props.updatePreferences}
        />
      ) : (
          <ModuleFormBeforeSignIn onLogin={props.onLogin} />
        )}
    </div>
  );
};

export default MpeForm;
