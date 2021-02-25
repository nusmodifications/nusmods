import { Component } from 'react';
import { omit } from 'lodash';
import Downshift, {
  ChildrenFunction,
  ControllerStateAndHelpers,
  DownshiftState,
  StateChangeOptions,
} from 'downshift';
import classnames from 'classnames';
import { Trash } from 'react-feather';

import { ModuleSelectList } from 'types/reducers';
import { ModuleCode } from 'types/modules';

import { breakpointUp } from 'utils/css';
import makeResponsive from 'views/hocs/makeResponsive';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';
import elements from 'views/elements';
import Tooltip from 'views/components/Tooltip';

import styles from './ModulesSelect.scss';

type Props = {
  moduleCount: number;
  placeholder: string;
  matchBreakpoint: boolean;
  disabled?: boolean;

  getFilteredModules: (string: string | null) => ModuleSelectList;
  onChange: (moduleCode: ModuleCode) => void;
  onRemoveModule: (moduleCode: ModuleCode) => void;
};

type State = {
  isOpen: boolean;
  inputValue: string;
};

export class ModulesSelectComponent extends Component<Props, State> {
  state = {
    isOpen: false,
    inputValue: '',
  };

  onOuterClick = () => {
    this.setState({
      isOpen: false,
      // Cannot use prevState as prevState.inputValue will be empty string
      // instead of the (possibly non-empty) this.state.inputValue.
      // eslint-disable-next-line react/no-access-state-in-setstate
      inputValue: this.state.inputValue,
    });
  };

  onInputValueChange = (
    inputValue: string,
    stateAndHelpers: ControllerStateAndHelpers<ModuleCode>,
  ) => {
    // Don't clear input on item select
    if (stateAndHelpers.selectedItem) return;

    this.setState({
      inputValue,
    });
  };

  onChange = (selectedItem: ModuleCode | null) => selectedItem && this.props.onChange(selectedItem);

  closeSelect = () => {
    this.setState({
      isOpen: false,
      inputValue: '',
    });
  };

  openSelect = () =>
    this.setState({
      isOpen: true,
    });

  stateReducer = (state: DownshiftState<ModuleCode>, changes: StateChangeOptions<ModuleCode>) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.blurInput:
        if (state.inputValue) return {}; // remain open on iOS
        this.closeSelect();

        return changes;

      case Downshift.stateChangeTypes.keyDownEnter:
      case Downshift.stateChangeTypes.clickItem:
        // Don't reset isOpen, inputValue and highlightedIndex when item is selected
        return omit(changes, ['isOpen', 'inputValue', 'highlightedIndex']);

      case Downshift.stateChangeTypes.mouseUp:
        // TODO: Uncomment when we upgrade to Downshift v3
        // case Downshift.stateChangeTypes.touchEnd:
        // Retain input on blur
        return omit(changes, 'inputValue');

      default:
        return changes;
    }
  };

  // downshift attaches label for us; autofocus only applies to modal
  /* eslint-disable jsx-a11y/label-has-for, jsx-a11y/no-autofocus */
  renderDropdown: ChildrenFunction<ModuleCode> = ({
    getLabelProps,
    getInputProps,
    getItemProps,
    getMenuProps,
    isOpen,
    inputValue,
    highlightedIndex,
  }) => {
    const { placeholder, disabled, moduleCount } = this.props;
    const isModalOpen = !this.props.matchBreakpoint && isOpen;
    const results = this.props.getFilteredModules(inputValue);
    const showResults = isOpen && results.length > 0;
    const showTip = isModalOpen && !results.length;
    const showNoResultMessage = isOpen && inputValue && !results.length;
    const removeBtnLabel = (moduleCode: ModuleCode) => `Remove ${moduleCode} from MPE preferences`;

    return (
      <div className={styles.container}>
        <label className="sr-only" {...getLabelProps()}>
          {placeholder}
        </label>
        <input
          {...getInputProps({
            className: classnames(styles.input, elements.addModuleInput),
            autoFocus: isModalOpen,
            disabled,
            placeholder,
            // no onBlur as that means people can't click menu items as
            // input has lost focus, see 'onOuterClick' instead
            onFocus: this.openSelect,
          })}
        />
        {isModalOpen && <CloseButton className={styles.close} onClick={this.closeSelect} />}
        {showResults && (
          <ol className={styles.selectList} {...getMenuProps()}>
            {results.map((module, index) => (
              <li
                {...getItemProps({
                  index,
                  key: module.moduleCode,
                  item: module.moduleCode,
                  disabled: module.isAdded || module.isAdding,
                })}
                className={classnames(styles.option, {
                  [styles.optionDisabled]: module.isAdded || module.isAdding,
                  [styles.optionSelected]: highlightedIndex === index,
                })}
              >
                {/* Using interpolated string instead of JSX because of iOS Safari
                    bug that drops the whitespace between the module code and title */}
                {`${module.moduleCode} ${module.title}`}
                {module.isAdded && (
                  <div className={styles.optionActions}>
                    <Tooltip content={removeBtnLabel(module.moduleCode)} touch="hold">
                      <button
                        type="button"
                        className={classnames('btn btn-svg btn-sm', styles.actionButton)}
                        aria-label={removeBtnLabel(module.moduleCode)}
                        onClick={() => {
                          this.props.onRemoveModule(module.moduleCode);
                        }}
                      >
                        <Trash className={styles.actionIcon} />{' '}
                      </button>
                    </Tooltip>
                    <span className="badge badge-info">Added</span>
                  </div>
                )}

                {module.isAdding && (
                  <div>
                    <span className="badge badge-warning">Adding...</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
        {showTip && (
          <div className={styles.tip}>
            Try &quot;GER1000&quot; or &quot;Quantitative Reasoning&quot;. Searching{' '}
            <strong>{moduleCount}</strong> modules.
          </div>
        )}
        {showNoResultMessage && (
          <div className={styles.tip}>
            No modules found for{' '}
            <strong>
              &quot;
              {inputValue}
              &quot;
            </strong>
            .
          </div>
        )}
      </div>
    );
  };

  render() {
    const { isOpen } = this.state;
    const { matchBreakpoint, disabled } = this.props;

    const downshiftComponent = (
      <Downshift
        isOpen={isOpen}
        onOuterClick={this.onOuterClick}
        inputValue={this.state.inputValue}
        onChange={this.onChange}
        onInputValueChange={this.onInputValueChange}
        selectedItem={null}
        stateReducer={this.stateReducer}
        defaultHighlightedIndex={0}
      >
        {this.renderDropdown}
      </Downshift>
    );

    if (matchBreakpoint) {
      return downshiftComponent;
    }

    return (
      <>
        <button
          type="button"
          className={classnames(styles.input, elements.addModuleInput)}
          onClick={this.openSelect}
          disabled={disabled}
        >
          {this.props.placeholder}
        </button>
        <Modal
          isOpen={!disabled && isOpen}
          onRequestClose={this.closeSelect}
          className={styles.modal}
          shouldCloseOnOverlayClick={false}
          fullscreen
        >
          {downshiftComponent}
        </Modal>
      </>
    );
  }
}

export default makeResponsive(ModulesSelectComponent, breakpointUp('md'));
