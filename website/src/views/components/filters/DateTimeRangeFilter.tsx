import * as React from 'react';
import {
  FieldContextFactory,
  FieldOptions,
  FilterBasedAccessor,
  ImmutableQuery,
  ObjectState,
  RangeQuery,
  SearchkitComponent,
  SearchkitComponentProps,
} from 'searchkit';

import FilterContainer from './FilterContainer';

type DateTimeRange = {
  start?: string;
  end?: string;
};

interface DateTimeRangeAccessorOptions {
  id: string;
  title: string;
  field: string;
  fieldOptions?: FieldOptions;
}

class DateTimeRangeAccessor extends FilterBasedAccessor<ObjectState> {
  override state = new ObjectState({});

  private readonly title: string;

  private readonly field: string;

  private readonly fieldContext;

  constructor(key: string, { id, title, field, fieldOptions }: DateTimeRangeAccessorOptions) {
    super(key, id);
    this.title = title;
    this.field = field;

    const resolvedFieldOptions = fieldOptions || { type: 'embedded' };
    resolvedFieldOptions.field = field;
    this.fieldContext = FieldContextFactory(resolvedFieldOptions);
  }

  override buildSharedQuery(query: ImmutableQuery) {
    if (!this.state.hasValue()) return query;

    const value = this.state.getValue() as DateTimeRange;
    const rangeQuery = getRangeQuery(value);
    if (!rangeQuery) return query;

    return query
      .addFilter(this.uuid, this.fieldContext.wrapFilter(RangeQuery(this.field, rangeQuery)))
      .addSelectedFilter({
        name: this.title,
        value: getSelectedValue(value),
        id: this.key,
        remove: () => {
          this.state = this.state.clear();
        },
      });
  }
}

interface Props extends SearchkitComponentProps {
  id: string;
  title: string;
  field: string;
  fieldOptions?: FieldOptions;
}

function toDateRange(nextRange: DateTimeRange): DateTimeRange | null {
  const entries = Object.entries(nextRange).filter(([, value]) => Boolean(value));
  return entries.length ? Object.fromEntries(entries) : null;
}

function normalizeDateTime(value: string): string {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toISOString();
}

function getRangeQuery({ start, end }: DateTimeRange): Record<string, string> | null {
  const rangeQuery = {
    ...(start ? { gte: normalizeDateTime(start) } : {}),
    ...(end ? { lte: normalizeDateTime(end) } : {}),
  };

  return Object.keys(rangeQuery).length ? rangeQuery : null;
}

function getSelectedValue({ start, end }: DateTimeRange): string {
  if (start && end) return `${start} - ${end}`;
  return start || end || '';
}

export default class DateTimeRangeFilter extends SearchkitComponent<Props, never> {
  declare accessor: DateTimeRangeAccessor;

  override defineAccessor() {
    const { id, title, field, fieldOptions } = this.props;
    return new DateTimeRangeAccessor(id, { id, title, field, fieldOptions });
  }

  setRangeValue =
    (field: keyof DateTimeRange): React.ChangeEventHandler<HTMLInputElement> =>
    (evt) => {
      const currentRange = (this.accessor.state.getValue() as DateTimeRange) || {};
      const nextRange = toDateRange({
        ...currentRange,
        [field]: evt.target.value,
      });

      this.accessor.state = nextRange
        ? this.accessor.state.setValue(nextRange)
        : this.accessor.state.clear();
      this.searchkit.performSearch();
    };

  override render() {
    if (!this.accessor) return null;

    const { id, title } = this.props;
    const { start = '', end = '' } = (this.accessor.state.getValue() as DateTimeRange) || {};

    return (
      <FilterContainer title={title}>
        <div className="mb-2">
          <label className="small d-block" htmlFor={`${id}-start`}>
            Start
          </label>
          <input
            id={`${id}-start`}
            type="datetime-local"
            className="form-control form-control-sm"
            value={start}
            max={end || undefined}
            onChange={this.setRangeValue('start')}
          />
        </div>
        <div>
          <label className="small d-block" htmlFor={`${id}-end`}>
            End
          </label>
          <input
            id={`${id}-end`}
            type="datetime-local"
            className="form-control form-control-sm"
            value={end}
            min={start || undefined}
            onChange={this.setRangeValue('end')}
          />
        </div>
      </FilterContainer>
    );
  }
}
