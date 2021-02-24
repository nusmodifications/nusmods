import type { MpePreference } from 'types/mpe';
import ModuleForm from './ModuleForm';

type Props = {
  getPreferences: () => Promise<MpePreference[]>;
  updatePreferences: (preferences: MpePreference[]) => Promise<string>;
};

const MpeFormContainer: React.FC<Props> = ({ getPreferences, updatePreferences }) => (
  <ModuleForm getPreferences={getPreferences} updatePreferences={updatePreferences} />
);

export default MpeFormContainer;
