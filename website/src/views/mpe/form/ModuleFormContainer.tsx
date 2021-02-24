import { useEffect, useState } from 'react';
import type { MpePreference } from 'types/mpe';
import LoadingSpinner from 'views/components/LoadingSpinner';

import ModuleForm from './ModuleForm';

type Props = {
  getPreferences: () => Promise<MpePreference[]>;
  updatePreferences: (preferences: MpePreference[]) => Promise<string>;
};

const MpeFormContainer: React.FC<Props> = ({ getPreferences, updatePreferences }) => {
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [preferences, setPreferences] = useState<MpePreference[]>([]);

  // fetch preferences
  useEffect(() => {
    setIsInitialLoad(true);
    getPreferences()
      .then((result) => {
        setPreferences(result);
      })
      .catch((err) => {
        // this is a temporary fix
        // eslint-disable-next-line no-console
        console.log(err);
      })
      .finally(() => {
        setIsInitialLoad(false);
      });
  }, [getPreferences]);

  if (isInitialLoad) {
    return <LoadingSpinner />;
  }

  return <ModuleForm initialPreferences={preferences} updatePreferences={updatePreferences} />;
};
export default MpeFormContainer;
