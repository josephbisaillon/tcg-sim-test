import React from 'react';
import './Card.css';
import { CardType, PokemonType } from '../../types/game';
import { CardSize, CardVariant } from './Card';

export interface CardPlaceholderProps {
    /**
     * Zone or variant the placeholder is for
     * @default 'default'
     */
    variant?: CardVariant;

    /**
     * Card type the placeholder represents
     * @default CardType.POKEMON
     */
    cardType?: CardType;

    /**
     * Pokémon type for the placeholder (for energy cards)
     * @default PokemonType.COLORLESS
     */
    pokemonType?: PokemonType;

    /**
     * Size of the placeholder
     * @default 'md'
     */
    size?: CardSize;

    /**
     * Whether the placeholder is for a loading state
     * @default false
     */
    isLoading?: boolean;

    /**
     * Whether the placeholder is for an error state
     * @default false
     */
    isError?: boolean;

    /**
     * Text to display in the placeholder
     */
    text?: string;

    /**
     * Additional CSS class names
     */
    className?: string;

    /**
     * Click handler
     */
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * CardPlaceholder component for displaying placeholders for cards in different zones
 */
export const CardPlaceholder: React.FC<CardPlaceholderProps> = ({
    variant = 'default',
    cardType = CardType.POKEMON,
    pokemonType = PokemonType.COLORLESS,
    size = 'md',
    isLoading = false,
    isError = false,
    text,
    className = '',
    onClick,
}) => {
    // Combine classes
    const baseClasses = 'card card-placeholder';
    const variantClasses = `card-variant-${variant}`;
    const sizeClasses = `card-size-${size}`;
    const typeClasses = `card-type-${pokemonType.toLowerCase()}`;
    const cardTypeClasses = `card-cardtype-${cardType.toLowerCase()}`;
    const stateClasses = [
        isLoading ? 'card-placeholder-loading' : '',
        isError ? 'card-placeholder-error' : '',
    ].filter(Boolean).join(' ');

    const combinedClasses = [
        baseClasses,
        variantClasses,
        sizeClasses,
        typeClasses,
        cardTypeClasses,
        stateClasses,
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={combinedClasses}
            onClick={onClick}
            role="button"
            tabIndex={onClick ? 0 : -1}
            aria-label={`${variant} ${cardType} placeholder${isLoading ? ', loading' : ''}${isError ? ', error' : ''}`}
        >
            <div className="card-placeholder-content">
                {isLoading && (
                    <div className="card-placeholder-loading-indicator">
                        <div className="card-placeholder-spinner" />
                    </div>
                )}

                {isError && (
                    <div className="card-placeholder-error-indicator">
                        <span className="card-placeholder-error-icon">!</span>
                    </div>
                )}

                {!isLoading && !isError && (
                    <>
                        {/* Zone-specific placeholder content */}
                        {variant === 'deck' && (
                            <div className="card-placeholder-deck">
                                <div className="card-placeholder-deck-icon" />
                            </div>
                        )}

                        {variant === 'discard' && (
                            <div className="card-placeholder-discard">
                                <div className="card-placeholder-discard-icon" />
                            </div>
                        )}

                        {variant === 'prize' && (
                            <div className="card-placeholder-prize">
                                <div className="card-placeholder-prize-icon" />
                            </div>
                        )}

                        {variant === 'active' && (
                            <div className="card-placeholder-active">
                                <div className="card-placeholder-active-icon" />
                            </div>
                        )}

                        {variant === 'bench' && (
                            <div className="card-placeholder-bench">
                                <div className="card-placeholder-bench-icon" />
                            </div>
                        )}

                        {variant === 'hand' && (
                            <div className="card-placeholder-hand">
                                <div className="card-placeholder-hand-icon" />
                            </div>
                        )}

                        {variant === 'stadium' && (
                            <div className="card-placeholder-stadium">
                                <div className="card-placeholder-stadium-icon" />
                            </div>
                        )}

                        {/* Default placeholder for other variants */}
                        {(variant === 'default' ||
                            variant === 'attached' ||
                            variant === 'evolving' ||
                            variant === 'tool' ||
                            variant === 'lost' ||
                            variant === 'preview') && (
                                <div className="card-placeholder-default">
                                    {cardType === CardType.POKEMON && (
                                        <div className="card-placeholder-pokemon" />
                                    )}

                                    {cardType === CardType.ENERGY && (
                                        <div className={`card-placeholder-energy type-${pokemonType.toLowerCase()}`} />
                                    )}

                                    {(cardType === CardType.TRAINER ||
                                        cardType === CardType.SUPPORTER ||
                                        cardType === CardType.ITEM ||
                                        cardType === CardType.STADIUM ||
                                        cardType === CardType.TOOL) && (
                                            <div className="card-placeholder-trainer" />
                                        )}
                                </div>
                            )}
                    </>
                )}

                {/* Text label if provided */}
                {text && (
                    <div className="card-placeholder-text">{text}</div>
                )}
            </div>
        </div>
    );
};

export default CardPlaceholder;
