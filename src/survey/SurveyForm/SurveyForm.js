// SurveyForm.js
import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  serverTimestamp,
  getDoc,
  setDoc
} from "firebase/firestore";
import { Progress } from "@material-tailwind/react";
import Question1 from "../Questions/Question1";
import Question2 from "../Questions/Question2";
import Question3 from "../Questions/Question3";
import Question4 from "../Questions/Question4";
import QuestionSurfaceProblem from "../Questions/QuestionSurfaceProblem";
import QuestionObstacle from "../Questions/QuestionObstacle";
import ImageSelection from "../ImageSelection/ImageSelection";
import ImageComparison from "../ImageComaprison/ImageComparison";
import WelcomePage from "../StartEndPages/WelcomePage";
import EndingPage from "../StartEndPages/EndingPage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5siaFnxhtfEbw1FaKuX8GkEQyN5rb6a0",
  authDomain: "sidewalk-survey-f7904.firebaseapp.com",
  projectId: "sidewalk-survey-f7904",
  storageBucket: "sidewalk-survey-f7904.appspot.com",
  messagingSenderId: "116996397844",
  appId: "1:116996397844:web:10d973cb146b348c040001",
  measurementId: "G-3MC54XMWQD",
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const formId = 0;

const SurveyComponent = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [surfaceSelection, setSurfaceSelection] = useState({
    surfaceA: [],
    surfaceB: [],
  });
  const [obstacleSelection, setObstacleSelection] = useState({
    obstacleA: [],
    obstacleB: [],
  });
  const [noCurbSelection, setNoCurbSelection] = useState({
    noCurbA: [],
    noCurbB: [],
  });
  const [imageComparisons, setImageComparisons] = useState([]);
  const [totalSteps, setTotalSteps] = useState(15);
  const [mostRecentStepBackward, setMostRecentStepBackward] = useState(false);

  useEffect(
    () => {
      let steps = 13; // base number of steps
      setTotalSteps(steps);
    },
    [
      /* dependencies that might change the number of steps, e.g., answers */
    ]
  );

  const progressValue = (currentStep / totalSteps) * 100;

  const startSurvey = () => {
    setCurrentStep(1); // Start the survey
  };

  const [answers, setAnswers] = useState({
    name: "",
    email: "",
    mobilityAid: "",
    sidewalkBarriers: "",
    surfaceProblemOccur: "",
    obstacleOccur: "",
  });

  const surfaceCropsData = [
    {
      City: "seattle",
      LabelID: 111698,
      LabelTypeID: 4,
      PanoID: "8UyaKl2zh2BE6ZwRTCxkyA",
      Heading: 227.6875,
      Pitch: -35,
      Zoom: 1,
      FOV: 90,
      CanvasX: 326,
      CanvasY: 216,
    },
    {
      City: "seattle",
      LabelID: 205972,
      LabelTypeID: 4,
      PanoID: "EwjRCeSEVWFQGRnqsXM_DA",
      Heading: 205.7209777832,
      Pitch: -22.125,
      Zoom: 1,
      FOV: 90,
      CanvasX: 486,
      CanvasY: 192,
    },

    {
      City: "seattle",
      LabelID: 194344,
      LabelTypeID: 4,
      PanoID: "JWaaynPQwfIX3QmAPpA8gg",
      Heading: 210.3660736084,
      Pitch: -6.4642858505,
      Zoom: 2,
      FOV: 45,
      CanvasX: 536,
      CanvasY: 242,
    },
    {
      City: "seattle",
      LabelID: 208040,
      LabelTypeID: 4,
      PanoID: "YDaym1DloFZnBdGoaDUyDQ",
      Heading: 311.375,
      Pitch: -35,
      Zoom: 1,
      FOV: 90,
      CanvasX: 448,
      CanvasY: 122,
    },

    {
      City: "seattle",
      LabelID: 107450,
      LabelTypeID: 4,
      PanoID: "ibbpox2xm6Y8ZhdcWYTMHw",
      Heading: 220.9821472168,
      Pitch: -20.0892848969,
      Zoom: 2,
      FOV: 45,
      CanvasX: 463,
      CanvasY: 172,
    },
  ];

  const obstacleCropsData = [
    {
      City: "seattle",
      LabelID: 169928,
      LabelTypeID: 3,
      PanoID: "o0Uq8GMm_BMCOxaKE1FYoQ",
      Heading: 161.5892791748,
      Pitch: -35,
      Zoom: 1,
      FOV: 90,
      CanvasX: 216,
      CanvasY: 146,
    },
    {
      City: "seattle",
      LabelID: 139731,
      LabelTypeID: 3,
      PanoID: "tE85ocVCFwcoXIbDpQRVDQ",
      Heading: 7.8656058311,
      Pitch: -35,
      Zoom: 1,
      FOV: 90,
      CanvasX: 318,
      CanvasY: 203,
    },
    {
      City: "seattle",
      LabelID: 100492,
      LabelTypeID: 3,
      PanoID: "Ml-OCQTY1s5k7b6DSxHZ-A",
      Heading: 160.5535736084,
      Pitch: -17.0982151031,
      Zoom: 2,
      FOV: 45,
      CanvasX: 193,
      CanvasY: 190,
    },
    {
      City: "seattle",
      LabelID: 191782,
      LabelTypeID: 3,
      PanoID: "tSDTx7aNmeGUosgKkWJC8Q",
      Heading: 65.796875,
      Pitch: -3.609375,
      Zoom: 3,
      FOV: 23,
      CanvasX: 361,
      CanvasY: 328,
    },
    {
      City: "seattle",
      LabelID: 214878,
      LabelTypeID: 3,
      PanoID: "6aS515xppGK6FIZ8i5FxnQ",
      Heading: 133.0758972168,
      Pitch: -14.5647325516,
      Zoom: 1,
      FOV: 90,
      CanvasX: 300,
      CanvasY: 291,
    },
  ];

  // for handling the case where the image group is empty
  useEffect(() => {
    if (currentStep === 6 && surfaceSelection.surfaceA.length < 1) {
      setCurrentStep(7); // Skip Surface ImageComparison A if no images
    } else if (currentStep === 7 && surfaceSelection.surfaceB.length < 1) {
      setCurrentStep(8); // Skip Surface ImageComparison B if no images
    }
    // Repeat the pattern for other selections
    else if (currentStep === 9 && obstacleSelection.obstacleA.length < 1) {
      setCurrentStep(10); // Skip Obstacle ImageComparison A if no images
    } else if (currentStep === 10 && obstacleSelection.obstacleB.length < 1) {
      setCurrentStep(11); // Skip Obstacle ImageComparison B if no images
    }
  }, [currentStep, surfaceSelection, obstacleSelection, noCurbSelection]);

  const handleSurfaceSelectionComplete = (selection) => {
    setSurfaceSelection({
      surfaceA: selection.groupAImages,
      surfaceB: selection.groupBImages,
    });
    setCurrentStep(currentStep + 1);
  };

  const handleObstacleSelectionComplete = (selection) => {
    setObstacleSelection({
      obstacleA: selection.groupAImages,
      obstacleB: selection.groupBImages,
    });
    setCurrentStep(currentStep + 1);
  };

  const nextStep = () => {
    if (currentStep < 13) {
      setCurrentStep(currentStep + 1);
      setMostRecentStepBackward(false);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setMostRecentStepBackward(true);
    }
  };

  const updateAnswers = (key, value) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [key]: value }));
  };

  const handleChange = (input) => (e) => {
    setAnswers({ ...answers, [input]: e.target.value });
  };

  const onSelectionComplete = (data) => {
    setImageComparisons((prev) => [...prev, { ...data }]);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      // Questions 1-4
      case 1:
        return (
          <Question1
            stepNumber={currentStep}
            nextStep={nextStep}
            handleChange={handleChange}
          />
        );
      case 2:
        return (
          <Question2
            stepNumber={currentStep}
            nextStep={nextStep}
            previousStep={previousStep}
            handleChange={handleChange}
          />
        );
      case 3:
        return (
          <Question3
            stepNumber={currentStep}
            nextStep={nextStep}
            previousStep={previousStep}
            updateAnswers={updateAnswers}
          />
        );
      case 4:
        return (
          <Question4
            stepNumber={currentStep}
            nextStep={nextStep}
            previousStep={previousStep}
            answers={answers}
            handleChange={handleChange}
          />
        );
      case 5: // After original questions, start with surface ImageSelection
        return (
          <ImageSelection
            stepNumber={currentStep}
            nextStep={nextStep}
            previousStep={previousStep}
            images={surfaceCropsData}
            onComplete={handleSurfaceSelectionComplete}
          />
        );
      case 6: // Surface ImageComparison A
        return (
          <ImageComparison
            key="GroupA"
            stepNumber={currentStep}
            images={surfaceSelection.surfaceA}
            nextStep={nextStep}
            previousStep={previousStep}
            onSelectionComplete={onSelectionComplete}
            comparisonContext="surfaceAcompare"
            onComplete={() => setCurrentStep(7)}
          />
        );
      case 7: // Surface ImageComparison B
        return (
          <ImageComparison
            key="GroupB"
            stepNumber={currentStep}
            nextStep={nextStep}
            previousStep={previousStep}
            images={surfaceSelection.surfaceB}
            onSelectionComplete={onSelectionComplete}
            comparisonContext="surfaceBcompare"
            onComplete={() => setCurrentStep(8)}
          />
        );
      case 8:
        return (
          <ImageSelection
            stepNumber={currentStep}
            nextStep={nextStep}
            previousStep={previousStep}
            images={obstacleCropsData}
            onComplete={handleObstacleSelectionComplete}
          />
        );
      case 9:
        return (
          <ImageComparison
            key="GroupC"
            stepNumber={currentStep}
            nextStep={nextStep}
            previousStep={previousStep}
            images={obstacleSelection.obstacleA}
            onSelectionComplete={onSelectionComplete}
            comparisonContext="obstacleAcompare"
            onComplete={() => setCurrentStep(10)}
          />
        );
      case 10:
        return (
          <ImageComparison
            key="GroupD"
            stepNumber={currentStep}
            nextStep={nextStep}
            previousStep={previousStep}
            images={obstacleSelection.obstacleB}
            onSelectionComplete={onSelectionComplete}
            comparisonContext="obstacleBcompare"
            onComplete={() => setCurrentStep(11)}
          />
        );
      case 11:
        return (
          <QuestionSurfaceProblem
            stepNumber={currentStep}
            nextStep={nextStep}
            previousStep={previousStep}
            updateAnswers={updateAnswers}
          />
        );
      case 12:
        return (
          <QuestionObstacle
            stepNumber={currentStep}
            nextStep={nextStep}
            previousStep={previousStep}
            updateAnswers={updateAnswers}
          />
        );
      case 13:
        return (
          <EndingPage previousStep={previousStep} onSubmit={handleSubmit} />
        );
      default:
        return <WelcomePage onStart={startSurvey} />;
    }
  };

  useEffect(() => {
    const updateStatusAsync = async () => {
      if (currentStep === 3 && mostRecentStepBackward === false) {
        await updateDataFromDB();
        localStorage.setItem("email", answers.email);
      } 
      else if (currentStep > 3) {
        await handleSubmit();
      }
    }

    updateStatusAsync();
  }, [currentStep]);

  useEffect(() => {
    const updateStateWithLocalStorageEmail = async () => {
      const email = localStorage.getItem('email');
      if (email) {
        answers.email = email;
        await updateDataFromDB();
        localStorage.clear();
      }
    }
    updateStateWithLocalStorageEmail()

  }, [])


  const readDataIntoFrontEnd = async (data) => {
    setAnswers({
      name: data.name,
      email: data.email,
      mobilityAid: data.mobilityAid,
      sidewalkBarriers: data.sidewalkBarriers,
      surfaceProblemOccur: data.surfaceProblemOccur,
      obstacleOccur: data.obstacleOccur
    })
    setSurfaceSelection(data.surfaceSelection);
    setObstacleSelection(data.obstacleSelection);
    setNoCurbSelection(data.noCurbSelection);
    setImageComparisons(data.imageComparisons);
    setCurrentStep(data.currentStep);
  }

  const updateDataFromDB = async () => {
    try  {
      const docRef = doc(firestore, 'surveyAnswers', answers.email + "-" + formId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('Document exists:', docSnap.id, ' => ', docSnap.data());
        readDataIntoFrontEnd(docSnap.data());
      } else {
        console.log('No such document!');
      }

    } catch (e) {
      console.log(e)
    }
  }

  const handleSubmit = async () => {
    try {
      const collectionRef = collection(firestore, 'surveyAnswers');
      const docRef = doc(collectionRef, answers.email + '-' + formId);
      await setDoc(docRef, {
        ...answers,
        surfaceSelection,
        obstacleSelection,
        noCurbSelection,
        imageComparisons,
        timestamp: serverTimestamp(),
        currentStep: currentStep,
      });
      console.log("Document modified with ID: ", docRef.id);
    } catch (e) {
      console.error("Error modifying document: ", e);
    }
  };

  return (
    <div>
      {currentStep > 0 && (
        <div style={{ position: "fixed", top: 0, width: "100%", left: -4 }}>
          <Progress value={progressValue} color="teal" size="sm" />
        </div>
      )}
      {renderCurrentStep()}
    </div>
  );
};

export default SurveyComponent;
