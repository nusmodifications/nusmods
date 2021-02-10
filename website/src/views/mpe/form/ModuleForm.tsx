import { useEffect, useState } from 'react';
import { Draggable, DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Preference } from 'types/mpe';
import { ModuleCode } from 'types/modules';
import { fetchModuleDetails, getMPEPreference, updateMPEPreference } from 'apis/mpe';
import classnames from 'classnames';
import styles from './ModuleForm.scss';
import ModuleCard from './ModuleCard';
import ModulesSelectContainer from './ModulesSelectContainer';
import Rank from './Rank';

type Props = {
  placeholder?: boolean; // Remove this when new props are added.
};

const ModuleForm: React.FC<Props> = (props) => {
  // TODO: Fetch preferences from server with useEffect.
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [totalMC, setTotalMC] = useState<number>(0);
  const onDragEnd = (result: DropResult): void => {
    if (!result.destination) return;
    setPreferences(reorder(preferences, result.source.index, result.destination.index));
  };

  const reorder = (items: Array<Preference>, startIndex: number, endIndex: number) => {
    const result = [...items];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  async function addModule(moduleCode: ModuleCode) {
    // Call the getUpdatePreference here
    const moduleInformation = await fetchModuleDetails(moduleCode);
    try {
      const additionalPreference: Preference = {
        moduleTitle: moduleInformation.title,
        moduleCode: moduleInformation.moduleCode,
        moduleType: null,
        moduleCredits: moduleInformation.moduleCredit,
      };
      const newPreferences: Preference[] = [...preferences, additionalPreference];
      setPreferences(newPreferences);
      setTotalMC(totalMC + parseInt(additionalPreference.moduleCredits, 16));
    } catch (err) {
      console.log(err);
    }
  }

  async function removeModule(moduleCodeToRemove: ModuleCode) {
    // Call the getUpdatePreference here
    try {
      const moduleToRemove = preferences.filter((c) => c.moduleCode === moduleCodeToRemove)[0];
      const updatedPreferences: Preference[] = preferences.filter(
        (c) => c.moduleCode !== moduleCodeToRemove,
      );
      setPreferences(updatedPreferences);
      setTotalMC(totalMC - parseInt(moduleToRemove.moduleCredits, 16));
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div>
      <div className={styles.headerTitle}>
        <div className={styles.rank}>Rank</div>
        <div className={styles.module}>Module</div>
        <div className={styles.mc}>
          {totalMC > 1 ? `${totalMC} MCs Selected` : `${totalMC} MC Selected`}
        </div>
      </div>
      <div className={styles.DragDropContainer}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {preferences.map((preference, index) => (
                  <div key={index} className={styles.droppableContainer}>
                    <div className={styles.rankContainer}>
                      <Rank rankNumber={index + 1} />
                    </div>
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
                            Preference={{
                              moduleTitle: preference.moduleTitle,
                              moduleCode: preference.moduleCode,
                              moduleType: preference.moduleType,
                              moduleCredits: preference.moduleCredits,
                            }}
                            removeModule={removeModule}
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
        <ModulesSelectContainer semester={2021} removeModule={removeModule} addModule={addModule} />
      </div>
      <p className={styles.Status}>All changes are saved</p>
    </div>
  );
};
export default ModuleForm;
