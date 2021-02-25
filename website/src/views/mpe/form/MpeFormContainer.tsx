import { fetchMpeModuleList } from 'apis/mpe';
import { useEffect, useState } from 'react';
import type { MpePreference, MpeModule } from 'types/mpe';
import LoadingSpinner from 'views/components/LoadingSpinner';

import ModuleForm from './ModuleForm';

type Props = {
  getPreferences: () => Promise<MpePreference[]>;
  updatePreferences: (preferences: MpePreference[]) => Promise<void>;
};

const MpeFormContainer: React.FC<Props> = ({ getPreferences, updatePreferences }) => {
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [preferences, setPreferences] = useState<MpePreference[]>([]);
  const [mpeModuleList, setMpeModuleList] = useState<MpeModule[]>([]);

  // fetch mpe modules and preferences
  useEffect(() => {
    setIsInitialLoad(true);

    Promise.all([fetchMpeModuleList(), getPreferences()])
      .then((data) => {
        setMpeModuleList(data[0]);
        setPreferences(data[1]);
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

  return (
    <ModuleForm
      initialPreferences={preferences}
      mpeModuleList={mpeModuleList}
      updatePreferences={updatePreferences}
    />
  );
};
export default MpeFormContainer;
