import { useEffect, useState } from 'react';
import { Draggable, DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import type { ModuleType, MpePreference } from 'types/mpe';
import { ModuleCode } from 'types/modules';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { fetchModuleDetails } from '../../../apis/mpe';
import styles from './ModuleForm.scss';
import ModuleCard from './ModuleCard';
import ModulesSelectContainer from './ModulesSelectContainer';

type Props = {
  getPreferences: () => Promise<MpePreference[]>;
  updatePreferences: (preferences: MpePreference[]) => Promise<string>;
};

const ModuleForm: React.FC<Props> = (props) => {
  const [preferences, setPreferences] = useState<MpePreference[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    setIsInitialLoad(true);
    props
      .getPreferences()
      .then((result) => {
        setPreferences(result);
      })
      .catch((err) => {
        // console.log(err);
      })
      .finally(() => {
        setIsInitialLoad(false);
      });
  }, [props]);

  const onDragEnd = async (result: DropResult): Promise<void> => {
    if (!result.destination) return;
    setIsUpdating(true);
    const previousPreferences = [...preferences];
    const updatedPreferences = reorder(preferences, result.source.index, result.destination.index);
    setPreferences(updatedPreferences);
    try {
      await props.updatePreferences(updatedPreferences);
    } catch (err) {
      setPreferences(previousPreferences);
    } finally {
      setIsUpdating(false);
    }
  };

  const reorder = (items: MpePreference[], startIndex: number, endIndex: number) => {
    const result = [...items];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  async function addModule(moduleCode: ModuleCode) {
    if (preferences.find((p) => p.moduleCode === moduleCode)) return;
    setIsUpdating(true);
    const previousPreferences = [...preferences];
    try {
      const moduleInfo = await fetchModuleDetails(moduleCode);
      const updatedPreferences: MpePreference[] = [
        ...preferences,
        {
          moduleTitle: moduleInfo.title,
          moduleCode,
          moduleType: {
            type: '01',
          },
          moduleCredits: parseInt(moduleInfo.moduleCredit, 10),
        },
      ];
      setPreferences(updatedPreferences);
      await props.updatePreferences(updatedPreferences);
    } catch (err) {
      setPreferences(previousPreferences);
    } finally {
      setIsUpdating(false);
    }
  }

  async function removeModule(moduleCode: ModuleCode) {
    setIsUpdating(true);
    const previousPreferences = [...preferences];
    const updatedPreferences = preferences.filter((p) => p.moduleCode !== moduleCode);
    setPreferences(updatedPreferences);
    try {
      await props.updatePreferences(updatedPreferences);
    } catch (err) {
      setPreferences(previousPreferences);
    } finally {
      setIsUpdating(false);
    }
  }

  async function updateModuleType(moduleCode: ModuleCode, moduleType: ModuleType) {
    if (!preferences.find((p) => p.moduleCode === moduleCode)) return;
    setIsUpdating(true);
    const previousPreferences = [...preferences];
    const updatedPreferences = preferences.reduce<MpePreference[]>(
      (acc, p) => [...acc, p.moduleCode === moduleCode ? { ...p, moduleType } : p],
      [],
    );
    setPreferences(updatedPreferences);
    try {
      await props.updatePreferences(updatedPreferences);
    } catch (err) {
      setPreferences(previousPreferences);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div>
      <div className={styles.headerTitle}>
        <div className={styles.rank}>Rank</div>
        <div className={styles.module}>Module</div>
        <div className={styles.mc}>
          {`${preferences.reduce<number>((acc, p) => acc + p.moduleCredits, 0)} MCs Selected`}
        </div>
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
        <ModulesSelectContainer semester={2021} removeModule={removeModule} addModule={addModule} />
      </div>
      <p className={styles.Status}>{isUpdating ? 'Saving...' : 'All changes are saved'} </p>
    </div>
  );
};
export default ModuleForm;
