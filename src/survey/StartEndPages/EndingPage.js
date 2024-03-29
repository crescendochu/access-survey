import React from 'react';
import { Button } from "@material-tailwind/react";
import NavigationButton from '../../components/NavigationButton';

const EndingPage = ({ previousStep, onSubmit }) => {
  return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: "24px", alignItems: 'center', position: 'relative', margin: 'auto', width: '90vw' }}>
        <h2 className="mb-4">Thank you so much for completing this survey!</h2>
        <div className="flex justify-center gap-4 mt-5">
        <Button
         className='lg-font-size-button'
          color="teal"
          variant ="outlined"
          size="lg"
          onClick={previousStep}
        >
          Go Back
        </Button>
        <Button
         className='lg-font-size-button'
          color="teal"
          size="lg"
          onClick={onSubmit}
        >
          Submit
        </Button>
        
        </div>
        </div>
  );
};

export default EndingPage;