import React, { FormEventHandler } from 'react';
import classnames from 'classnames';
import produce from 'immer';
import { groupBy } from 'lodash';
import axios from 'axios';
import { AlertTriangle } from 'react-feather';
import * as Sentry from '@sentry/browser';

import {
  DepartmentMatch,
  Division,
  FacultyEmail,
  FacultyMatch,
  ModuleCodeMatch,
  ModuleCodePrefixMatch,
} from 'types/facultyEmail';
import { Module } from 'types/modules';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';
import ExternalLink from 'views/components/ExternalLink';
import facultyEmails from 'data/facultyEmail';
import appConfig from 'config';

import styles from './ReportError.scss';
import LoadingSpinner from '../components/LoadingSpinner';
import { isGraduateModule } from '../../utils/modules';
import { CONTACT_INFO } from '../../storage/keys';

interface Props {
  module: Module;
}

interface ReportErrorForm {
  name: string;
  contactId: FacultyEmail['id'] | undefined;
  replyTo: string;
  matricNumber: string;
  message: string;
}

type FormState =
  | { type: 'unsubmitted' }
  | { type: 'error' }
  | { type: 'submitting' }
  | { type: 'submitted' };

interface PersistedContactInfo {
  name: string;
  replyTo: string;
  matricNumber: string;
}

const groupedByMatcherType = groupBy(facultyEmails, (config) => config.match.type) as Record<
  FacultyEmail['match']['type'],
  FacultyEmail[]
>;

function retrieveContactInfo(): PersistedContactInfo {
  const persisted = JSON.parse(localStorage.getItem(CONTACT_INFO) ?? '{}');
  return {
    name: '',
    replyTo: '',
    matricNumber: '',
    ...persisted,
  };
}

function persistContactInfo(info: PersistedContactInfo) {
  localStorage.setItem(CONTACT_INFO, JSON.stringify(info));
}

function matchModule(module: Module) {
  // 1. Check which email to use for this module by specificity.
  //    The most specific is module code, so we check that first
  let match = groupedByMatcherType.moduleCode.find(
    (contact) => (contact.match as ModuleCodeMatch).moduleCode === module.moduleCode,
  );
  if (match) return match;

  // 2. Check module prefix next
  match = groupedByMatcherType.modulePrefix.find((contact) =>
    module.moduleCode.startsWith((contact.match as ModuleCodePrefixMatch).prefix),
  );
  if (match) return match;

  // 3. Department and faculty matchers are split by graduate and undergrad classes. In NUS
  //    the 5-6000 level modules are graduate level modules
  const division: Division = isGraduateModule(module) ? 'grad' : 'undergrad';

  // 4. Check department
  match = groupedByMatcherType.department.find((contact) => {
    const contactMatch = contact.match as DepartmentMatch;
    return module.department === contactMatch.department && division === contactMatch.level;
  });
  if (match) return match;

  // 5. Finally check faculty, which is the least specific
  return groupedByMatcherType.faculty.find((contact) => {
    const contactMatch = contact.match as FacultyMatch;
    return module.faculty === contactMatch.faculty && division === contactMatch.level;
  });
}

/**
 * Module error reporting component. Posts to a serverless script that then emails the relevant
 * faculty / department with the issue.
 */
const ReportError = React.memo<Props>(({ module }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<FormState>({ type: 'unsubmitted' });

  const [formData, setFormData] = React.useState<ReportErrorForm>(() => ({
    ...retrieveContactInfo(),
    message: '',
    contactId: matchModule(module)?.id,
  }));

  const updateFormValue = React.useCallback(
    (key: keyof ReportErrorForm): FormEventHandler => (evt) => {
      const newFormData = produce(formData, (draft) => {
        draft[key] = (evt.target as HTMLInputElement).value;
      });

      setFormData(newFormData);
      persistContactInfo({
        name: newFormData.name,
        replyTo: newFormData.replyTo,
        matricNumber: newFormData.matricNumber,
      });
    },
    [formData],
  );

  const onSubmit = React.useCallback(() => {
    setFormState({ type: 'submitting' });

    const { name, replyTo, matricNumber, message, contactId } = formData;
    axios
      .post(appConfig.moduleErrorApi, {
        name,
        contactId,
        moduleCode: module.moduleCode,
        matricNumber,
        replyTo,
        message,
      })
      .then(() => setFormState({ type: 'submitted' }))
      .catch((error) => {
        Sentry.setExtras(formData);
        Sentry.captureException(error);
        setFormState({ type: 'error' });
      });
  }, [formData, module]);

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
        <h2 className={styles.heading}>Reporting an issue with {module.moduleCode}</h2>
        <p>
          NUSMods updates its information from the Registrar's Office every night. Please wait up to
          48 hours for information to be updated before reporting any issues.
        </p>
        <p>
          This form will send an email about this module to the faculty. If you think the issue is a
          bug in NUSMods, please email <a href="mailto:bugs@nusmods.com">bugs@nusmods.com</a>{' '}
          instead.
        </p>

        {formState.type === 'error' && (
          <div className="alert alert-danger" role="alert">
            There was an error submitting the form. Please try again later or send the email
            yourself.
          </div>
        )}

        {formState.type === 'submitted' ? (
          <div className="alert alert-success">
            Thank you for reporting the error. A copy of the email that was sent to the faculty has
            also been cc'd to you.
          </div>
        ) : (
          <FormContent
            formData={formData}
            onSubmit={onSubmit}
            updateFormValue={updateFormValue}
            isSubmitting={formState.type === 'submitting'}
          />
        )}
      </Modal>
    </>
  );
});

ReportError.displayName = 'ReportError';

interface FormContentProps {
  formData: ReportErrorForm;
  onSubmit: () => void;
  updateFormValue: (key: keyof ReportErrorForm) => FormEventHandler;
  isSubmitting: boolean;
}

const FormContent: React.FC<FormContentProps> = ({
  formData,
  onSubmit,
  updateFormValue,
  isSubmitting,
}) => {
  const selectedContact = facultyEmails.find((config) => config.id === formData.contactId);

  return (
    <form
      className={classnames('form-row', { disabled: isSubmitting })}
      onSubmit={(evt) => {
        evt.preventDefault();
        onSubmit();
      }}
    >
      <div className="form-group col-sm-12">
        <label htmlFor="report-error-name">Your Full Name</label>
        <input
          className="form-control"
          id="report-error-name"
          value={formData.name}
          onChange={updateFormValue('name')}
          required
        />
      </div>

      <div className="form-group col-sm-12">
        <label htmlFor="report-error-faculty">Department / Faculty</label>
        <select
          className="form-control"
          id="report-error-faculty"
          value={formData.contactId}
          onChange={updateFormValue('contactId')}
          required
        >
          <option value="">Select a department / faculty</option>
          {facultyEmails.map((config) => (
            <option value={config.id} key={config.id}>
              {config.label}
            </option>
          ))}
        </select>
        {selectedContact && (
          <p className="form-text text-muted">
            This will email <a href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a>
          </p>
        )}
        <p className="form-text text-muted">
          If the department or faculty for this module cannot be found on this list, please refer to
          ModReg's contact list for{' '}
          <ExternalLink href="http://www.nus.edu.sg/ModReg/docs/UGFac_Contacts.pdf">
            undergraduate
          </ExternalLink>{' '}
          or{' '}
          <ExternalLink href="http://www.nus.edu.sg/ModReg/docs/GDFac_Contacts.pdf">
            graduate
          </ExternalLink>{' '}
          students.
        </p>
      </div>

      <div className="form-group col-sm-12">
        <label htmlFor="report-error-email">Your School Email</label>
        <input
          type="email"
          id="report-error-email"
          className="form-control"
          pattern=".+@.+nus.+"
          value={formData.replyTo}
          onChange={updateFormValue('replyTo')}
          required
        />
      </div>

      <div className="form-group col-sm-12">
        <label htmlFor="report-error-matric-number">Your Matriculation Number</label>
        <input
          id="report-error-matric-number"
          className="form-control"
          value={formData.matricNumber}
          onChange={updateFormValue('matricNumber')}
          required
        />
      </div>

      <div className="form-group col-sm-12">
        <label htmlFor="report-error-message">Describe in detail the issues with the module</label>
        <textarea
          id="report-error-message"
          className="form-control"
          value={formData.message}
          onChange={updateFormValue('message')}
          rows={8}
          required
        />
      </div>

      <footer className={classnames(styles.footer, 'col-sm-12')}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
          {isSubmitting && <LoadingSpinner small white />} Submit
        </button>
      </footer>
    </form>
  );
};

const ReportErrorWrapper: React.FC<Props> = ({ module }) => (
  // Force form state to re-initialize when the module changes
  <ReportError module={module} key={module.moduleCode} />
);

export default ReportErrorWrapper;
