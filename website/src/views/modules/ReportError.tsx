import React from 'react';

import { ModuleCode } from 'types/modules';
import { AlertTriangle } from 'views/components/icons';
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
      <button type="button" className="btn btn-link" onClick={() => setIsOpen(!isOpen)}>
        <AlertTriangle /> Report errors
      </button>

      <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} animate>
        <CloseButton onClick={() => setIsOpen(false)} />
        <h2 className={styles.heading}>Reporting an issue with {moduleCode}</h2>
        <p>
          NUSMods is run by a very small number of volunteers. Response can take up to a week,
          especially during module registration. Since NUSMods only displays data given to us by the
          school, it is only useful to email us if you suspect there's a bug.
        </p>

        <p>
          Most of the time it is instead faster to email your faculty (
          <ExternalLink href="http://www.nus.edu.sg/registrar/info/modreg/UGFac_Contacts.pdf">
            undergraduate
          </ExternalLink>
          ,{' '}
          <ExternalLink href="http://www.nus.edu.sg/registrar/info/modreg/GDFac_ModRelatedLinks.pdf">
            graduate
          </ExternalLink>
          ) and cc us. Examples of questions that may be better answered by the school are:
        </p>

        <ul>
          <li>Can't find module or questions about whether a module is offered this semester</li>
          <li>Missing classes, tutorials or lab sessions</li>
          <li>Information do not match those on the faculty website</li>
          <li>Questions about the syllabus or teaching method of a module</li>
        </ul>

        <p>
          For faculty, NUSMods updates its information from the Registrar's Office every night.
          Please wait up to 48 hours for information to be updated before emailing us.
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
