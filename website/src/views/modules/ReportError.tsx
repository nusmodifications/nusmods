import React from 'react';
import classnames from 'classnames';

import { ModuleCode } from 'types/modules';
import { AlertTriangle } from 'react-feather';
import Modal from 'views/components/Modal';
import ExternalLink from 'views/components/ExternalLink';
import CloseButton from 'views/components/CloseButton';

import styles from './ReportError.scss';

interface Props {
  moduleCode: ModuleCode;
}

const ReportError: React.FC<Props> = ({ moduleCode }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        className={classnames('btn btn-link', styles.button)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <AlertTriangle className={styles.icon} />
        Report errors
      </button>

      <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} animate>
        <CloseButton onClick={() => setIsOpen(false)} />
        <h2 className={styles.heading}>Reporting an issue with {moduleCode}</h2>
        <p>
          NUSMods is run by a very small number of volunteers. Response can take up to a week,
          especially during module registration.
        </p>

        <p>
          For most issues related to modules and timetables, it will be faster to email your faculty
          and CC <a href="mailto:modules@nusmods.com">modules@nusmods.com</a>. Examples of questions
          that will be better answered by the faculties are:
        </p>

        <ul>
          <li>Can't find module or questions about whether a module is offered this semester</li>
          <li>Missing classes, tutorials or lab sessions</li>
          <li>Information do not match those on the faculty website</li>
          <li>Questions about the syllabus or teaching method of a module</li>
        </ul>

        <p>
          Here are the faculty contact details for{' '}
          <ExternalLink href="http://www.nus.edu.sg/registrar/info/modreg/UGFac_Contacts.pdf">
            undergraduate{' '}
          </ExternalLink>
          and{' '}
          <ExternalLink href="http://www.nus.edu.sg/registrar/info/modreg/GDFac_ModRelatedLinks.pdf">
            graduate{' '}
          </ExternalLink>
          students.
        </p>

        <p>
          NUSMods updates its information from the Registrar's Office every night. Please wait up to
          48 hours for information to be updated before reporting any issues.
        </p>

        <hr />

        <a className="btn btn-lg btn-primary btn-block" href="mailto:modules@nusmods.com">
          Email Us
        </a>
      </Modal>
    </>
  );
};

export default ReportError;
