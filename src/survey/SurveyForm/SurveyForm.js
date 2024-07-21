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
import IntroPage from '../StartEndPages/IntroPage';
import WelcomePage from '../StartEndPages/WelcomePage'; 
import EndingPage from '../StartEndPages/EndingPage';
import ContinuePage from '../Questions/ContinuePage';
import BreakPage from '../StartEndPages/BreakPage';
import MobileWarningModal from '../StartEndPages/MobileWarningModal';
import InstructionsPage1 from '../StartEndPages/InstructionsPage1';
import InstructionsPage2 from '../StartEndPages/InstructionsPage2';
import { v4 as uuidv4 } from 'uuid';
import RankQuestion from '../Questions/RankQuestion';
import cropsData from '../CropsData/cropsData';
import emailjs from 'emailjs-com';
import { shuffleArray } from '../../utils';
import getIpAddress from '../../getIpAddress';

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

const TOTAL_STEPS = 38;
const MOBILITYAID_STEP = 6;
const IMAGE_STEP = 9;
const STEPS_PER_GROUP = 3;
const GROUP_ORDER = ['group0', 'group1', 'group2', 'group3', 'group4', 'group5', 'group6', 'group7', 'group8'];
const shuffledGroupOrder = shuffleArray([...GROUP_ORDER]);

const generateInitialImageSelections = () => {
  const initialState = {};
  for (let i = 0; i <= 8; i++) {
    initialState[`group${i}`] = {
      [`group${i}A`]: [],
      [`group${i}B`]: [],
    };
  }
  return initialState;
};

const groupedCropsData = cropsData.reduce((acc, item) => {
  const groupKey = `group${item.Group}`;
  if (!acc[groupKey]) {
    acc[groupKey] = [];
  }
  acc[groupKey].push(item);
  return acc;
}, {});
// shuffle images within each group
Object.keys(groupedCropsData).forEach(groupKey => {
  groupedCropsData[groupKey] = shuffleArray(groupedCropsData[groupKey]);
});

const SurveyComponent = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [imageSelections, setImageSelections] = useState(generateInitialImageSelections());
  const [imageComparisons, setImageComparisons] = useState([]);
  const [totalSteps, setTotalSteps] = useState(TOTAL_STEPS);
  const [sessionId, setSessionId] = useState(uuidv4()); 
  const [userId, setUserId] = useState(uuidv4()); 
  const [continueUrl, setContinueUrl] = useState('');
  const [singleMobilityAid, setSingleMobilityAid] = useState(false);
  const [errors, setErrors] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBreakOverlay, setShowBreakOverlay] = useState(false);
  const { id } = useParams(); 
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    let steps = TOTAL_STEPS; // base number of steps
    setTotalSteps(steps);
  }, []);


  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const confirmationMessage = 'Are you sure you want to leave? Changes may not be saved.';
      event.returnValue = confirmationMessage; // For most browsers
      return confirmationMessage; // For some browsers
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({ width, height });
  
      if (width < 768) { // Assuming 768px is the breakpoint for tablets
        setShowMobileWarning(true);
      }
    };
  
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
  
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  

  const progressValue = (currentStep / totalSteps) * 100;

  const startSurvey = () => {
    setCurrentStep(9); // Start the survey
    setStartTime(new Date());
  };
  
  const [answers, setAnswers] = useState({
    name: '',
    email: '',
    mobilityAid: '',
    sidewalkBarriers: '',
    answeredMobilityAids: [],
    currentStep: 0
  });

  const sendEmail = (recipientEmail, continuationLink) => {
    const templateParams = {
      to_email: recipientEmail,
      continuation_link: continuationLink,
      from_name: 'Your Survey App',  // Customize this as needed
      to_name: answers.name || 'Valued Participant',  // This could be dynamic based on user data
    };
  
    emailjs.send('service_9obqgij', 'template_1j17b1u', templateParams, 'ewWDTiLWBaKzzZWLr')
      .then((response) => {
        console.log('Email successfully sent!', response.status, response.text);
        window.alert(`Email sent to ${recipientEmail}!`); 
      })
      .catch((err) => {
        console.error('Failed to send email. Error: ', err);
        window.alert('Failed to send email. Please try again later.');
      });
  };
  

  const onEmailLink = () => {
    if (continueUrl && answers.email) {
        sendEmail(answers.email, continueUrl);
    } else {
        console.error('Email or continueUrl is missing');
    }
  };

  const findFirstIncompleteStep = (imageSelections, currentStep) => {
    const startIndex = Math.floor((currentStep - IMAGE_STEP) / STEPS_PER_GROUP);
    for (let groupIndex = startIndex; groupIndex < GROUP_ORDER.length; groupIndex++) {
      const groupKey = GROUP_ORDER[groupIndex];
      const selections = imageSelections[groupKey];
      
      if (!selections) return IMAGE_STEP + groupIndex * STEPS_PER_GROUP;
  
      const { [`${groupKey}A`]: groupA, [`${groupKey}B`]: groupB } = selections;
      
      if (!groupA || groupA.length < 2) return IMAGE_STEP + groupIndex * STEPS_PER_GROUP + 1;
      if (!groupB || groupB.length < 2) return IMAGE_STEP + groupIndex * STEPS_PER_GROUP + 2;
    }
    
    return TOTAL_STEPS; 
  };

  // for resuming the survey
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const docRef = doc(firestore, "surveyAnswers", id);
        const docSnap = await getDoc(docRef);
        console.log("Fetching data...");

        if (docSnap.exists()) {
          console.log(".....");
          const data = docSnap.data();
          setUserId(data.userId);
          setSessionId(data.sessionId);
          setCurrentStep(data.currentStep);
          // setAnswers(data);
          // set the current mobility aid
          if (data.answeredMobilityAids && data.answeredMobilityAids.length > 0) {
            const remainingOptions = data.mobilityAidOptions.mobilityAidOptions.filter(option => !data.answeredMobilityAids.includes(option));
            handleMobilityAidChange(remainingOptions[0]);
          }

          if(data.isGroupContinue) { 
            const continueGroupStep = findFirstIncompleteStep(data.imageSelections || {}, data.currentStep);
            if(continueGroupStep === TOTAL_STEPS) {
              setCurrentStep(MOBILITYAID_STEP);
            } else {
              setCurrentStep(data.currentStep);
            }
          } else {
            setCurrentStep(MOBILITYAID_STEP);
          }
          
          setImageSelections(data.imageSelections || generateInitialImageSelections());
          setImageComparisons(data.imageComparisons || []);
          setAnswers({ ...data, isGroupContinue: false });
        } else {
          console.log("No such document!");
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const currentGroup = groups.find(group => 
      currentStep === group.steps.comparisonA || currentStep === group.steps.comparisonB);
  
    if (currentGroup) {
      const subGroupKey = currentStep === currentGroup.steps.comparisonA ? 'A' : 'B';
      const subGroupImages = imageSelections[currentGroup.selectionKey][`${currentGroup.selectionKey}${subGroupKey}`];
      
      if (subGroupImages.length < 2) {
        const nextStep = currentStep === currentGroup.steps.comparisonA ? currentGroup.steps.comparisonB : currentGroup.steps.selection + 3; // Assumes the next selection step or the next group's first step
        setCurrentStep(nextStep);
      }
    }
  }, [currentStep, imageSelections]);
  

  useEffect(() => {
    if(answers.mobilityAidOptions && answers.answeredMobilityAids &&
      answers.mobilityAidOptions.length === answers.answeredMobilityAids.length) {
      setCurrentStep(TOTAL_STEPS); 
    }
  }, [answers]);


  // for showing the overlay to stop
  useEffect(() => {
    const groupIndex = Math.floor((currentStep - IMAGE_STEP) / STEPS_PER_GROUP);
    if (groupIndex > 0 && groupIndex % 3 === 0 && (currentStep - IMAGE_STEP) % STEPS_PER_GROUP === 0 && groupIndex < 9) {
      setShowBreakOverlay(true);
    }
  }, [currentStep]);

  const closeBreakOverlay = () => {
    setShowBreakOverlay(false);
  };

  const calculateCompletedGroups = Math.floor((currentStep - IMAGE_STEP) / STEPS_PER_GROUP);


const nextStep = () => {
  if (validateCurrentStep()) {
    if (currentStep < TOTAL_STEPS) {
      logData();
      setCurrentStep(currentStep + 1);
    } 
  }
};

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      return true; // No validation needed for the intro step
    }

    let isValid = true;
    let newErrors = {};

    switch (currentStep) {
      case 2:
        if (!answers.name) {
          isValid = false;
          newErrors.name = 'Please fill this in';
        }
        break;
      case 3:
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
      case 4:
        if (!answers.mobilityAidOptions || answers.mobilityAidOptions.mobilityAidOptions.length === 0) {
          isValid = false;
          newErrors.mobilityAidOptions = 'Please select at least one option';
        }
        break;
      case 5:
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
    // log the data
    logData();
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      imageComparisons: imageComparisons,
      imageSelections: imageSelections
    }));
};

const groups = shuffledGroupOrder.map((key, index) => {
  const baseIndex = IMAGE_STEP + (STEPS_PER_GROUP * index);
  return {
    data: groupedCropsData[key],
    selectionKey: key,
    comparisons: [`${key}A`, `${key}B`],
    steps: {
      selection: baseIndex,
      comparisonA: baseIndex + 1,
      comparisonB: baseIndex + 2
    }
  };
});

// Function to handle image selection completion
const handleSelectionComplete = (group, selection) => {
  setImageSelections(prevSelections => ({
    ...prevSelections,
    [group.selectionKey]: {
      [`${group.selectionKey}A`]: selection.groupAImages,
      [`${group.selectionKey}B`]: selection.groupBImages
    }
  }));
  setCurrentStep(currentStep + 1);  // Move to the first comparison step
  //log the data
  logData();
  setAnswers(prevAnswers => ({
    ...prevAnswers,
    imageComparisons: imageComparisons,
    imageSelections: imageSelections
  }));
};

// Function to render Image Selection or Comparison based on the current step
const renderImageStep = (group, step) => {
  const index = step - group.startStep;
  if (index === 0) {
    // Image selection step
    return <ImageSelection
      stepNumber={step-3}
      answers={answers}
      nextStep={nextStep}
      previousStep={previousStep}
      images={group.data}
      onComplete={(selection) => handleSelectionComplete(group, selection)}
      errors={errors}
      currentStep={currentStep}
      IMAGE_STEP={IMAGE_STEP}
    />;
  } else {
    // Image comparison steps
    const comparisonKey = group.comparisons[index - 1];
    return <ImageComparison
      key={comparisonKey}
      stepNumber={step-3}
      answers={answers}
      nextStep={nextStep}
      previousStep={() => setCurrentStep(step - 1)}
      images={imageSelections[group.selectionKey][comparisonKey]}
      onSelectionComplete={onSelectionComplete}
      comparisonContext={`${comparisonKey}compare`}
      onComplete={() => index === group.comparisons.length ? setCurrentStep(step + 1) : setCurrentStep(step + 1)}
      errors={errors}
    />;
  }
};


const renderCurrentStep = () => {
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    group.startStep = IMAGE_STEP + i * 3;  //each group uses 3 steps (1 selection + 2 comparisons)
    if (currentStep >= group.startStep && currentStep < group.startStep + 3) {
      return renderImageStep(group, currentStep);
    }
  }

  switch (currentStep) {
    case 1:
      return <IntroPage 
              nextStep={nextStep}
              />;
    case 2:
      return <Question1 
              stepNumber={currentStep-1} 
              nextStep={nextStep} 
              handleChange={handleChange}
              errors= {errors} 
              />;
    case 3:
      return <Question2 
              stepNumber={currentStep-1} 
              nextStep={nextStep} 
              previousStep={previousStep} 
              handleChange={handleChange}
              errors= {errors} 
              />;
    case 4:
      return <Question3 
              stepNumber={currentStep-1} 
              nextStep={nextStep} 
              previousStep={previousStep} 
              updateAnswers={updateAnswers}
              setSingleMobilityAid={setSingleMobilityAid} 
              errors= {errors}/>;
    case 5:
      if (singleMobilityAid) {
        nextStep(); // Skip here if only one mobility aid option
        return null; 
      }
      return <Question4
              stepNumber={currentStep-1}
              nextStep={nextStep}
              previousStep={previousStep}
              answers={answers}
              handleChange={handleChange}
              errors= {errors}
            />;
    case 6:
      return <Question5 
              stepNumber={currentStep-1} 
              nextStep={nextStep} 
              previousStep={previousStep} 
              answers={answers} 
              handleChange={handleChange}
              singleMobilityAid={singleMobilityAid} 
              errors= {errors}// Pass the skip state
             />;
   case 7:
      return <InstructionsPage1 
              nextStep={nextStep} 
              previousStep={previousStep} 
              answers={answers}
             />;
   case 8:
      return <InstructionsPage2
              nextStep={nextStep} 
              previousStep={previousStep}
             />;
    case 36:
      return <RankQuestion
              stepNumber={currentStep-3}
              nextStep={nextStep}
              previousStep={previousStep}
              answers={answers}
              updateAnswers={updateAnswers}
              errors= {errors}
            />
    
    case 37: 
      if (answers.mobilityAidOptions.mobilityAidOptions.length === 1 ||  // if only one mobility aid option
        (answers.answeredMobilityAids && answers.answeredMobilityAids.length > 0) // if answered mobility aids exist
      ) {
        const remainingOptions = answers.mobilityAidOptions.mobilityAidOptions.filter(option => !answers.answeredMobilityAids.includes(option));
        
        if(remainingOptions.length === 1) {
          setCurrentStep(38);
          setContinueUrl('');
          return null;
        }
      } 
      return <ContinuePage 
              answers={answers}
              handleMobilityAidChange={handleMobilityAidChange}
              previousStep={previousStep} 
              yesStep={() => {setCurrentStep(5);}}
              nextStep={nextStep}
              setContinueUrl={setContinueUrl}
              logData={logMobilityAidData}
              />;
    case 38:
      return <EndingPage 
              previousStep={previousStep} 
              continueUrl={continueUrl} 
              onSubmit={handleSubmit}
              onEmailLink={onEmailLink} />;
    default: return <WelcomePage onStart={startSurvey} />;
  }
};

useEffect(() => {
}, [currentStep]);

const handleSubmit = async () => {
  const ipAddress = await getIpAddress();

  if (!ipAddress) {
    console.error('Failed to fetch IP address');
    return;
  }
   
  if (validateCurrentStep()) {
    const endTime = Date.now(); 
    const duration = (endTime - startTime)/1000; // in seconds

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }

  let logType = 'final'; // form is submitted 
  answers.answeredMobilityAids.push(answers.mobilityAid);
 

  try {
    const docRef = await addDoc(collection(firestore, "surveyAnswers"), {
      ...answers, 
      sessionId, 
      userId, 
      currentStep,
      ipAddress,
      logType,
      imageSelections,
      imageComparisons,
      timestamp: serverTimestamp(), 
      duration,
    });
    console.log("Document written with ID: ", docRef.id);
    console.log("Survey completed in ", duration, " seconds");
    window.alert('Your response has been recored successfully!');
  } catch (e) {
    console.error("Error adding document: ", e);
    window.alert('Failed to record your response. Please try again later.');
    }
  }
};

const logData = async () => {
  let logType = 'temp'; 
  const endTime = Date.now(); // Capture the end time
  const duration = endTime ? (endTime - startTime)/1000 : 0;
  const ipAddress = await getIpAddress();

  if (!ipAddress) {
    console.error('Failed to fetch IP address');
    return;
  }

  try {
    const docRef = await addDoc(collection(firestore, "surveyAnswers"), {
        ...answers,  
        sessionId, 
        userId, 
        currentStep,
        ipAddress,
        logType,
        imageSelections,
        imageComparisons,
        screenSize,
        timestamp: serverTimestamp(),
        duration
      });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

const logMobilityAidData = async () => {
  let logType = 'CompletedOneMobilityAid'; 
  answers.answeredMobilityAids.push(answers.mobilityAid);
  
  const endTime = Date.now(); // Capture the end time
  const duration = endTime ? (endTime - startTime)/1000 : 0;

  const ipAddress = await getIpAddress();

  if (!ipAddress) {
    console.error('Failed to fetch IP address');
    return;
  }

  try {
    const docRef = await addDoc(collection(firestore, "surveyAnswers"), {
        ...answers,  
        sessionId, 
        userId, 
        currentStep,
        ipAddress,
        logType,
        imageSelections,
        imageComparisons,
        screenSize,
        timestamp: serverTimestamp(),
        duration
      });
    console.log("Document written with ID: ", docRef.id);
    console.log("Session completed in ", duration, " seconds");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

if (loading) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      <div className="mt-4 text-2xl font-bold text-blue-500">Loading...</div>
    </div>
  );
}

return (
  <div>
     {showMobileWarning && <MobileWarningModal onClose={() => setShowMobileWarning(false)} />}
    {currentStep > 0 && (
      <div style={{ position: 'fixed', top: 0, width: '100%', left:-4}}>
        <Progress value={progressValue} color="teal" size="sm"/>
      </div>
    )}
    {renderCurrentStep()}
    {showBreakOverlay && (
        <BreakPage 
          currentStep={currentStep}
          onContinue={closeBreakOverlay} 
          answers={answers}
          completedGroups={calculateCompletedGroups}
          onEmailLink={onEmailLink}
        />
      )}
  </div>
);

};

export default SurveyComponent;