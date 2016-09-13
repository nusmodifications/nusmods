import React, { Component, PropTypes } from 'react';

import VirtualizedSelect from 'react-virtualized-select';
import createFilterOptions from 'react-select-fast-filter-options';
import { PrefixIndexStrategy } from 'js-search';
import { ModulesSearchIndex, ModulesTokenizer } from 'utils/modules-search';

class ModulesSelect extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.moduleList !== nextProps.moduleList;
  }

  render() {
    const filterOptions = createFilterOptions({
      options: this.props.moduleList,
      indexStrategy: new PrefixIndexStrategy(),
      tokenizer: new ModulesTokenizer(),
      searchIndex: new ModulesSearchIndex(),
    });
    return (
      <VirtualizedSelect options={this.props.moduleList}
        filterOptions={filterOptions}
        placeholder="Search module"
        onChange={this.props.onChange}
      />
    );
  }
}

ModulesSelect.propTypes = {
  moduleList: PropTypes.array,
  onChange: PropTypes.func,
};

export default ModulesSelect;
