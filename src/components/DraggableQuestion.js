import React from 'react';
import { Button } from '@material-tailwind/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PageNavigations from './PageNavigations';
import './DraggableQuestion.css';

const DraggableQuestion = ({ questionText, inputId, instructionText, options, handleChange, previousStep, nextStep }) => {
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const newItems = Array.from(options);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    handleChange(newItems);
  };

  const handleDropdownChange = (e, currentIndex) => {
    const newOrder = parseInt(e.target.value, 10) - 1;
    const newItems = Array.from(options);
    const [movedItem] = newItems.splice(currentIndex, 1);
    newItems.splice(newOrder, 0, movedItem);

    handleChange(newItems);
  };

  const getGridPosition = (index) => {
    // index 1-7 in one column, 8-14 in the other
    // const column = index <7 ? '1' : '2'; 
    // const row = index <7 ? index+1 : index-6; 
    const column = index % 2 === 0 ? '1' : '2'; // Alternating columns
    const row = Math.floor(index / 2) + 1; // Calculate row based on index
    return { gridColumn: column, gridRow: row };
  };

  return (
    <div className="question-container">
      <div className="draggable-question-content">
        <h2>{questionText}</h2>
        <p style={{ fontSize: '0.8em', textAlign: 'left', marginTop: '24px', marginBottom: '24px' }}>{instructionText}</p>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={inputId}>
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gridColumnGap: '48px',
                  gap: '12px', 
                }}
              >
                {options.map((item, index) => {
                  const { gridColumn, gridRow } = getGridPosition(index);
                  return (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            userSelect: 'none',
                            fontSize: '0.8em',
                            padding: '6px 12px',
                            margin: '0 0 4px 0',
                            backgroundColor: '#E0F2F1',
                            borderRadius: '8px',
                            textAlign: 'left',
                            gridColumn,
                            gridRow,
                            ...provided.draggableProps.style,
                          }}
                        >
                          <select 
                            value={index + 1} 
                            onChange={(e) => handleDropdownChange(e, index)}
                            style={{ fontSize: '0.8em', marginRight: '8px' }}
                          >
                            {options.map((_, i) => (
                              <option key={i} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                          {item.value}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <div className="question-button-group items-center">
          <Button size='lg' className="lg-font-size-button" color="teal" onClick={nextStep}>OK</Button>
          <span className="text-w text-teal-700" >press Enter ↵</span>
        </div>
      </div>
      {/* <PageNavigations onPrevious={previousStep} onNext={nextStep} /> */}
    </div>
  );
};

export default DraggableQuestion;
