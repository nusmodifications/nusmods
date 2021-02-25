import { useRef, useState } from 'react';
import { Draggable, DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { MpePreference, MpeModule } from 'types/mpe';
import { ModuleCode } from 'types/modules';
import classnames from 'classnames';
import { fetchModuleDetails } from '../../../apis/mpe';
import { MAX_MODULES } from '../constants';
import UpdatePreferenceQueue from '../UpdatePreferenceQueue';
import styles from './ModuleForm.scss';
import ModuleCard from './ModuleCard';
import ModulesSelectContainer from './ModulesSelectContainer';

function reorder<T>(items: T[], startIndex: number, endIndex: number) {
  const result = [...items];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

type Props = {
  initialPreferences: MpePreference[];
  mpeModuleList: MpeModule[];
  updatePreferences: (preferences: MpePreference[]) => Promise<void>;
};

const ModuleForm: React.FC<Props> = ({
  initialPreferences,
  mpeModuleList,
  updatePreferences: rawUpdatePreferences,
}) => {
  const [preferences, setPreferences] = useState<MpePreference[]>(initialPreferences);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error>();
  const updatePreferenceQueue = useRef(new UpdatePreferenceQueue(rawUpdatePreferences)).current;

  const updatePreferences = (newPreferences: MpePreference[]) => {
    setIsUpdating(true);
    setUpdateError(undefined);

    setPreferences(newPreferences);
    updatePreferenceQueue
      .update(newPreferences)
      .catch((e) => {
        setUpdateError(e);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    updatePreferences(reorder(preferences, result.source.index, result.destination.index));
  };

  const addModule = (moduleCode: ModuleCode) => {
    if (preferences.length >= MAX_MODULES || preferences.some((p) => p.moduleCode === moduleCode)) {
      return;
    }

    setIsUpdating(true);
    fetchModuleDetails(moduleCode).then((moduleInfo) => {
      updatePreferences([
        ...preferences,
        {
          moduleTitle: moduleInfo.title,
          moduleCode,
          moduleType: '01',
          moduleCredits: parseFloat(moduleInfo.moduleCredit),
        },
      ]);
    });
  };

  const removeModule = (moduleCode: ModuleCode) => {
    updatePreferences(preferences.filter((p) => p.moduleCode !== moduleCode));
  };

  const updateModuleType = (moduleCode: ModuleCode, moduleType: MpePreference['moduleType']) => {
    if (!preferences.some((p) => p.moduleCode === moduleCode)) return;
    updatePreferences(
      preferences.map((p) => (p.moduleCode === moduleCode ? { ...p, moduleType } : p)),
    );
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
            updatePreferences(preferences);
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
      <div className={styles.mcTextField}>
        <p className={styles.textLabel}>
          Please indicate how many MCs you are planning to pursue in this semester (by default, 20
          MCs) :
        </p>
        <div className="col-xs-1">
          <input type="text" className="form-control" placeholder="20" />
        </div>
      </div>
      <div className={styles.headerTitle}>
        <div className={styles.rank}>Rank</div>
        <div className={styles.module}>Module</div>
        <div className={styles.moduleCount}>{7 - preferences.length} Modules Left</div>
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
                      isDragDisabled={isUpdating}
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
            preferences={preferences}
            mpeModuleList={mpeModuleList}
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
