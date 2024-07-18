import React, {useEffect } from 'react';
import { Button, Card, CardBody } from "@material-tailwind/react";

const WelcomePage = ({ onStart }) => {
  const [isWelcomeDialogOpen, setIsWelcomeDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = () => {
    setIsWelcomeDialogOpen(true);
  };

  const handleCloseWelcomeDialog = () => {
    const confirmationCheckbox = document.getElementById('confirmationCheckbox');
    if (confirmationCheckbox && !confirmationCheckbox.checked) {
      setError('Please confirm that you have read and understood the instructions.');
      return;
    }
    setError(null);
    setIsWelcomeDialogOpen(false);
    onStart();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (isWelcomeDialogOpen) {
        handleCloseWelcomeDialog();
      } else {
        handleStart();
      }
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
      <Dialog open={isWelcomeDialogOpen} handler={setIsWelcomeDialogOpen} size="lg">
        <DialogBody className="max-w-4xl mx-auto p-8 text-left text-base">
          <h2 className="text-2xl font-semibold mb-4">Welcome to our study on mobility devices and sidewalk accessibility!</h2>
          <div className="mb-4">
            <img src={`${process.env.PUBLIC_URL}/img/label-examples.png`} alt="Welcome" />
          </div>
          <p className="mb-4">
            In this survey, we will ask you about <b>your perceptions of various sidewalk barriers</b> such as obstacles and surface problems as shown in images similar to the above. Our goal is to understand how people using different mobility devices perceive barriers in urban environments.
          </p>
          <p className="mb-4">
            You may <b>save your responses</b> when prompted and come back at a later time. Your responses will be kept confidential and will be used for research purposes only.
          </p>
          <p className="mb-4">
            One out of every 30 respondents will earn a <b>$50 gift certificate to Amazon</b>.
          </p>
          <p className="mb-8">
            This work is led by researchers from the University of Washington. If you have any questions, please contact: <a href="mailto:chuchuli@cs.washington.edu" className="text-teal-700 underline">chuchuli@cs.washington.edu</a>.
          </p>
          <div className="mb-4">
            <input type="checkbox" id="confirmationCheckbox" />
            <label htmlFor="confirmationCheckbox" className="ml-2">I have read and understood the instructions.</label>
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <div className="flex justify-end items-center">
            <Button size="lg" color="teal" onClick={handleCloseWelcomeDialog}>Let’s get started</Button>
            <span className="ml-4 text-teal-700">press Enter ↵</span>
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
};

export default WelcomePage;
