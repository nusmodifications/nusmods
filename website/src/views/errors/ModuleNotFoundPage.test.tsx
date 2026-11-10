import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { moduleArchive } from 'views/routes/paths';
import { ModuleNotFoundPageComponent } from './ModuleNotFoundPage';

type Props = ComponentProps<typeof ModuleNotFoundPageComponent>;

function renderPage(props: Partial<Props>) {
  return render(
    <MemoryRouter>
      <ModuleNotFoundPageComponent
        moduleCode="CS1010S"
        availableArchive={[]}
        fetchModuleArchive={vi.fn()}
        isLoading={false}
        tryArchive
        {...props}
      />
    </MemoryRouter>,
  );
}

test('should fetch archive pages if moduleCode looks like a module code', () => {
  const fetchModuleArchive = vi.fn();
  renderPage({ fetchModuleArchive });

  expect(fetchModuleArchive).toHaveBeenCalledWith('CS1010S');
});

test('should not fetch archive pages if tryArchive is false', () => {
  const fetchModuleArchive = vi.fn();
  renderPage({ fetchModuleArchive, tryArchive: false });

  expect(fetchModuleArchive).not.toHaveBeenCalled();
});

test("should not fetch archive pages if moduleCode doesn't look like module code", () => {
  const fetchModuleArchive = vi.fn();
  renderPage({ fetchModuleArchive, moduleCode: 'blah-blah' });

  expect(fetchModuleArchive).not.toHaveBeenCalled();
});

test('should show spinner while archive pages are loading', () => {
  renderPage({ isLoading: true });

  expect(screen.getByText('Loading...')).toBeInTheDocument();
  expect(screen.queryByRole('heading')).not.toBeInTheDocument();
});

test('should suggest archive pages if they are available', () => {
  renderPage({ availableArchive: ['2015/2016', '2017/2018'] });

  const links = screen.getAllByRole('link').map((link) => link.getAttribute('href'));

  expect(links).toEqual(
    expect.arrayContaining([
      moduleArchive('CS1010S', '2015/2016'),
      moduleArchive('CS1010S', '2017/2018'),
    ]),
  );
});
