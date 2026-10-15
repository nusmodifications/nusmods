import type { Mocked } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/* @var {Module} */
import CS1010S from '__mocks__/modules/CS1010S.json';

import { Module } from 'types/modules';
import { DisconnectedModuleTombstone, Props } from './ModuleTombstone';

const jest = vi;
describe(DisconnectedModuleTombstone, () => {
  let mockProps: Mocked<Props>;

  beforeEach(() => {
    mockProps = {
      module: CS1010S as unknown as Module,
      resetTombstone: jest.fn(),
      undo: jest.fn(),
    } as any;
  });

  it('should display the module code', () => {
    render(<DisconnectedModuleTombstone {...mockProps} />);
    expect(screen.getByText('CS1010S removed')).toBeInTheDocument();
  });

  it('should call resetTombstone when Dismiss is clicked', async () => {
    render(<DisconnectedModuleTombstone {...mockProps} />);
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(mockProps.resetTombstone).toHaveBeenCalledTimes(1);
  });
});
