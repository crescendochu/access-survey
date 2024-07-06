// SurveyForm.js
import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { Progress } from "@material-tailwind/react";
import { useParams, useNavigate } from 'react-router-dom';
import Question1 from '../Questions/Question1';
import Question2 from '../Questions/Question2';
import Question3 from '../Questions/Question3';
import Question4 from '../Questions/Question4';
import Question5 from '../Questions/Question5';
import ImageSelection from '../ImageSelection/ImageSelection';
import ImageComparison from '../ImageComaprison/ImageComparison';
import WelcomePage from '../StartEndPages/WelcomePage'; 
import EndingPage from '../StartEndPages/EndingPage';
import ContinuePage from '../Questions/ContinuePage';
import { v4 as uuidv4 } from 'uuid';
import RankQuestion from '../Questions/RankQuestion';
import group0CropsData from '../CropsData/group0CropsData';
import group1CropsData from '../CropsData/group1CropsData';
import group2CropsData from '../CropsData/group2CropsData';
import group3CropsData from '../CropsData/group3CropsData';
import group4CropsData from '../CropsData/group4CropsData';
import group5CropsData from '../CropsData/group5CropsData';
import group6CropsData from '../CropsData/group6CropsData';
import group7CropsData from '../CropsData/group7CropsData';
import group8CropsData from '../CropsData/group8CropsData';


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5siaFnxhtfEbw1FaKuX8GkEQyN5rb6a0",
  authDomain: "sidewalk-survey-f7904.firebaseapp.com",
  projectId: "sidewalk-survey-f7904",
  storageBucket: "sidewalk-survey-f7904.appspot.com",
  messagingSenderId: "116996397844",
  appId: "1:116996397844:web:10d973cb146b348c040001",
  measurementId: "G-3MC54XMWQD"
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const TOTAL_STEPS = 34;
const MOBILITYAID_STEP = 5;

const SurveyComponent = () => {
  const [currentStep, setCurrentStep] = useState(0);
  // const [surfaceSelection, setSurfaceSelection] = useState({surfaceA: [], surfaceB: []});
  // const [obstacleSelection, setObstacleSelection] = useState({obstacleA: [], obstacleB: []});
  // const [noCurbSelection, setNoCurbSelection] = useState({noCurbA: [], noCurbB: []});
  const [imageSelections, setImageSelections] = useState({
    group0: { group0A: [], group0B: [] },
    group1: { group1A: [], group1B: [] },
    group2: { group2A: [], group2B: [] },
    group3: { group3A: [], group3B: [] },
    group4: { group4A: [], group4B: [] },
    group5: { group5A: [], group5B: [] },
    group6: { group6A: [], group6B: [] },
    group7: { group7A: [], group7B: [] },
    group8: { group8A: [], group8B: [] },
  });
  const [imageComparisons, setImageComparisons] = useState([]);
  const [totalSteps, setTotalSteps] = useState(TOTAL_STEPS);
  const [sessionId, setSessionId] = useState(uuidv4()); 
  const [userId, setUserId] = useState(uuidv4()); 
  const [continueUrl, setContinueUrl] = useState('');
  const [singleMobilityAid, setSingleMobilityAid] = useState(false);
  const [errors, setErrors] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [endSessionTime, setEndSessionTime] = useState(null);
  const [endSurveyTime, setEndSurveyTime] = useState(null);


  const { id } = useParams(); 
  // const navigate = useNavigate();

  useEffect(() => {
    let steps = 35; // base number of steps
    setTotalSteps(steps);
  }, [/* dependencies that might change the number of steps, e.g., answers */]);

  const progressValue = (currentStep / totalSteps) * 100;


  const startSurvey = () => {
    setCurrentStep(1); // Start the survey
    setStartTime(new Date());
  };
  
  const [answers, setAnswers] = useState({
    name: '',
    email: '',
    mobilityAid: '',
    sidewalkBarriers: '',
    answeredMobilityAids: []
  });

  // for resuming the survey
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const docRef = doc(firestore, "surveyAnswers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserId(data.userId);
          setSessionId(data.sessionId);
          setAnswers(data);
          // set the current mobility aid
          if (data.answeredMobilityAids && data.answeredMobilityAids.length > 0) {
            const remainingOptions = data.mobilityAidOptions.mobilityAidOptions.filter(option => !data.answeredMobilityAids.includes(option));
            handleMobilityAidChange(remainingOptions[0]);
          }

          setCurrentStep(MOBILITYAID_STEP);

          setImageSelections(data.imageSelections || {
            group0: { group0A: [], group0B: [] },
            group1: { group1A: [], group1B: [] },
            group2: { group2A: [], group2B: [] },
            group3: { group3A: [], group3B: [] },
            group4: { group4A: [], group4B: [] },
            group5: { group5A: [], group5B: [] },
            group6: { group6A: [], group6B: [] },
            group7: { group7A: [], group7B: [] },
            group8: { group8A: [], group8B: [] },
          });
          setImageComparisons(data.imageComparisons || []);
        } else {
          console.log("No such document!");
        }
      }
    };
    fetchData();
  }, [id]);

  // for handling the case where the image group is empty
  useEffect(() => {
    const stepMappings = [
      { step: 7, group: 'group0', subGroup: 'group0A', nextStep: 8 },
      { step: 8, group: 'group0', subGroup: 'group0B', nextStep: 9 },
      { step: 10, group: 'group1', subGroup: 'group1A', nextStep: 11 },
      { step: 11, group: 'group1', subGroup: 'group1B', nextStep: 12 },
      { step: 13, group: 'group2', subGroup: 'group2A', nextStep: 14 },
      { step: 14, group: 'group2', subGroup: 'group2B', nextStep: 15 },
      { step: 16, group: 'group3', subGroup: 'group3A', nextStep: 17 },
      { step: 17, group: 'group3', subGroup: 'group3B', nextStep: 18 },
      { step: 19, group: 'group4', subGroup: 'group4A', nextStep: 20 },
      { step: 20, group: 'group4', subGroup: 'group4B', nextStep: 21 },
      { step: 22, group: 'group5', subGroup: 'group5A', nextStep: 23 },
      { step: 23, group: 'group5', subGroup: 'group5B', nextStep: 24 },
      { step: 25, group: 'group6', subGroup: 'group6A', nextStep: 26 },
      { step: 26, group: 'group6', subGroup: 'group6B', nextStep: 27 },
      { step: 28, group: 'group7', subGroup: 'group7A', nextStep: 29 },
      { step: 29, group: 'group7', subGroup: 'group7B', nextStep: 30 },
      { step: 31, group: 'group8', subGroup: 'group8A', nextStep: 32 },
      { step: 32, group: 'group8', subGroup: 'group8B', nextStep: 33 },
    ];
  
    const currentMapping = stepMappings.find(mapping => mapping.step === currentStep);
    if (currentMapping && imageSelections[currentMapping.group][currentMapping.subGroup].length < 1) {
      setCurrentStep(currentMapping.nextStep);
    }
  }, [currentStep, imageSelections]);
  

  useEffect(() => {
    if(answers.mobilityAidOptions && answers.answeredMobilityAids &&
      answers.mobilityAidOptions.length === answers.answeredMobilityAids.length) {
      setCurrentStep(TOTAL_STEPS); 
    }
  }, [answers]);

const handleGroupSelectionComplete = (group, selection) => {
  setImageSelections(prevSelections => ({
    ...prevSelections,
    [group]: { [`${group}A`]: selection.groupAImages, [`${group}B`]: selection.groupBImages }
  }));
  setCurrentStep(currentStep + 1);
};

const nextStep = () => {
  if (validateCurrentStep()) {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }

    if (currentStep < 13) {
      // log all data before continuing to the next mobility aid
      logData();
    }
  }
};

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  

  const validateCurrentStep = () => {
    let isValid = true;
    let newErrors = {};

    switch (currentStep) {
      case 1:
        if (!answers.name) {
          isValid = false;
          newErrors.name = 'Please fill this in';
        }
        break;
      case 2:
        if (!answers.email) {
          isValid = false;
          newErrors.email = 'Please fill this in';
        } else {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(answers.email)) {
            isValid = false;
            newErrors.email = 'Please enter a valid email address';
          }
        }
        
        break;
      case 3:
        if (!answers.mobilityAidOptions || answers.mobilityAidOptions.mobilityAidOptions.length === 0) {
          isValid = false;
          newErrors.mobilityAidOptions = 'Please select at least one option';
        }
        break;
      case 4:
        if (!answers.mobilityAid) {
          isValid = false;
          newErrors.mobilityAid = 'Please make a selection';
        }
        break;
      // add more cases for other questions
      default:
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const updateAnswers = (key, value) => {
    setAnswers(prevAnswers => ({ ...prevAnswers, [key]: value }));
    setErrors(prevErrors => ({ ...prevErrors, [key]: '' }));
  };

  const handleChange = (input) => (e) => {
    setAnswers({ ...answers, [input]: e.target.value });
    setErrors({ ...errors, [input]: '' });
  }; 

  const handleMobilityAidChange = (newMobilityAid) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      mobilityAid: newMobilityAid
    }));
  };
    

  const onSelectionComplete = (data) => {
    setImageComparisons(prev => [...prev, { ...data }]);
};

const renderCurrentStep = () => {
  switch(currentStep) {
    // Questions 1-4
    case 1:
      return <Question1 
              stepNumber={currentStep} 
              nextStep={nextStep} 
              handleChange={handleChange}
              errors= {errors} 
              />;
    case 2:
      return <Question2 
              stepNumber={currentStep} 
              nextStep={nextStep} 
              previousStep={previousStep} 
              handleChange={handleChange}
              errors= {errors} 
              />;
    case 3:
      return <Question3 
              stepNumber={currentStep} 
              nextStep={nextStep} 
              previousStep={previousStep} 
              updateAnswers={updateAnswers}
              setSingleMobilityAid={setSingleMobilityAid} 
              errors= {errors}/>;
    case 4:
      if (singleMobilityAid) {
        nextStep(); // Skip here if only one mobility aid option
        return null; 
      }
      return <Question4
              stepNumber={currentStep}
              nextStep={nextStep}
              previousStep={previousStep}
              answers={answers}
              handleChange={handleChange}
              errors= {errors}
            />;
    case 5:
      return <Question5 
              stepNumber={currentStep} 
              nextStep={nextStep} 
              previousStep={previousStep} 
              answers={answers} 
              handleChange={handleChange}
              singleMobilityAid={singleMobilityAid} 
              errors= {errors}// Pass the skip state
             />;
    case 6: // Group 0 ImageSelection
      return <ImageSelection 
              stepNumber={currentStep}
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep} 
              images={group0CropsData} 
              onComplete={(selection) => handleGroupSelectionComplete('group0', selection)} 
              errors= {errors}/>;
    case 7: // Group 0 ImageComparison A
      return <ImageComparison 
              key="Group0A" 
              stepNumber={currentStep} 
              answers={answers}
              images={imageSelections.group0.group0A} 
              nextStep={nextStep} 
              previousStep={previousStep}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group0Acompare" 
              onComplete={() => setCurrentStep(8)} 
              errors= {errors}/>;
    case 8: // Group 0 ImageComparison B
      return <ImageComparison 
              key="Group0B" 
              stepNumber={currentStep}
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep} 
              images={imageSelections.group0.group0B}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group0Bcompare"
              onComplete={() => setCurrentStep(9)} 
              errors= {errors}/>;
    case 9: // Group 1 ImageSelection
      return <ImageSelection 
              stepNumber={currentStep}
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep} 
              images={group1CropsData}
              onComplete={(selection) => handleGroupSelectionComplete('group1', selection)} 
              errors= {errors}/>;
    case 10: // Group 1 ImageComparison A
      return <ImageComparison 
              key="Group1A" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group1.group1A}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group1Acompare"
              onComplete={() => setCurrentStep(11)} 
              errors= {errors}/>;
    case 11: // Group 1 ImageComparison B
      return <ImageComparison 
              key="Group1B" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group1.group1B}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group1Bcompare"
              onComplete={() => setCurrentStep(12)}
              errors= {errors} />;

    case 12: // Group 2 ImageSelection
      return <ImageSelection 
              stepNumber={currentStep}
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep} 
              images={group2CropsData}
              onComplete={(selection) => handleGroupSelectionComplete('group2', selection)} 
              errors= {errors}/>;
    case 13: // Group 2 ImageComparison A
      return <ImageComparison 
              key="Group2A" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group2.group2A}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group2Acompare"
              onComplete={() => setCurrentStep(14)} 
              errors= {errors}/>;
    case 14: // Group 2 ImageComparison B
      return <ImageComparison 
              key="Group2B" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group2.group2B}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group2Bcompare"
              onComplete={() => setCurrentStep(15)}
              errors= {errors} />;
    case 15: // Group 3 ImageSelection
      return <ImageSelection 
              stepNumber={currentStep}
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep} 
              images={group3CropsData}
              onComplete={(selection) => handleGroupSelectionComplete('group3', selection)} 
              errors= {errors}/>;
    case 16: // Group 3 ImageComparison A
      return <ImageComparison 
              key="Group3A" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group3.group3A}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group3Acompare"
              onComplete={() => setCurrentStep(17)} 
              errors= {errors}/>;
    case 17: // Group 3 ImageComparison B
      return <ImageComparison 
              key="Group3B" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group3.group3B}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group3Bcompare"
              onComplete={() => setCurrentStep(18)}
              errors= {errors} />;
    case 18: // Group 4 ImageSelection
      return <ImageSelection 
              stepNumber={currentStep}
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep} 
              images={group4CropsData}
              onComplete={(selection) => handleGroupSelectionComplete('group4', selection)} 
              errors= {errors}/>;
    case 19: // Group 4 ImageComparison A
      return <ImageComparison 
              key="Group4A" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group4.group4A}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group4Acompare"
              onComplete={() => setCurrentStep(20)} 
              errors= {errors}/>;
    case 20: // Group 4 ImageComparison B
      return <ImageComparison 
              key="Group4B" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group4.group4B}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group4Bcompare"
              onComplete={() => setCurrentStep(21)}
              errors= {errors} />;
    case 21: // Group 5 ImageSelection
      return <ImageSelection 
              stepNumber={currentStep}
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep} 
              images={group5CropsData}
              onComplete={(selection) => handleGroupSelectionComplete('group5', selection)} 
              errors= {errors}/>;
    case 22: // Group 5 ImageComparison A
      return <ImageComparison 
              key="Group5A" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group5.group5A}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group5Acompare"
              onComplete={() => setCurrentStep(23)} 
              errors= {errors}/>;
    case 23: // Group 5 ImageComparison B
      return <ImageComparison 
              key="Group5B" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group5.group5B}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group5Bcompare"
              onComplete={() => setCurrentStep(24)}
              errors= {errors} />;
    case 24: // Group 6 ImageSelection
      return <ImageSelection 
              stepNumber={currentStep}
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep} 
              images={group6CropsData}
              onComplete={(selection) => handleGroupSelectionComplete('group6', selection)} 
              errors= {errors}/>;
    case 25: // Group 6 ImageComparison A
      return <ImageComparison 
              key="Group6A" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group6.group6A}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group6Acompare"
              onComplete={() => setCurrentStep(26)} 
              errors= {errors}/>;
    case 26: // Group 6 ImageComparison B
      return <ImageComparison 
              key="Group6B" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group6.group6B}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group6Bcompare"
              onComplete={() => setCurrentStep(27)}
              errors= {errors} />;
    case 27: // Group 7 ImageSelection
      return <ImageSelection 
              stepNumber={currentStep}
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep} 
              images={group7CropsData}
              onComplete={(selection) => handleGroupSelectionComplete('group7', selection)} 
              errors= {errors}/>;
    case 28: // Group 7 ImageComparison A
      return <ImageComparison 
              key="Group7A" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group7.group7A}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group7Acompare"
              onComplete={() => setCurrentStep(29)} 
              errors= {errors}/>;
    case 29: // Group 7 ImageComparison B
      return <ImageComparison 
              key="Group7B" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group7.group7B}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group7Bcompare"
              onComplete={() => setCurrentStep(30)}
              errors= {errors} />;
    case 30: // Group 8 ImageSelection
      return <ImageSelection 
              stepNumber={currentStep}
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep} 
              images={group8CropsData}
              onComplete={(selection) => handleGroupSelectionComplete('group8', selection)} 
              errors= {errors}/>;
    case 31: // Group 8 ImageComparison A
      return <ImageComparison 
              key="Group8A" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group8.group8A}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group8Acompare"
              onComplete={() => setCurrentStep(32)} 
              errors= {errors}/>;
    case 32: // Group 8 ImageComparison B
      return <ImageComparison 
              key="Group8B" 
              stepNumber={currentStep} 
              answers={answers}
              nextStep={nextStep} 
              previousStep={previousStep}
              images={imageSelections.group8.group8B}
              onSelectionComplete={onSelectionComplete} 
              comparisonContext="group8Bcompare"
              onComplete={() => setCurrentStep(33)}
              errors= {errors} />;

    case 33:
      return <RankQuestion
              stepNumber={currentStep}
              nextStep={nextStep}
              previousStep={previousStep}
              answers={answers}
              updateAnswers={updateAnswers}
              errors= {errors}
            />
    
    case 34: 
    
      if (answers.mobilityAidOptions.mobilityAidOptions.length === 1 ||  // if only one mobility aid option
        (answers.answeredMobilityAids && answers.answeredMobilityAids.length > 0) // if answered mobility aids exist
      ) {
        const remainingOptions = answers.mobilityAidOptions.mobilityAidOptions.filter(option => !answers.answeredMobilityAids.includes(option));
        
        if(remainingOptions.length === 1) {
          setCurrentStep(35);
          return null;
        }
      } 
      return <ContinuePage 
              answers={answers}
              handleMobilityAidChange={handleMobilityAidChange}
              previousStep={previousStep} 
              nextStep={() => {handleSubmit();}}
              yesStep={() => {setCurrentStep(5);}}
              setContinueUrl={setContinueUrl}
              logData={logMobilityAidData}
              erros= {errors}
              />;
    case 35:
      setEndSurveyTime(new Date());
      return <EndingPage 
              previousStep={previousStep} 
              continueUrl={continueUrl} // pass continueUrl
              onSubmit={handleSubmit} />;

    default:
      return <WelcomePage onStart={startSurvey}/>;
  }
};

useEffect(() => {
}, [currentStep]);

const handleSubmit = async () => {
  if (validateCurrentStep()) {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }

  let logType = 'final'; // form is submitted 
  answers.answeredMobilityAids.push(answers.mobilityAid);
  //do duration in seconds
  const duration = (endSurveyTime - startTime) / 1000;

  try {
    const docRef = await addDoc(collection(firestore, "surveyAnswers"), {
      sessionId, 
      userId, 
      currentStep,
      logType,
      ...answers, 
      imageSelections,
      imageComparisons,
      timestamp: serverTimestamp(), 
      duration
    });
    console.log("Document written with ID: ", docRef.id);
    console.log("Survey completed in: ", duration);
  } catch (e) {
    console.error("Error adding document: ", e);
    }
  }
};

const logData = async () => {
  let logType = 'temp'; 

  try {
    const docRef = await addDoc(collection(firestore, "surveyAnswers"), {
        sessionId, 
        userId, 
        currentStep,
        logType,
        ...answers,
        imageSelections,
        imageComparisons,
        timestamp: serverTimestamp()
      });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

const logMobilityAidData = async () => {
  let logType = 'CompletedOneMobilityAid'; 
  answers.answeredMobilityAids.push(answers.mobilityAid);

  try {
    const docRef = await addDoc(collection(firestore, "surveyAnswers"), {
        sessionId, 
        userId, 
        currentStep,
        logType,
        ...answers,
        imageSelections,
        imageComparisons,
        timestamp: serverTimestamp()
      });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};


return (
  <div>
    {currentStep > 0 && (
      <div style={{ position: 'fixed', top: 0, width: '100%', left:-4}}>
        <Progress value={progressValue} color="teal" size="sm"/>
      </div>
    )}
    {renderCurrentStep()}
  </div>
);

};

export default SurveyComponent;