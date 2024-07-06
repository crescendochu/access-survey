import React, { useState, useEffect, useRef } from 'react';
import PageNavigations from '../../components/PageNavigations';
import ResponseButtons from '../../components/ResponseButtons';
import ImageComponent from '../../components/ImageComponent';
import './ImageComparison.css';

const ImageComparison = ({ stepNumber, answers, nextStep, previousStep, images, onSelectionComplete, comparisonContext, onComplete }) => {
    const [currentPair, setCurrentPair] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [history, setHistory] = useState([]); 
    const [historyIndex, setHistoryIndex] = useState(-1); 
    const [maxComparisons, setMaxComparisons] = useState(0);
    const [hoverButton, setHoverButton] = useState(null);

    const mobilityAid = answers.mobilityAid.toLowerCase();
    
    const leftButtonRef = useRef(null);
    const rightButtonRef = useRef(null);
    const equalButtonRef = useRef(null);

    useEffect(() => {
        const n = images.length;
        const calculatedComparisons = (n * (n - 1)) / 2;
        setMaxComparisons(calculatedComparisons);
        displayImages();
    }, [images]);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'ArrowLeft') {
                selectLeftImage();
            } else if (event.key === 'ArrowRight') {
                selectRightImage();
            } else if (event.key === 'ArrowDown') {
                recordEqualSelection();
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [currentPair]);

    const handleMouseEnter = (button) => {
        setHoverButton(button);
    };

    const handleMouseLeave = () => {
        setHoverButton(null);
    };

    const getRandomImagePair = () => {
        if (!images || images.length < 2) {
            return [];
        }
        let attempts = 0;
        let pair;
        do {
            pair = [images[Math.floor(Math.random() * images.length)], images[Math.floor(Math.random() * images.length)]];
            attempts++;
            if (attempts > 100) {
                break;
            }
        } while (
            pair[0].LabelID === pair[1].LabelID || 
            history.some(h => 
                (h[0].LabelID === pair[0].LabelID && h[1].LabelID === pair[1].LabelID) || 
                (h[0].LabelID === pair[1].LabelID && h[1].LabelID === pair[0].LabelID))
        );
    
        return pair;
    };

    const renderComparisonDots = () => {
        let dots = [];
        for (let i = 0; i < maxComparisons; i++) {
            dots.push(
                <span
                    key={i}
                    style={{
                        height: '8px',
                        width: '8px',
                        borderRadius: '50%',
                        margin: '4px',
                        backgroundColor: i < historyIndex ? '#0d9488' : '#D8DEE9',
                    }}
                ></span>
            );
        }
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
                {dots}
            </div>
        );
    };
    
    const displayImages = () => {
        setLoading(true);
        let nextPair;
        if (historyIndex + 1 < history.length) {
            nextPair = history[historyIndex + 1];
            setHistoryIndex(historyIndex + 1);
        } else {
            nextPair = getRandomImagePair();
            if (nextPair.length > 0) {
                const newHistory = [...history, nextPair];
                setHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);
            }
        }
        setCurrentPair(nextPair);
        setLoading(false);
    };

    const updateSelectionAndDisplayNext = (selectedImage, comparisonResult = {}) => {
        setSelectedImage(selectedImage);
        onSelectionComplete({ ...comparisonResult, comparisonContext });
        if (historyIndex + 1 >= maxComparisons) {
            onComplete();
        } else {
            displayImages();
        }
    };

    const selectImage = (index) => {
        const selected = currentPair[index - 1];
        updateSelectionAndDisplayNext(selected, {
            image1LabelID: currentPair[0].LabelID,
            image1City: currentPair[0].City, 
            image2LabelID: currentPair[1].LabelID,
            image2City: currentPair[1].City,
            selectedImageLabelID: selected.LabelID, 
            selectedImageCity: selected.City,
        });
    };

    const selectLeftImage = () => {
        if (currentPair.length === 2) {
            selectImage(1);
        }
    };

    const selectRightImage = () => {
        if (currentPair.length === 2) {
            selectImage(2);
        }
    };

    const recordEqualSelection = () => {
        if (currentPair.length === 2) {
            updateSelectionAndDisplayNext(null, {
                image1LabelID: currentPair[0].LabelID,
                image1City: currentPair[0].City, 
                image2LabelID: currentPair[1].LabelID,
                image2City: currentPair[1].City,
                selection: 'equal',
            });
        }
    };

    return (
        <div className="image-comparison-container">
            <div className="image-comparison-content"> 
                <h2>{`${stepNumber}. When using your `}<strong>{mobilityAid}</strong>{`, which one do you feel more confident passing?`}</h2>
                <div className="comparison-twin">
                {currentPair.map((imageData, index) => (
                        <div 
                            className={`comparison-image-wrapper ${hoverButton === (index === 0 ? 'left' : 'right') ? 'border-teal-500 glow-shadow' : ''}`}
                            key={imageData.LabelID}
                            style={{ borderWidth: hoverButton === (index === 0 ? 'left' : 'right') ? '4px' : '4px' }}
                        >
                            <div className="card-style" onClick={() => selectImage(index + 1)}>
                                <ImageComponent cropMetadata={imageData} />
                                {selectedImage && selectedImage.LabelID === imageData.LabelID && (
                                    <div className="overlay-style"></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {renderComparisonDots()}
                <ResponseButtons
                gap="24px"
                disabled={loading} 
                buttons={[
                    {
                    text: 'Left Image',
                    shortcut: '←',
                    onClick: selectLeftImage,
                    onMouseEnter: () => handleMouseEnter('left'),
                    onMouseLeave: handleMouseLeave,
                    buttonRef: leftButtonRef // Updated to pass buttonRef
                    },
                    {
                    text: 'The Same',
                    shortcut: '↓',
                    onClick: recordEqualSelection,
                    onMouseEnter: () => handleMouseEnter('equal'),
                    onMouseLeave: handleMouseLeave,
                    variant: 'outlined',
                    buttonRef: equalButtonRef // Updated to pass buttonRef
                    },
                    {
                    text: 'Right Image',
                    shortcut: '→',
                    onClick: selectRightImage,
                    onMouseEnter: () => handleMouseEnter('right'),
                    onMouseLeave: handleMouseLeave,
                    buttonRef: rightButtonRef // Updated to pass buttonRef
                    },
                ]}
                />

            </div>
            <PageNavigations onPrevious={previousStep} onNext={nextStep} />
            </div>
    );
};

export default ImageComparison;
