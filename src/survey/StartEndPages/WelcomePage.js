import React, {useEffect } from 'react';
import { Button, Card, CardBody } from "@material-tailwind/react";

const WelcomePage = ({ onStart }) => {
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onStart();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <>
      <Card className="max-w-2xl mt-4 shadow-none">
        <CardBody className="flex flex-col items-center justify-center p-4 gap-2">
          <div className="max-w-md mb-8">
            <img src={`${process.env.PUBLIC_URL}/img/ps_logo.jpg`} alt="Welcome" className="w-full" />
          </div>
          <h2>Perceptions of Sidewalk Barriers Survey</h2>
          <div className="question-button-group flex flex-col">
            <Button
              className='lg-font-size-button'
              color="teal"
              size="lg"
              onClick={onStart}
            >
              Start
            </Button>
            <span className="text-w text-teal-700">press Enter ↵</span>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default WelcomePage;
