import * as React from 'react';

import { ModuleInformation } from 'types/modules';
import ModuleFinderItem from 'views/components/ModuleFinderItem';

type Props = {
  page: ModuleInformation[];
};

export default class ModuleFinderPage extends React.PureComponent<Props> {
  render() {
    const { page } = this.props;

    return (
      <ul className="modules-list">
        {page.map((module) => (
          <ModuleFinderItem key={module.ModuleCode} module={module} />
        ))}
      </ul>
    );
  }
}
