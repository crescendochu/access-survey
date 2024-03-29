//ImageSelection.js
import React, { useState, useEffect } from 'react';
import PageNavigations from '../../components/PageNavigations';
import ResponseButtons from '../../components/ResponseButtons';
import ImageComponent from '../../components/ImageComponent';
import './ImageSelection.css';


const ImageSelection = ({ previousStep, nextStep, images, onComplete, stepNumber }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [groupAImages, setGroupAImages] = useState([]);
    const [groupBImages, setGroupBImages] = useState([]);

    useEffect(() => {
        // Check if the user has responded to the last image
        if (currentIndex >= images.length) {
            // Call onComplete with the latest state
            onComplete({ groupAImages, groupBImages });
        }
    }, [currentIndex, groupAImages, groupBImages, images.length, onComplete]);
    
    const handleResponse = (response) => {
        console.log (currentIndex);

        if (currentIndex >= images.length) {
            // Prevent further action if we've already gone through all images
            console.log("All images have been processed.");
            return;
          }
        const updatedGroupA = [...groupAImages];
        const updatedGroupB = [...groupBImages];
        
        // Add image to Group A if response is Yes or Unsure
        if (response === 'yes' || response === 'unsure') {
            updatedGroupA.push(images[currentIndex]);
        }
        // Add image to Group B if response is No or Unsure
        if (response === 'no' || response === 'unsure') {
            updatedGroupB.push(images[currentIndex]);
        }

        // Update state with the new groups
        setGroupAImages(updatedGroupA);
        setGroupBImages(updatedGroupB);

        // Move to the next image or complete the selection
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
    };

    const renderDotsAndNavigation = () => {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                {images.map((_, index) => (
                    <span
                        key={index}
                        style={{
                            height: '8px',
                            width: '8px',
                            borderRadius: '50%',
                            backgroundColor: currentIndex >= index ? '#14b8a6' : '#D8DEE9',
                        }}
                    ></span>
                ))}
            </div>
        );
    };


return (
    <div className="image-selection-container">
        <div className="question-container">
            <div className="image-content">
                <div className="text-center bg-gray-200 p-5 rounded mb-4">
                    <h2 className="question-header"> {`${stepNumber}. When using your current mobility aid, do you feel comfortable passing this?`}</h2>
                </div>
                <div className="image-selection-options">
                {currentIndex < images.length ? (
        <div className="image-wrapper">
            {/* Assuming images[currentIndex] is valid and exists */}
            <ImageComponent cropMetadata={images[currentIndex]} />
        </div>
    ) : (
        // Optionally render a loading indicator, blank state, or nothing at all
        <div>Loading next part of the survey...</div>
    )}
                    {renderDotsAndNavigation()}
                    <ResponseButtons
  gap="12px"
  buttons={[
    { text: 'No', onClick: () => handleResponse('no') },
    { text: 'Unsure', onClick: () => handleResponse('unsure'), variant: 'outlined' },
    { text: 'Yes', onClick: () => handleResponse('yes') }
  ]}
/>
                </div>
            </div>
            <PageNavigations onPrevious={previousStep} onNext={nextStep} />
        </div>
    </div>
  );
};

export default ImageSelection;