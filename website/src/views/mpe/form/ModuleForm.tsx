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
  initialSubmission: MpeSubmission;
  mpeModuleList: MpeModule[];
  updateSubmission: (submission: MpeSubmission) => Promise<void>;
};

const ModuleForm: React.FC<Props> = ({
  initialSubmission,
  mpeModuleList,
  updateSubmission: rawUpdateSubmission,
}) => {
  const [intendedMCs, setIntendedMCs] = useState<MpeSubmission['intendedMCs']>(
    initialSubmission.intendedMCs,
  );
  const [intendedMCsInput, setIntendedMCsInput] = useState<string>(
    initialSubmission.intendedMCs.toString(),
  );
  const [preferences, setPreferences] = useState<MpePreference[]>(initialSubmission.preferences);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error>();
  const updateSubmissionQueue = useRef(new UpdateSubmissionQueue(rawUpdateSubmission)).current;

  const moduleSelectList = useMemo(() => {
    const selectedModules = new Set(preferences.map((preference) => preference.moduleCode));
    const semesterProperty = MPE_SEMESTER === 1 ? 'inS1MPE' : 'inS2MPE';
    return mpeModuleList
      .filter((module) => module[semesterProperty])
      .map((module) => ({
        ...module,
        isAdding: false,
        isAdded: selectedModules.has(module.moduleCode),
      }));
  }, [preferences, mpeModuleList]);

  const updateSubmission = (newSubmission: MpeSubmission) => {
    setIsUpdating(true);
    setUpdateError(undefined);

    setIntendedMCs(newSubmission.intendedMCs);
    setPreferences(newSubmission.preferences);
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
      intendedMCs,
      preferences: reorder(preferences, result.source.index, result.destination.index),
    });
  };

  const addModule = (moduleCode: ModuleCode) => {
    if (preferences.length >= MAX_MODULES || preferences.some((p) => p.moduleCode === moduleCode)) {
      return;
    }

    const selectedModule = mpeModuleList.find((module) => module.moduleCode === moduleCode);
    if (selectedModule == null) {
      return;
    }

    updateSubmission({
      intendedMCs,
      preferences: [
        ...preferences,
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
      intendedMCs,
      preferences: preferences.filter((p) => p.moduleCode !== moduleCode),
    });
  };

  const updateModuleType = (moduleCode: ModuleCode, moduleType: MpePreference['moduleType']) => {
    if (!preferences.some((p) => p.moduleCode === moduleCode)) return;
    updateSubmission({
      intendedMCs,
      preferences: preferences.map((p) => (p.moduleCode === moduleCode ? { ...p, moduleType } : p)),
    });
  };

  const updateIntendedMCs = (moduleCredits: number) => {
    if (Number.isNaN(moduleCredits)) return;
    updateSubmission({
      intendedMCs: moduleCredits,
      preferences,
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
            updateSubmission({
              intendedMCs,
              preferences,
            });
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
          Intended number of MCs (does not affect how many modules you can select):
        </div>
        <div className="col-sm-4">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            className="form-control"
            value={intendedMCsInput}
            onChange={(e) => {
              setIntendedMCsInput(e.target.value);
              const moduleCredits = parseInt(e.target.value, 10);
              if (Number.isNaN(moduleCredits)) return;
              updateIntendedMCs(moduleCredits);
            }}
            onBlur={() => setIntendedMCsInput(intendedMCs.toString())}
          />
        </div>
      </label>
      <div className={styles.headerTitle}>
        <div className={styles.rank}>Rank</div>
        <div className={styles.module}>Module</div>
        <div className={styles.moduleCount}>
          {preferences.length} / {MAX_MODULES} Modules Selected
        </div>
      </div>
      <div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {preferences.map((preference, index) => (
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
      {preferences.length < MAX_MODULES ? (
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
