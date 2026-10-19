import { useEffect, useState } from 'react';
import { fetchMpeModuleList } from 'apis/mpe';
import type { MpeSubmission, MpeModule } from 'types/mpe';
import LoadingSpinner from 'views/components/LoadingSpinner';

import ModuleForm from './ModuleForm';

type Props = {
  getSubmission: () => Promise<MpeSubmission>;
  updateSubmission: (submission: MpeSubmission) => Promise<void>;
  isEditable?: boolean;
};

const MpeFormContainer: React.FC<Props> = ({
  getSubmission,
  updateSubmission,
  isEditable = true,
}) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [submission, setSubmission] = useState<MpeSubmission>({
    intendedMCs: 0,
    preferences: [],
  });
  const [mpeModuleList, setMpeModuleList] = useState<MpeModule[]>([]);

  // fetch mpe modules and preferences
  useEffect(() => {
    setLoadState('loading');

    Promise.all([fetchMpeModuleList(), getSubmission()])
      .then(([fetchedMpeModuleList, fetchedSubmission]) => {
        setMpeModuleList(fetchedMpeModuleList);
        const moduleLookup = new Map(
          fetchedMpeModuleList.map((module) => [module.moduleCode, module]),
        );
        setSubmission({
          ...fetchedSubmission,
          // Replace data fetched from MPE server with latest data from MPE module list
          preferences: fetchedSubmission.preferences.map((preference) => {
            const mpeModule = moduleLookup.get(preference.moduleCode);
            if (!mpeModule) return preference;
            return {
              ...preference,
              moduleTitle: mpeModule.title,
              moduleCredits: parseInt(mpeModule.moduleCredit, 10),
            };
          }),
        });
        setLoadState('loaded');
      })
      .catch(() => setLoadState('error'));
  }, [getSubmission]);

  if (loadState === 'loading') {
    return <LoadingSpinner />;
  }

  if (loadState === 'error') {
    return (
      <p className="text-danger" role="alert">
        Unable to load your CPEx submission. Your saved choices are not displayed.
      </p>
    );
  }

  return (
    <ModuleForm
      initialSubmission={submission}
      mpeModuleList={mpeModuleList}
      updateSubmission={updateSubmission}
      isEditable={isEditable}
    />
  );
};
export default MpeFormContainer;
