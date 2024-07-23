import React, { useState, useRef, useEffect } from 'react';
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from '@material-tailwind/react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../config';
import { HandsClapping } from 'phosphor-react';

const BreakPage = ({ currentStep, onContinue, answers, completedGroups, onEmailLink }) => {
  const [continueUrl, setContinueUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const nextGroupButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        if (nextGroupButtonRef.current) {
          nextGroupButtonRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);



  console.log('completedGroups', completedGroups);
  const onSave = async () => {
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(firestore, "surveyAnswers"), {
        ...answers,
        isGroupContinue: true,
        currentStep: currentStep,
        timestamp: serverTimestamp()
      });

      const resumeUrl = `${window.location.origin}/access-survey/#/resume-survey/${docRef.id}`;
      setContinueUrl(resumeUrl);
    } catch (error) {
      console.error("Error saving document: ", error);
    }
    setIsSaving(false);
  }

  const handleClose = () => {
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} handler={handleClose} size="mg" className='text-3xl'>
      <DialogHeader> 
      <span className="flex items-center">
        <HandsClapping size={32} className="mr-2"/> 
        Great job!
        </span>
        </DialogHeader>
      <DialogBody className='text-2xl'>
        {!continueUrl && 
        <p>You have completed rating {completedGroups} out of 9 groups of images.</p>
  }
        {continueUrl && (
          <div>
            <p>You can resume later using this link:</p>
            <a href={continueUrl} className="text-cyan-800 underline" target="_blank" rel="noopener noreferrer">{continueUrl}</a>
          </div>
        )}
      </DialogBody>
      <DialogFooter>
      <div className="flex justify-center gap-4 mt-5">
      {continueUrl && (
          <Button
            className='lg-font-size-button'
            color="teal"
            variant= "outlined"
            size="lg"
            onClick={onEmailLink}
          >
            Email Me the Link
          </Button>
        )}
      {!continueUrl && (<Button
        className='lg-font-size-button'
        color="teal"
        size="lg"
        variant='outlined'
        onClick={onSave} 
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save & Continue Later'}
        </Button>
      )}
        <Button 
        className='lg-font-size-button'
        color="teal" 
        size='lg' 
        onClick={onContinue}
        ref={nextGroupButtonRef}
        autoFocus>
          Next Group
          </Button>
        </div>
      </DialogFooter> 
    </Dialog>
  );
};

export default BreakPage;
