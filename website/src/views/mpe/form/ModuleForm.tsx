import { useMemo, useRef, useState } from 'react';
import { Draggable, DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import classnames from 'classnames';

import type { MpeSubmission, MpePreference, MpeModule } from 'types/mpe';
import type { ModuleCode } from 'types/modules';

import { MAX_MODULES, MPE_SEMESTER } from '../constants';
import UpdateSubmissionQueue from '../UpdateSubmissionQueue';
import ModuleCard from './ModuleCard';
import ModulesSelectContainer from './ModulesSelectContainer';

import styles from './ModuleForm.scss';

function reorder<T>(items: T[], startIndex: number, endIndex: number) {
  if (startIndex === endIndex) return items;

  const result = [...items];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

type Props = {
  submission: MpeSubmission;
  mpeModuleList: MpeModule[];
  updateSubmission: (submission: MpeSubmission) => Promise<void>;
};

const ModuleForm: React.FC<Props> = ({
  submission,
  mpeModuleList,
  updateSubmission: rawUpdateSubmission,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error>();
  const updateSubmissionQueue = useRef(new UpdateSubmissionQueue(rawUpdateSubmission)).current;

  const moduleSelectList = useMemo(() => {
    const selectedModules = new Set(
      submission.preferences.map((preference) => preference.moduleCode),
    );
    const semesterProperty = MPE_SEMESTER === 1 ? 'inS1MPE' : 'inS2MPE';
    return mpeModuleList
      .filter((module) => module[semesterProperty])
      .map((module) => ({
        ...module,
        isAdding: false,
        isAdded: selectedModules.has(module.moduleCode),
      }));
  }, [submission, mpeModuleList]);

  const updateSubmission = (newSubmission: MpeSubmission) => {
    setIsUpdating(true);
    setUpdateError(undefined);

    updateSubmissionQueue
      .update(newSubmission)
      .catch((e) => {
        setUpdateError(e);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    updateSubmission({
      ...submission,
      preferences: reorder(submission.preferences, result.source.index, result.destination.index),
    });
  };

  const addModule = (moduleCode: ModuleCode) => {
    if (
      submission.preferences.length >= MAX_MODULES ||
      submission.preferences.some((p) => p.moduleCode === moduleCode)
    ) {
      return;
    }

    const selectedModule = mpeModuleList.find((module) => module.moduleCode === moduleCode);
    if (selectedModule == null) {
      return;
    }

    updateSubmission({
      ...submission,
      preferences: [
        ...submission.preferences,
        {
          moduleTitle: selectedModule.title,
          moduleCode,
          moduleType: '01',
          moduleCredits: parseFloat(selectedModule.moduleCredit),
        },
      ],
    });
  };

  const removeModule = (moduleCode: ModuleCode) => {
    updateSubmission({
      ...submission,
      preferences: submission.preferences.filter((p) => p.moduleCode !== moduleCode),
    });
  };

  const updateModuleType = (moduleCode: ModuleCode, moduleType: MpePreference['moduleType']) => {
    if (!submission.preferences.some((p) => p.moduleCode === moduleCode)) return;
    updateSubmission({
      ...submission,
      preferences: submission.preferences.map((p) =>
        p.moduleCode === moduleCode ? { ...p, moduleType } : p,
      ),
    });
  };

  // TODO: Remove leading/padded zero for the intended MCs to take field.
  const updateIntendedMCs = (moduleCredits: number) => {
    if (Number.isNaN(moduleCredits)) {
      return;
    }

    updateSubmission({
      ...submission,
      intendedMCs: moduleCredits,
    });
  };

  let status;
  if (updateError) {
    status = (
      <p className={classnames(styles.status, 'text-danger')}>
        Changes could not be saved.{' '}
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            updateSubmission(submission);
          }}
        >
          Retry Saving Changes
        </button>
      </p>
    );
  } else if (isUpdating) {
    status = <p className={styles.status}>Saving...</p>;
  } else {
    status = <p className={classnames('text-primary', styles.status)}>All changes are saved</p>;
  }

  return (
    <div className={styles.formContainer}>
      <label className={classnames('row', styles.mcTextField)}>
        <div className="col-sm-8">
          Please indicate how many MCs you are planning to pursue this semester:
        </div>
        <div className="col-sm-4">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            className="form-control"
            value={submission.intendedMCs}
            onChange={(e) => updateIntendedMCs(parseInt(e.target.value, 10))}
          />
        </div>
      </label>
      <div className={styles.headerTitle}>
        <div className={styles.rank}>Rank</div>
        <div className={styles.module}>Module</div>
        <div className={styles.moduleCount}>
          {submission.preferences.length} / {MAX_MODULES} Modules Selected
        </div>
      </div>
      <div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {submission.preferences.map((preference, index) => (
                  <div key={index} className={styles.droppableContainer}>
                    <Draggable
                      key={preference.moduleCode}
                      draggableId={preference.moduleCode}
                      index={index}
                    >
                      {(innerProvided) => (
                        <div
                          ref={innerProvided.innerRef}
                          className={styles.cardContainer}
                          {...innerProvided.draggableProps}
                          {...innerProvided.dragHandleProps}
                        >
                          <ModuleCard
                            rank={index}
                            preference={preference}
                            removeModule={removeModule}
                            updateModuleType={updateModuleType}
                            className={styles.card}
                          />
                        </div>
                      )}
                    </Draggable>
                  </div>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      {submission.preferences.length < MAX_MODULES ? (
        <div className={styles.selectContainer}>
          <ModulesSelectContainer
            moduleList={moduleSelectList}
            removeModule={removeModule}
            addModule={addModule}
          />
        </div>
      ) : (
        <p className={styles.maxModulesError}>
          Maximum of {MAX_MODULES} modules selected. Remove a module from the list to add more.
        </p>
      )}
      {status}
    </div>
  );
};

export default ModuleForm;
