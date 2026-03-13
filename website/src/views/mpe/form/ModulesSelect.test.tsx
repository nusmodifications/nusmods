import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModulesSelectComponent } from './ModulesSelect';

vi.mock('views/components/Modal', () => ({
  default: ({ children, isOpen, onRequestClose }: any) =>
    isOpen ? (
      <div data-testid="modal">
        <button type="button" onClick={onRequestClose}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

const modules = [
  {
    moduleCode: 'Test1',
    title: 'ModuleTitle',
    isAdded: false,
    isAdding: false,
  },
  {
    moduleCode: 'Test2',
    title: 'ModuleTitle',
    isAdded: true,
    isAdding: false,
  },
];

const commonProps = {
  getFilteredModules: vi.fn((inputValue) => {
    if (!inputValue) return [];
    return modules.filter((m) => m.moduleCode.includes(inputValue));
  }),
  onChange: vi.fn(),
  moduleCount: 3,
  placeholder: 'test placeholder',
  onRemoveModule: vi.fn(),
};

describe(ModulesSelectComponent, () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  it('should show results on input value change', async () => {
    render(<ModulesSelectComponent {...commonProps} matchBreakpoint />);
    const input = screen.getByPlaceholderText(commonProps.placeholder);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.type(input, 'T');
    const items = await screen.findAllByRole('option');
    expect(items).toHaveLength(2);

    await user.clear(input);
    await user.type(input, 'T#');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should indicate module is added', async () => {
    render(<ModulesSelectComponent {...commonProps} matchBreakpoint />);
    const input = screen.getByPlaceholderText(commonProps.placeholder);

    await user.type(input, 'T');
    const items = await screen.findAllByRole('option');
    const addedItem = items.find((item) => item.textContent?.includes('Test2'));
    expect(addedItem).toHaveTextContent('Added');
    expect(addedItem).toHaveAttribute('aria-disabled', 'true');
    expect(addedItem).toHaveClass('optionDisabled');
  });

  it('should call onChange when module is selected', async () => {
    render(<ModulesSelectComponent {...commonProps} matchBreakpoint />);
    const input = screen.getByPlaceholderText(commonProps.placeholder);

    await user.type(input, 'T');
    const items = await screen.findAllByRole('option');
    expect(items).toHaveLength(2);

    await user.click(items[0]);
    expect(commonProps.onChange).toHaveBeenCalledWith('Test1');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  describe('when it does not matchBreakpoint', () => {
    it('should render a button and open modal on click', async () => {
      render(<ModulesSelectComponent {...commonProps} matchBreakpoint={false} />);
      const triggerButton = screen.getByRole('button', { name: commonProps.placeholder });

      await user.click(triggerButton);
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(commonProps.placeholder)).toBeInTheDocument();
    });

    it('should show tip when modal opens with no input', async () => {
      render(<ModulesSelectComponent {...commonProps} matchBreakpoint={false} />);
      await user.click(screen.getByRole('button', { name: commonProps.placeholder }));

      const searchTip = screen.getByRole('status');
      expect(searchTip).toHaveTextContent(/Try "GEA1000"/);
      expect(searchTip).toHaveTextContent(commonProps.moduleCount.toString());
    });

    it('should show tips when there are no results', async () => {
      render(<ModulesSelectComponent {...commonProps} matchBreakpoint={false} />);
      await user.click(screen.getByRole('button', { name: commonProps.placeholder }));

      const input = screen.getByPlaceholderText(commonProps.placeholder);
      await user.type(input, 'XYZ');

      const statuses = screen.getAllByRole('status');
      expect(statuses).toHaveLength(2);

      const searchTip = document.getElementById('search-tip');
      expect(searchTip).toHaveTextContent(/Try "GEA1000"/);

      const noResultsTip = document.getElementById('no-results-tip');
      expect(noResultsTip).toHaveTextContent(/No courses found for "XYZ"/);
    });
  });

  describe('when it does matchBreakpoint', () => {
    it('should toggle menu depending on focus/outer click', async () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <ModulesSelectComponent {...commonProps} matchBreakpoint />
        </div>,
      );
      const input = screen.getByPlaceholderText(commonProps.placeholder);

      // 1. Open and show results
      await user.type(input, 'T');
      expect(await screen.findByRole('listbox')).toBeInTheDocument();

      // 2. Click outside (triggers Downshift's onOuterClick via onBlur logic)
      await user.click(screen.getByTestId('outside'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should not open menu when disabled', async () => {
      render(<ModulesSelectComponent {...commonProps} matchBreakpoint disabled />);
      const input = screen.getByPlaceholderText(commonProps.placeholder);

      await user.click(input);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(input).toBeDisabled();
    });
  });
});
