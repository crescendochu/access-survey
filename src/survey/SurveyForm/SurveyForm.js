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

const TOTAL_STEPS = 14;
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


  const { id } = useParams(); 
  const navigate = useNavigate();

  useEffect(() => {
    let steps = 14; // base number of steps
    setTotalSteps(steps);
  }, [/* dependencies that might change the number of steps, e.g., answers */]);

  const progressValue = (currentStep / totalSteps) * 100;


  const startSurvey = () => {
    setCurrentStep(1); // Start the survey
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
    if (currentStep === 7 && imageSelections.group0.group0A.length < 1) {
      setCurrentStep(8); // Skip Group 0 ImageComparison A if no images
    } else if (currentStep === 8 && imageSelections.group0.group0B.length < 1) {
      setCurrentStep(9); // Skip Group 0 ImageComparison B if no images
    } else if (currentStep === 10 && imageSelections.group1.group1A.length < 1) {
      setCurrentStep(11); // Skip Group 1 ImageComparison A if no images
    } else if (currentStep === 11 && imageSelections.group1.group1B.length < 1) {
      setCurrentStep(12); // Skip Group 1 ImageComparison B if no images
    }
    // else if (currentStep === 13 && imageSelections.group2.group2A.length < 1) {
    //   setCurrentStep(14); // Skip Group 2 ImageComparison A if no images
    // } else if (currentStep === 14 && imageSelections.group2.group2B.length < 1) {
    //   setCurrentStep(15); // Skip Group 2 ImageComparison B if no images
    // }
    // else if (currentStep === 16 && imageSelections.group3.group3A.length < 1) {
    //   setCurrentStep(17); // Skip Group 3 ImageComparison A if no images
    // } else if (currentStep === 17 && imageSelections.group3.group3B.length < 1) {
    //   setCurrentStep(18); // Skip Group 3 ImageComparison B if no images
    // }
    // else if (currentStep === 19 && imageSelections.group4.group4A.length < 1) {
    //   setCurrentStep(20); // Skip Group 4 ImageComparison A if no images
    // } else if (currentStep === 20 && imageSelections.group4.group4B.length < 1) {
    //   setCurrentStep(21); // Skip Group 4 ImageComparison B if no images
    // }
    // else if (currentStep === 22 && imageSelections.group5.group5A.length < 1) {
    //   setCurrentStep(23); // Skip Group 5 ImageComparison A if no images
    // } else if (currentStep === 23 && imageSelections.group5.group5B.length < 1) {
    //   setCurrentStep(24); // Skip Group 5 ImageComparison B if no images
    // }
    // else if (currentStep === 25 && imageSelections.group6.group6A.length < 1) {
    //   setCurrentStep(26); // Skip Group 6 ImageComparison A if no images
    // } else if (currentStep === 26 && imageSelections.group6.group6B.length < 1) {
    //   setCurrentStep(27); // Skip Group 6 ImageComparison B if no images
    // }
    // else if (currentStep === 28 && imageSelections.group7.group7A.length < 1) {
    //   setCurrentStep(29); // Skip Group 7 ImageComparison A if no images
    // } else if (currentStep === 29 && imageSelections.group7.group7B.length < 1) {
    //   setCurrentStep(30); // Skip Group 7 ImageComparison B if no images
    // }
    // else if (currentStep === 31 && imageSelections.group8.group8A.length < 1) {
    //   setCurrentStep(32); // Skip Group 8 ImageComparison A if no images
    // } else if (currentStep === 32 && imageSelections.group8.group8B.length < 1) {
    //   setCurrentStep(33); // Skip Group 8 ImageComparison B if no images
    // }
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
    // logData();
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
              images={group0CropsData}
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

    case 12:
      return <RankQuestion
              stepNumber={currentStep}
              nextStep={nextStep}
              previousStep={previousStep}
              answers={answers}
              updateAnswers={updateAnswers}
              errors= {errors}
            />
    
    case 13: 
    
      if (answers.mobilityAidOptions.mobilityAidOptions.length == 1 ||  // if only one mobility aid option
        (answers.answeredMobilityAids && answers.answeredMobilityAids.length > 0) // if answered mobility aids exist
      ) {
        const remainingOptions = answers.mobilityAidOptions.mobilityAidOptions.filter(option => !answers.answeredMobilityAids.includes(option));
        
        if(remainingOptions.length === 1) {
          setCurrentStep(14);
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
    case 14:
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
    });
    console.log("Document written with ID: ", docRef.id);
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