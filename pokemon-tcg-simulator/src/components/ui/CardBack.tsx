import React from 'react';
import './Card.css';

export interface CardBackProps {
    /**
     * URL to the card back image
     * @default '/assets/cardback.png'
     */
    backImageUrl?: string;

    /**
     * Card generation/era for visual styling
     * @default 'swsh'
     */
    generation?: string;

    /**
     * Whether the card back is loading
     */
    isLoading?: boolean;

    /**
     * Whether there was an error loading the card back image
     */
    hasError?: boolean;

    /**
     * CSS class name
     */
    className?: string;
}

/**
 * CardBack component for rendering the back face of a card
 */
export const CardBack: React.FC<CardBackProps> = ({
    backImageUrl = '/assets/cardback.png',
    generation = 'swsh',
    isLoading = false,
    hasError = false,
    className = '',
}) => {
    // Handle image loading state
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [imageError, setImageError] = React.useState(hasError);

    // Handle image load event
    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    // Handle image error event
    const handleImageError = () => {
        setImageError(true);
    };

    // Combine classes
    const combinedClasses = [
        'card-back',
        `card-back-${generation}`,
        isLoading ? 'card-back-loading' : '',
        imageError ? 'card-back-error' : '',
        !imageLoaded && !imageError ? 'card-back-loading' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={combinedClasses}
            style={{
                backgroundImage: imageLoaded && !imageError ? `url(${backImageUrl})` : 'none',
            }}
        >
            {/* Hidden image for preloading */}
            <img
                src={backImageUrl}
                alt="Card Back"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: 'none' }}
            />

            {/* Default card back if no image or error */}
            {(!imageLoaded || imageError) && (
                <div className="card-back-default">
                    <div className="card-back-logo" />
                    <div className="card-back-pattern" />
                </div>
            )}

            {/* Loading indicator */}
            {isLoading && !imageLoaded && !imageError && (
                <div className="card-loading-indicator">
                    <div className="card-loading-spinner" />
                </div>
            )}

            {/* Error indicator */}
            {imageError && (
                <div className="card-error-indicator">
                    <span className="card-error-icon">!</span>
                </div>
            )}
        </div>
    );
};

export default CardBack;
