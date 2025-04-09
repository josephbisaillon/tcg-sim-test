import React, { useState, useRef, useEffect } from 'react';
import './Card.css';
import { CardType, PokemonType, SpecialCondition } from '../../types/game';
import CardFace from './CardFace';
import CardBack from './CardBack';
import CardAttachment from './CardAttachment';

// Card variants based on their location/state in the game
export type CardVariant =
    | 'default'    // Default state
    | 'active'     // Active Pokémon
    | 'bench'      // Benched Pokémon
    | 'hand'       // Card in hand
    | 'deck'       // Card in deck
    | 'discard'    // Card in discard pile
    | 'prize'      // Prize card
    | 'stadium'    // Stadium card in play
    | 'lost'       // Card in lost zone
    | 'attached'   // Card attached to another card
    | 'evolving'   // Card being played as an evolution
    | 'tool'       // Tool card attached to a Pokémon
    | 'preview';   // Card being previewed/inspected

// Card sizes
export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Card rarity for visual styling
export type CardRarity =
    | 'common'
    | 'uncommon'
    | 'rare'
    | 'holoRare'
    | 'ultraRare'
    | 'secretRare'
    | 'promo';

// Card generation/era for visual styling
export type CardGeneration =
    | 'base'       // Base Set era
    | 'neo'        // Neo era
    | 'ex'         // ex era
    | 'diamond'    // Diamond & Pearl era
    | 'platinum'   // Platinum era
    | 'bw'         // Black & White era
    | 'xy'         // XY era
    | 'sm'         // Sun & Moon era
    | 'swsh'       // Sword & Shield era
    | 'sv';        // Scarlet & Violet era

export interface CardProps {
    /**
     * Card ID for tracking
     */
    id: string;

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
     * @default CardType.POKEMON
     */
    cardType?: CardType;

    /**
     * Pokémon type(s) from game.ts PokemonType enum
     * Only applicable for Pokémon and Energy cards
     */
    pokemonTypes?: PokemonType[];

    /**
     * Card rarity for visual styling
     * @default 'common'
     */
    rarity?: CardRarity;

    /**
     * Card generation/era for visual styling
     * @default 'swsh'
     */
    generation?: CardGeneration;

    /**
     * Visual variant of the card based on its location/state
     * @default 'default'
     */
    variant?: CardVariant;

    /**
     * Size of the card
     * @default 'md'
     */
    size?: CardSize;

    /**
     * Whether the card is face down
     * @default false
     */
    faceDown?: boolean;

    /**
     * Whether the card is tapped/rotated
     * @default false
     */
    tapped?: boolean;

    /**
     * Special condition(s) affecting the card
     */
    specialConditions?: SpecialCondition[];

    /**
     * Number of damage counters on the card
     * @default 0
     */
    damageCounters?: number;

    /**
     * HP of the Pokémon card
     * Only applicable for Pokémon cards
     */
    hp?: number;

    /**
     * Current damage on the Pokémon
     * Only applicable for Pokémon cards
     */
    damage?: number;

    /**
     * Energy cost for retreat
     * Only applicable for Pokémon cards
     */
    retreatCost?: number;

    /**
     * Cards attached to this card (e.g., Energy, Tools)
     * Only applicable for Pokémon cards
     */
    attachedCards?: CardProps[];

    /**
     * Whether this card is an evolution
     * Only applicable for Pokémon cards
     */
    isEvolution?: boolean;

    /**
     * Name of the Pokémon this card evolves from
     * Only applicable for evolution Pokémon cards
     */
    evolvesFrom?: string;

    /**
     * Special card flags
     */
    isGX?: boolean;
    isVSTAR?: boolean;
    isVMAX?: boolean;
    isPrism?: boolean;
    isTagTeam?: boolean;
    isRadiant?: boolean;
    isEX?: boolean;

    /**
     * Whether the card is draggable
     * @default false
     */
    draggable?: boolean;

    /**
     * Whether the card is selectable
     * @default false
     */
    selectable?: boolean;

    /**
     * Whether the card is currently selected
     * @default false
     */
    selected?: boolean;

    /**
     * Whether the card is being hovered
     * @default false
     */
    hovered?: boolean;

    /**
     * Whether the card is being previewed/inspected
     * @default false
     */
    previewed?: boolean;

    /**
     * Additional CSS class names
     */
    className?: string;

    /**
     * Click handler
     */
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;

    /**
     * Double click handler
     */
    onDoubleClick?: (event: React.MouseEvent<HTMLDivElement>) => void;

    /**
     * Right click handler
     */
    onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void;

    /**
     * Mouse enter handler
     */
    onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;

    /**
     * Mouse leave handler
     */
    onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;

    /**
     * Drag start handler
     */
    onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Drag end handler
     */
    onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Drag over handler
     */
    onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Drop handler
     */
    onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
}

/**
 * Card component for displaying Pokémon cards
 */
export const Card: React.FC<CardProps> = ({
    id,
    name,
    imageUrl,
    cardType = CardType.POKEMON,
    pokemonTypes = [PokemonType.COLORLESS],
    rarity = 'common',
    generation = 'swsh',
    variant = 'default',
    size = 'md',
    faceDown = false,
    tapped = false,
    specialConditions = [],
    damageCounters = 0,
    hp,
    damage = 0,
    retreatCost,
    attachedCards = [],
    isEvolution = false,
    evolvesFrom,
    isGX = false,
    isVSTAR = false,
    isVMAX = false,
    isPrism = false,
    isTagTeam = false,
    isRadiant = false,
    isEX = false,
    draggable = false,
    selectable = false,
    selected = false,
    hovered = false,
    previewed = false,
    className = '',
    onClick,
    onDoubleClick,
    onContextMenu,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
}) => {
    // Local state for hover effects if not controlled externally
    const [isHovered, setIsHovered] = useState(hovered);

    // State for tracking if the card is currently flipping
    const [isFlipping, setIsFlipping] = useState(false);

    // State for tracking if the card is face down (internal state)
    const [isFaceDown, setIsFaceDown] = useState(faceDown);

    // Ref for the card element
    const cardRef = useRef<HTMLDivElement>(null);

    // Handle mouse enter/leave if not controlled externally
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!hovered) setIsHovered(true);
        if (onMouseEnter) onMouseEnter(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!hovered) setIsHovered(false);
        if (onMouseLeave) onMouseLeave(e);
    };

    // Update local state when controlled props change
    useEffect(() => {
        setIsHovered(hovered);
    }, [hovered]);

    useEffect(() => {
        setIsFaceDown(faceDown);
    }, [faceDown]);

    // Function to flip the card
    const flipCard = () => {
        setIsFlipping(true);
        setTimeout(() => {
            setIsFaceDown(prevState => !prevState);
            setTimeout(() => {
                setIsFlipping(false);
            }, 150); // Half of the transition time
        }, 150); // Half of the transition time
    };

    // Determine the primary type for styling
    const primaryType = pokemonTypes && pokemonTypes.length > 0
        ? pokemonTypes[0]
        : PokemonType.COLORLESS;

    // Combine all classes
    const baseClasses = 'card';
    const typeClasses = `card-type-${primaryType.toLowerCase()}`;
    const cardTypeClasses = `card-cardtype-${cardType.toLowerCase()}`;
    const variantClasses = `card-variant-${variant}`;
    const sizeClasses = `card-size-${size}`;
    const rarityClasses = `card-rarity-${rarity}`;
    const generationClasses = `card-generation-${generation}`;
    const faceClasses = isFaceDown ? 'card-face-down' : 'card-face-up';
    const rotationClasses = tapped ? 'card-tapped' : '';
    const flipClasses = isFlipping
        ? isFaceDown ? 'card-flipping-back' : 'card-flipping'
        : '';

    // Special card type classes
    const specialCardClasses = [
        isGX ? 'card-gx' : '',
        isVSTAR ? 'card-vstar' : '',
        isVMAX ? 'card-vmax' : '',
        isPrism ? 'card-prism' : '',
        isTagTeam ? 'card-tag-team' : '',
        isRadiant ? 'card-radiant' : '',
        isEX ? 'card-ex' : '',
        isEvolution ? 'card-evolution' : '',
    ].filter(Boolean).join(' ');

    // State classes
    const stateClasses = [
        draggable ? 'card-draggable' : '',
        selectable ? 'card-selectable' : '',
        selected ? 'card-selected' : '',
        (isHovered || hovered) ? 'card-hovered' : '',
        previewed ? 'card-previewed' : '',
        attachedCards.length > 0 ? 'card-has-attachments' : '',
    ].filter(Boolean).join(' ');

    const combinedClasses = [
        baseClasses,
        typeClasses,
        cardTypeClasses,
        variantClasses,
        sizeClasses,
        rarityClasses,
        generationClasses,
        faceClasses,
        rotationClasses,
        flipClasses,
        specialCardClasses,
        stateClasses,
        className
    ].filter(Boolean).join(' ');

    // Handle click events
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (onClick) onClick(e);
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (onDoubleClick) onDoubleClick(e);
        // Double click can also flip the card if it's selectable
        if (selectable) flipCard();
    };

    return (
        <div
            ref={cardRef}
            className={combinedClasses}
            data-card-id={id}
            data-card-name={name}
            data-card-type={cardType}
            data-pokemon-type={pokemonTypes.join(',')}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={onContextMenu}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDrop={onDrop}
            tabIndex={selectable ? 0 : -1}
            role={selectable ? 'button' : undefined}
            aria-label={`${name} ${cardType} card`}
            aria-pressed={selected}
            onKeyDown={(e) => {
                // Handle keyboard interactions
                if (selectable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    if (onClick) onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
            }}
        >
            {/* Card Face */}
            <CardFace
                name={name}
                imageUrl={imageUrl}
                cardType={cardType}
                pokemonTypes={pokemonTypes}
                hp={hp}
                isGX={isGX}
                isVSTAR={isVSTAR}
                isVMAX={isVMAX}
                isPrism={isPrism}
                isTagTeam={isTagTeam}
                isRadiant={isRadiant}
                isEX={isEX}
                className={isFaceDown ? 'card-hidden' : ''}
            />

            {/* Card Back */}
            <CardBack
                generation={generation}
                className={!isFaceDown ? 'card-hidden' : ''}
            />

            {/* Damage counters */}
            {damageCounters > 0 && (
                <div className="card-damage-counter">{damageCounters}</div>
            )}

            {/* Special condition indicators */}
            {specialConditions.length > 0 && (
                <div className="card-condition-indicators">
                    {specialConditions.map((condition, index) => (
                        <div
                            key={`${id}-condition-${index}`}
                            className={`card-condition-indicator card-condition-${condition.toLowerCase()}`}
                        />
                    ))}
                </div>
            )}

            {/* Attached cards */}
            {attachedCards.length > 0 && (
                <>
                    {attachedCards.map((attachedCard, index) => {
                        // Determine attachment type
                        let attachmentType: 'energy' | 'tool' | 'evolution' | 'other' = 'other';

                        if (attachedCard.cardType === CardType.ENERGY) {
                            attachmentType = 'energy';
                        } else if (attachedCard.cardType === CardType.TOOL) {
                            attachmentType = 'tool';
                        } else if (attachedCard.isEvolution) {
                            attachmentType = 'evolution';
                        }

                        return (
                            <CardAttachment
                                key={`${id}-attachment-${index}`}
                                card={attachedCard}
                                attachmentType={attachmentType}
                                index={index}
                                total={attachedCards.length}
                                size={size === 'xl' ? 'md' : size === 'lg' ? 'sm' : 'xs'}
                                selectable={selectable}
                                onClick={(card, e) => {
                                    // Handle attachment click
                                    if (onClick) {
                                        e.stopPropagation();
                                        onClick(e);
                                    }
                                }}
                                onContextMenu={(card, e) => {
                                    // Handle attachment context menu
                                    if (onContextMenu) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onContextMenu(e);
                                    }
                                }}
                            />
                        );
                    })}

                    {/* Simple attachment indicators (for backward compatibility) */}
                    <div className="card-attachments">
                        {attachedCards.map((attachedCard, index) => (
                            <div
                                key={`${id}-attachment-indicator-${index}`}
                                className="card-attachment-indicator"
                                style={{
                                    backgroundColor:
                                        attachedCard.cardType === CardType.ENERGY &&
                                            attachedCard.pokemonTypes &&
                                            attachedCard.pokemonTypes.length > 0
                                            ? `var(--color-energy-${attachedCard.pokemonTypes[0].toLowerCase()})`
                                            : undefined
                                }}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Card name (shown on hover or when face down) */}
            <div className="card-name">{name}</div>
        </div>
    );
};

export default Card;
