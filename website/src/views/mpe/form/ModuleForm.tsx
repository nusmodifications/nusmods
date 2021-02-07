import { useState } from 'react';
import { Draggable, DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import styles from './ModuleForm.scss';
import ModuleCard from './ModuleCard';
import ModulesSelectContainer from './ModulesSelectContainer';
import Rank from './Rank';

// TODO: Move this definition to the correct place for types returned by API calls.
type Preference = {
  moduleTitle: string;
  moduleCode: string;
  moduleCredits: number;
};

type Props = {
  totalMC: number; // Remove this when new props are added.
};

const ModuleForm: React.FC<Props> = (props) => {
  // TODO: Fetch preferences from server with useEffect.
  const [preferences, setPreferences] = useState<Preference[]>([
    {
      moduleTitle: 'Programming Methodology II',
      moduleCode: 'CS2030S',
      moduleCredits: 4,
    },
    {
      moduleTitle: 'Linear Algebra I',
      moduleCode: 'MA1101R',
      moduleCredits: 4,
    },
    {
      moduleTitle: 'Discrete Structures',
      moduleCode: 'CS1231S',
      moduleCredits: 4,
    },
    {
      moduleTitle: 'Computer Organisation',
      moduleCode: 'CS2100',
      moduleCredits: 4,
    },
  ]);

  const onDragEnd = (result: DropResult): void => {
    if (!result.destination) return;
    setPreferences(reorder(preferences, result.source.index, result.destination.index));
  };

  const reorder = (items: Array<any>, startIndex: number, endIndex: number) => {
    const result = [...items];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerTitle}>
        <div className={styles.rank}>Rank</div>
        <div className={styles.module}>Module</div>
        <div className={styles.mc}>
          {props.totalMC > 1 ? `${props.totalMC} MCs Selected` : `${props.totalMC} MC Selected`}
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {preferences.map((preference, index) => (
                <div className="row" key={index}>
                  <Rank rankNumber={index + 1} />
                  <Draggable
                    key={preference.moduleCode}
                    draggableId={preference.moduleCode}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ModuleCard
                          moduleTitle={preference.moduleTitle}
                          moduleCode={preference.moduleCode}
                          moduleCredits={preference.moduleCredits}
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
      <div className={styles.SelectContainer}>
        <ModulesSelectContainer semester={2021} />
      </div>
      <p className={styles.Status}>All changes are saved</p>
    </div>
  );
};
export default ModuleForm;
