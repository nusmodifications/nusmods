import {
  PageSizeAccessor,
  PaginationAccessor,
  SearchkitComponent,
  SearchkitComponentProps,
} from 'searchkit';
import { ModuleCode } from 'types/modules';

export type RandomPickerProps = {
  getRandomModuleCode: () => Promise<ModuleCode>;
};

interface SearchkitRandomPickerProps extends SearchkitComponentProps {
  buttonComponent: React.ElementType<RandomPickerProps>;
}

type State = Record<string, never>;

export default class RandomPicker extends SearchkitComponent<SearchkitRandomPickerProps, State> {
  paginationAccessor() {
    return this.accessor as PaginationAccessor;
  }

  // eslint-disable-next-line class-methods-use-this
  override defineAccessor() {
    return new PaginationAccessor('p');
  }

  getRandomModuleCode = async (): Promise<ModuleCode> => {
    const sizeAccessor = this.searchkit.getAccessorByType(PageSizeAccessor) as PageSizeAccessor;
    const totalPages = Math.ceil(this.searchkit.getHitsCount() / sizeAccessor.getSize());
    const randomPage = Math.floor(Math.random() * totalPages);

    this.paginationAccessor().state = this.paginationAccessor().state.setValue(randomPage);
    const { hits } = (await this.searchkit.performSearch()).results.hits;
    const randomHit = hits[Math.floor(Math.random() * hits.length)];
    /* eslint-disable no-underscore-dangle */
    return randomHit._source.moduleCode;
  };

  override render() {
    const { buttonComponent: Button } = this.props;
    return <Button getRandomModuleCode={this.getRandomModuleCode} />;
  }
}
