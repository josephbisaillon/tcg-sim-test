import React from 'react';
import { Card, CardPlaceholder } from '../ui';
import './ActivePokemonZone.css';

export interface ActivePokemonZoneProps {
    /**
     * Card data for the active Pokémon (if any)
     */
    card?: any;

    /**
     * Whether the zone belongs to the opponent
     * @default false
     */
    isOpponent?: boolean;

    /**
     * Whether the card is selectable
     * @default false
     */
    selectable?: boolean;

    /**
     * Whether the card is face down
     * @default false
     */
    faceDown?: boolean;

    /**
     * Whether the zone is a valid drop target
     * @default false
     */
    isDropTarget?: boolean;

    /**
     * Callback when the card is clicked
     */
    onCardClick?: (cardId: string) => void;

    /**
     * Callback when the card is right-clicked
     */
    onCardContextMenu?: (cardId: string, event: React.MouseEvent) => void;

    /**
     * Callback when a card is dropped on the zone
     */
    onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Callback when a drag enters the zone
     */
    onDragEnter?: (event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Callback when a drag leaves the zone
     */
    onDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Callback when a drag is over the zone
     */
    onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Additional CSS class names
     */
    className?: string;
}

/**
 * ActivePokemonZone component for displaying the active Pokémon
 */
export const ActivePokemonZone: React.FC<ActivePokemonZoneProps> = ({
    card,
    isOpponent = false,
    selectable = false,
    faceDown = false,
    isDropTarget = false,
    onCardClick,
    onCardContextMenu,
    onDrop,
    onDragEnter,
    onDragLeave,
    onDragOver,
    className = '',
}) => {
    // Handle card click
    const handleCardClick = (cardId: string) => {
        if (onCardClick && selectable) {
            onCardClick(cardId);
        }
    };

    // Handle card context menu
    const handleCardContextMenu = (cardId: string, event: React.MouseEvent) => {
        if (onCardContextMenu) {
            event.preventDefault();
            onCardContextMenu(cardId, event);
        }
    };

    // Determine zone classes
    const zoneClasses = [
        'active-pokemon-zone',
        isOpponent ? 'active-pokemon-zone-opponent' : '',
        isDropTarget ? 'active-pokemon-zone-drop-target' : '',
        !card ? 'active-pokemon-zone-empty' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={zoneClasses}
            data-testid="active-pokemon-zone"
            aria-label={`${isOpponent ? 'Opponent' : 'Your'} active Pokémon zone`}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
        >
            {card ? (
                <div className="active-pokemon-card-container">
                    <Card
                        {...card}
                        variant="active"
                        size="md"
                        faceDown={faceDown}
                        selectable={selectable}
                        onClick={() => handleCardClick(card.id)}
                        onContextMenu={(e) => handleCardContextMenu(card.id, e)}
                    />
                </div>
            ) : (
                <div className="active-pokemon-placeholder-container">
                    <CardPlaceholder
                        variant="active"
                        size="md"
                    />
                </div>
            )}

            <div className="active-pokemon-zone-label">
                Active Pokémon
            </div>
        </div>
    );
};

export default ActivePokemonZone;
