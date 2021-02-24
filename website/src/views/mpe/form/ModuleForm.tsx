import { useState } from 'react';
import sumBy from 'lodash/sumBy';
import { Draggable, DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { MpePreference, MpeModule, MODULE_TYPES } from 'types/mpe';
import { ModuleCode } from 'types/modules';
import Modal from 'views/components/Modal';
import classnames from 'classnames';
import { fetchModuleDetails } from '../../../apis/mpe';
import styles from './ModuleForm.scss';
import ModuleCard from './ModuleCard';
import ModulesSelectContainer from './ModulesSelectContainer';

const initProcessLastRequest = () => {
  let isProcessing = false;
  let nextOperation: (() => Promise<unknown>) | null = null;

  const processLastRequest = (operation: () => Promise<unknown>, onEnd: () => void) => {
    if (isProcessing) {
      nextOperation = operation;
    } else {
      isProcessing = true;
      operation()
        .then(() => {
          isProcessing = false;
          if (nextOperation !== null) {
            const toExecute = nextOperation;
            nextOperation = null;
            processLastRequest(toExecute, onEnd);
          } else {
            onEnd();
          }
        })
        .catch(() => {
          isProcessing = false;
          if (nextOperation === null) {
            processLastRequest(operation, onEnd);
          } else {
            const toExecute = nextOperation;
            nextOperation = null;
            processLastRequest(toExecute, onEnd);
          }
        });
    }
  };
  return processLastRequest;
};

const processLastRequest = initProcessLastRequest();

function reorder<T>(items: T[], startIndex: number, endIndex: number) {
  const result = [...items];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

type Props = {
  initialPreferences: MpePreference[];
  mpeModuleList: MpeModule[];
  updatePreferences: (preferences: MpePreference[]) => Promise<string>;
};

const ModuleForm: React.FC<Props> = ({ initialPreferences, mpeModuleList, updatePreferences }) => {
  const [preferences, setPreferences] = useState<MpePreference[]>(initialPreferences);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hitMaxModsLimit, setHitMaxModsLimit] = useState(false);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    setIsUpdating(true);
    const updatedPreferences = reorder(preferences, result.source.index, result.destination.index);
    setPreferences(updatedPreferences);
    processLastRequest(
      () => updatePreferences(updatedPreferences),
      () => setIsUpdating(false),
    );
  };

  const addModule = (moduleCode: ModuleCode) => {
    if (preferences.some((p) => p.moduleCode === moduleCode)) return;
    if (preferences.length === 7) {
      setHitMaxModsLimit(true);
      return;
    }
    setIsUpdating(true);
    fetchModuleDetails(moduleCode).then((moduleInfo) => {
      const updatedPreferences: MpePreference[] = [
        ...preferences,
        {
          moduleTitle: moduleInfo.title,
          moduleCode,
          moduleType: (Object.keys(MODULE_TYPES) as Array<MpePreference['moduleType']>)[0],
          moduleCredits: parseInt(moduleInfo.moduleCredit, 10),
        },
      ];
      setPreferences(updatedPreferences);
      processLastRequest(
        () => updatePreferences(updatedPreferences),
        () => setIsUpdating(false),
      );
    });
  };

  const removeModule = (moduleCode: ModuleCode) => {
    setIsUpdating(true);
    const updatedPreferences = preferences.filter((p) => p.moduleCode !== moduleCode);
    setPreferences(updatedPreferences);
    processLastRequest(
      () => updatePreferences(updatedPreferences),
      () => setIsUpdating(false),
    );
  };

  const updateModuleType = (moduleCode: ModuleCode, moduleType: MpePreference['moduleType']) => {
    if (!preferences.some((p) => p.moduleCode === moduleCode)) return;
    setIsUpdating(true);
    const updatedPreferences = preferences.map((p) =>
      p.moduleCode === moduleCode ? { ...p, moduleType } : p,
    );
    setPreferences(updatedPreferences);
    processLastRequest(
      () => updatePreferences(updatedPreferences),
      () => setIsUpdating(false),
    );
  };

  return (
    <div>
      <div className={styles.headerTitle}>
        <div className={styles.rank}>Rank</div>
        <div className={styles.module}>Module</div>
        <div className={styles.mc}>{sumBy(preferences, (p) => p.moduleCredits)} MCs Selected</div>
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
      <div className={styles.SelectContainer}>
        <ModulesSelectContainer
          preferences={preferences}
          mpeModuleList={mpeModuleList}
          removeModule={removeModule}
          addModule={addModule}
        />
      </div>
      <p className={styles.Status}>{isUpdating ? 'Saving...' : 'All changes are saved'} </p>
      <Modal
        isOpen={hitMaxModsLimit}
        onRequestClose={() => setHitMaxModsLimit(false)}
        shouldCloseOnOverlayClick={false}
        animate
      >
        You are unable to add more than 7 modules in this exercise.
        <br /> <br />
        <button
          type="button"
          className={classnames('btn btn-outline-primary btn-svg', styles.ErrorButton)}
          onClick={() => setHitMaxModsLimit(false)}
        >
          Ok
        </button>
      </Modal>
    </div>
  );
};

export default ModuleForm;
