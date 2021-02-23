import { useEffect, useState } from 'react';
import sumBy from 'lodash/sumBy';
import { Draggable, DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { MpePreference, MODULE_TYPES } from 'types/mpe';
import { ModuleCode } from 'types/modules';
import LoadingSpinner from 'views/components/LoadingSpinner';
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

type Props = {
  getPreferences: () => Promise<MpePreference[]>;
  updatePreferences: (preferences: MpePreference[]) => Promise<string>;
};

const ModuleForm: React.FC<Props> = (props) => {
  const [preferences, setPreferences] = useState<MpePreference[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hitMaxModsLimit, setHitMaxModsLimit] = useState(false);

  const { getPreferences } = props;
  useEffect(() => {
    setIsInitialLoad(true);
    getPreferences()
      .then((result) => {
        setPreferences(result);
      })
      .catch((err) => {
        // this is a temporary fix
        // eslint-disable-next-line no-console
        console.log(err);
      })
      .finally(() => {
        setIsInitialLoad(false);
      });
  }, [getPreferences]);

  const onDragEnd = async (result: DropResult): Promise<void> =>
    new Promise((resolve) => {
      if (!result.destination) return;
      setIsUpdating(true);
      const updatedPreferences = reorder(
        preferences,
        result.source.index,
        result.destination.index,
      );
      setPreferences(updatedPreferences);
      processLastRequest(
        () => props.updatePreferences(updatedPreferences),
        () => setIsUpdating(false),
      );
      resolve();
    });

  const reorder = (items: MpePreference[], startIndex: number, endIndex: number) => {
    const result = [...items];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const addModule = (moduleCode: ModuleCode): Promise<void> =>
    new Promise((resolve) => {
      if (preferences.find((p) => p.moduleCode === moduleCode)) return;
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
          () => props.updatePreferences(updatedPreferences),
          () => setIsUpdating(false),
        );
        resolve();
      });
    });

  const removeModule = (moduleCode: ModuleCode): Promise<void> =>
    new Promise((resolve) => {
      setIsUpdating(true);
      const updatedPreferences = preferences.filter((p) => p.moduleCode !== moduleCode);
      setPreferences(updatedPreferences);
      processLastRequest(
        () => props.updatePreferences(updatedPreferences),
        () => setIsUpdating(false),
      );
      resolve();
    });

  const updateModuleType = (
    moduleCode: ModuleCode,
    moduleType: MpePreference['moduleType'],
  ): Promise<void> =>
    new Promise((resolve) => {
      if (!preferences.find((p) => p.moduleCode === moduleCode)) return;
      setIsUpdating(true);
      const updatedPreferences = preferences.map((p) =>
        p.moduleCode === moduleCode ? { ...p, moduleType } : p,
      );
      setPreferences(updatedPreferences);
      processLastRequest(
        () => props.updatePreferences(updatedPreferences),
        () => setIsUpdating(false),
      );
      resolve();
    });

  return (
    <div>
      <div className={styles.headerTitle}>
        <div className={styles.rank}>Rank</div>
        <div className={styles.module}>Module</div>
        <div className={styles.mc}>{sumBy(preferences, (p) => p.moduleCredits)} MCs Selected</div>
      </div>
      <div>
        {isInitialLoad ? (
          <LoadingSpinner />
        ) : (
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
        )}
      </div>
      <div className={styles.SelectContainer}>
        <ModulesSelectContainer
          moduleList={[]}
          preferences={preferences}
          semester={2021}
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
