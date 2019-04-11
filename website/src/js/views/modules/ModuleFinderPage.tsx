import * as React from 'react';

import { ModuleInformation } from 'types/modules';
import ModuleFinderItem from 'views/components/ModuleFinderItem';

type Props = {
  page: ModuleInformation[];
};

const ModuleFinderPage = React.memo(({ page }: Props) => (
  <ul className="modules-list">
    {page.map((module) => (
      <ModuleFinderItem key={module.moduleCode} module={module} />
    ))}
  </ul>
));

export default ModuleFinderPage;
