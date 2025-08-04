import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { moduleArchive } from 'views/routes/paths';
import { ModuleNotFoundPageComponent } from './ModuleNotFoundPage';

test('should fetch archive pages if moduleCode looks like a module code', () => {
  const fetchModuleArchive = jest.fn();
  shallow(
    <ModuleNotFoundPageComponent
      moduleCode="CS1010S"
      availableArchive={[]}
      fetchModuleArchive={fetchModuleArchive}
      isLoading={false}
      tryArchive
    />,
  );

  expect(fetchModuleArchive).toHaveBeenCalled();
});

test('should not fetch archive pages if tryArchive is false', () => {
  const fetchModuleArchive = jest.fn();
  shallow(
    <ModuleNotFoundPageComponent
      moduleCode="CS1010S"
      availableArchive={[]}
      fetchModuleArchive={fetchModuleArchive}
      isLoading={false}
      tryArchive={false}
    />,
  );

  expect(fetchModuleArchive).not.toHaveBeenCalled();
});

test("should not fetch archive pages if moduleCode doesn't look like module code", () => {
  const fetchModuleArchive = jest.fn();
  shallow(
    <ModuleNotFoundPageComponent
      moduleCode="blah-blah"
      availableArchive={[]}
      fetchModuleArchive={fetchModuleArchive}
      isLoading={false}
      tryArchive
    />,
  );

  expect(fetchModuleArchive).not.toHaveBeenCalled();
});

test('should show spinner while archive pages are loading', () => {
  const wrapper = shallow(
    <ModuleNotFoundPageComponent
      moduleCode="CS1010S"
      availableArchive={[]}
      fetchModuleArchive={jest.fn()}
      tryArchive
      isLoading
    />,
  );

  expect(wrapper.type()).toEqual(LoadingSpinner);
});

test('should suggest archive pages if they are available', () => {
  const wrapper = shallow(
    <ModuleNotFoundPageComponent
      moduleCode="CS1010S"
      availableArchive={['2015/2016', '2017/2018']}
      fetchModuleArchive={jest.fn()}
      isLoading={false}
      tryArchive
    />,
  );

  const links = wrapper.find(Link).map((link) => link.prop('to'));

  expect(links).toEqual(
    expect.arrayContaining([
      moduleArchive('CS1010S', '2015/2016'),
      moduleArchive('CS1010S', '2017/2018'),
    ]),
  );
});
