import { fetchMpeModuleList } from 'apis/mpe';
import { useEffect, useState } from 'react';
import type { MpeSubmission, MpeModule } from 'types/mpe';
import LoadingSpinner from 'views/components/LoadingSpinner';

import ModuleForm from './ModuleForm';

type Props = {
  getSubmission: () => Promise<MpeSubmission>;
  updateSubmission: (submission: MpeSubmission) => Promise<void>;
};

const MpeFormContainer: React.FC<Props> = ({ getSubmission, updateSubmission }) => {
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [submission, setSubmission] = useState<MpeSubmission>({
    intendedMCs: 0,
    preferences: [],
  });
  const [mpeModuleList, setMpeModuleList] = useState<MpeModule[]>([]);

  // fetch mpe modules and preferences
  useEffect(() => {
    setIsInitialLoad(true);

    Promise.all([fetchMpeModuleList(), getSubmission()])
      .then((data) => {
        setMpeModuleList(data[0]);
        setSubmission(data[1]);
      })
      .catch((err) => {
        // this is a temporary fix
        // eslint-disable-next-line no-console
        console.log(err);
      })
      .finally(() => {
        setIsInitialLoad(false);
      });
  }, [getSubmission]);

  if (isInitialLoad) {
    return <LoadingSpinner />;
  }

  return (
    <ModuleForm
      initialSubmission={submission}
      mpeModuleList={mpeModuleList}
      updateSubmission={updateSubmission}
    />
  );
};
export default MpeFormContainer;
