import React from 'react';
import { CardType, PokemonType } from '../../types/game';
import './Card.css';

export interface CardFaceProps {
    /**
     * Card name
     */
    name: string;

    /**
     * URL to the card image
     */
    imageUrl?: string;

    /**
     * Card type from game.ts CardType enum
     */
    cardType: CardType;

    /**
     * Pokémon type(s) from game.ts PokemonType enum
     */
    pokemonTypes?: PokemonType[];

    /**
     * HP of the Pokémon card
     * Only applicable for Pokémon cards
     */
    hp?: number;

    /**
     * Whether the card is a special card type
     */
    isGX?: boolean;
    isVSTAR?: boolean;
    isVMAX?: boolean;
    isPrism?: boolean;
    isTagTeam?: boolean;
    isRadiant?: boolean;
    isEX?: boolean;

    /**
     * Whether the card is loading
     */
    isLoading?: boolean;

    /**
     * Whether there was an error loading the card image
     */
    hasError?: boolean;

    /**
     * CSS class name
     */
    className?: string;
}

/**
 * CardFace component for rendering the front face of a card
 */
export const CardFace: React.FC<CardFaceProps> = ({
    name,
    imageUrl,
    cardType,
    pokemonTypes = [],
    hp,
    isGX = false,
    isVSTAR = false,
    isVMAX = false,
    isPrism = false,
    isTagTeam = false,
    isRadiant = false,
    isEX = false,
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

    // Determine the primary type for styling
    const primaryType = pokemonTypes && pokemonTypes.length > 0
        ? pokemonTypes[0]
        : PokemonType.COLORLESS;

    // Combine classes
    const combinedClasses = [
        'card-face',
        `card-type-${primaryType.toLowerCase()}`,
        `card-cardtype-${cardType.toLowerCase()}`,
        isLoading ? 'card-face-loading' : '',
        imageError ? 'card-face-error' : '',
        !imageLoaded && !imageError ? 'card-face-loading' : '',
        className
    ].filter(Boolean).join(' ');

    // Special card indicators
    const specialCardIndicators = [
        isGX ? { type: 'gx', label: 'GX' } : null,
        isVSTAR ? { type: 'vstar', label: 'VSTAR' } : null,
        isVMAX ? { type: 'vmax', label: 'VMAX' } : null,
        isPrism ? { type: 'prism', label: '⭐' } : null,
        isTagTeam ? { type: 'tag-team', label: 'TAG TEAM' } : null,
        isRadiant ? { type: 'radiant', label: 'Radiant' } : null,
        isEX ? { type: 'ex', label: 'EX' } : null,
    ].filter((indicator): indicator is { type: string; label: string } => indicator !== null);

    return (
        <div className={combinedClasses}>
            {/* Card image */}
            {imageUrl && !imageError ? (
                <div
                    className="card-image"
                    style={{
                        backgroundImage: imageLoaded ? `url(${imageUrl})` : 'none',
                        opacity: imageLoaded ? 1 : 0,
                    }}
                >
                    <img
                        src={imageUrl}
                        alt={name}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        style={{ display: 'none' }} // Hidden image for preloading
                    />
                </div>
            ) : (
                <div className="card-image-placeholder">
                    {/* Fallback content when no image or error */}
                    <div className="card-placeholder-header">
                        <span className="card-placeholder-name">{name}</span>
                        {hp && cardType === CardType.POKEMON && (
                            <span className="card-placeholder-hp">{hp} HP</span>
                        )}
                    </div>

                    <div className="card-placeholder-type">
                        {pokemonTypes.map((type, index) => (
                            <div
                                key={`${type}-${index}`}
                                className={`card-placeholder-type-icon type-${type.toLowerCase()}`}
                            />
                        ))}
                    </div>

                    <div className="card-placeholder-body">
                        {cardType === CardType.POKEMON && (
                            <div className="card-placeholder-pokemon-body">
                                {/* Placeholder for Pokémon card content */}
                            </div>
                        )}

                        {cardType === CardType.ENERGY && (
                            <div className={`card-placeholder-energy type-${primaryType.toLowerCase()}`}>
                                {/* Energy symbol */}
                            </div>
                        )}

                        {(cardType === CardType.TRAINER ||
                            cardType === CardType.SUPPORTER ||
                            cardType === CardType.ITEM ||
                            cardType === CardType.STADIUM ||
                            cardType === CardType.TOOL) && (
                                <div className="card-placeholder-trainer-body">
                                    {/* Placeholder for Trainer card content */}
                                </div>
                            )}
                    </div>
                </div>
            )}

            {/* HP indicator for Pokémon cards */}
            {cardType === CardType.POKEMON && hp && (
                <div className="card-hp">{hp} HP</div>
            )}

            {/* Special card indicators */}
            {specialCardIndicators.length > 0 && (
                <div className="card-special-indicators">
                    {specialCardIndicators.map((indicator, index) => (
                        <div
                            key={`indicator-${index}`}
                            className={`card-special-indicator card-${indicator.type}-indicator`}
                        >
                            {indicator.label}
                        </div>
                    ))}
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

            {/* Card name (always visible on placeholder, shown on hover for images) */}
            <div className="card-name">{name}</div>
        </div>
    );
};

export default CardFace;
