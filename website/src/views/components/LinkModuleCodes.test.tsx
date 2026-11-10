import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { entries } from 'lodash-es';

import { ModuleCodeMap } from 'types/reducers';
import { getModuleCondensed } from 'selectors/moduleBank';

import { ModuleCondensed } from 'types/modules';
import { LinkModuleCodesComponent } from './LinkModuleCodes';

describe(LinkModuleCodesComponent, () => {
  const testModules: { [moduleCode: string]: ModuleCondensed } = {
    CS3216: {
      moduleCode: 'CS3216',
      title: 'Software Product Engineering for Digital Markets',
      semesters: [1],
    },
    CS1010FC: {
      moduleCode: 'CS1010FC',
      title: 'Programming Methodology',
      semesters: [3, 2],
    },
    ACC1002: {
      moduleCode: 'ACC1002',
      title: 'Financial Accounting',
      semesters: [2, 1],
    },
    BMA5000A: {
      moduleCode: 'BMA5000A',
      title: 'Managerial Economics',
      semesters: [2, 1],
    },
    PS1101E: {
      moduleCode: 'PS1101E',
      title: 'Introduction to Politics',
      semesters: [2, 1],
    },
    CS1010S: {
      moduleCode: 'CS1010S',
      title: 'Programming Methodology',
      semesters: [2, 1],
    },
  };

  function create(content: string, moduleCodes: ModuleCodeMap = {}) {
    const getModule = getModuleCondensed({
      moduleBank: {
        moduleCodes,
      },
    } as any);

    return render(
      <MemoryRouter>
        <LinkModuleCodesComponent getModuleCondensed={getModule}>
          {content}
        </LinkModuleCodesComponent>
      </MemoryRouter>,
    ).container;
  }

  test('should convert module codes to links', () => {
    create('CS3216, CS1010FC, ACC1002, BMA 5000A', testModules);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);

    const moduleEntries = entries(testModules);
    links.forEach((link, index) => {
      const [code] = moduleEntries[index];
      expect(link.textContent?.replace(' ', '')).toEqual(code);
      expect(link.getAttribute('href')).toContain(code);
    });
  });

  test('should keep text unchanged', () => {
    const noModulesText = 'This text does not contain module codes';
    expect(create(noModulesText, testModules).textContent).toEqual(noModulesText);

    const mixedModulesText = 'ACC1002This text has CS-1010S random module coPS1101Edes in it';
    expect(create(mixedModulesText, testModules).textContent).toEqual(mixedModulesText);
  });

  test('should check words only', () => {
    create('CS1010FCThis teCS1010FCxt contains module codes in wordsACC1010FC', testModules);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  test('should ignore modules that are not available', () => {
    create('CS1010FC, CS1020, ACC1002', {
      ACC1002: {
        moduleCode: 'ACC1002',
        title: 'Financial Accounting',
        semesters: [2, 1],
      },
    });

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent('ACC1002');
  });
});
