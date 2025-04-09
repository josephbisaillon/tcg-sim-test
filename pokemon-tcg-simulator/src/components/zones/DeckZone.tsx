import React from 'react';
import { Card, CardPlaceholder } from '../ui';
import './DeckZone.css';

export interface DeckZoneProps {
    /**
     * Array of card data for the deck
     */
    cards: any[];

    /**
     * Whether the zone belongs to the opponent
     * @default false
     */
    isOpponent?: boolean;

    /**
     * Whether the zone is a valid drop target
     * @default false
     */
    isDropTarget?: boolean;

    /**
     * Whether to show the number of cards in the deck
     * @default true
     */
    showCardCount?: boolean;

    /**
     * Callback when the deck is clicked
     */
    onClick?: () => void;

    /**
     * Callback when the deck is right-clicked
     */
    onContextMenu?: (event: React.MouseEvent) => void;

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
 * DeckZone component for displaying a deck of cards
 */
export const DeckZone: React.FC<DeckZoneProps> = ({
    cards = [],
    isOpponent = false,
    isDropTarget = false,
    showCardCount = true,
    onClick,
    onContextMenu,
    onDrop,
    onDragEnter,
    onDragLeave,
    onDragOver,
    className = '',
}) => {
    // Handle click
    const handleClick = () => {
        if (onClick && cards.length > 0) {
            onClick();
        }
    };

    // Handle context menu
    const handleContextMenu = (event: React.MouseEvent) => {
        if (onContextMenu && cards.length > 0) {
            event.preventDefault();
            onContextMenu(event);
        }
    };

    // Determine zone classes
    const zoneClasses = [
        'deck-zone',
        isOpponent ? 'deck-zone-opponent' : '',
        isDropTarget ? 'deck-zone-drop-target' : '',
        cards.length === 0 ? 'deck-zone-empty' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={zoneClasses}
            data-testid="deck-zone"
            aria-label={`${isOpponent ? 'Opponent' : 'Your'} deck with ${cards.length} cards`}
            data-droppable={!isOpponent}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
        >
            {cards.length > 0 ? (
                <div className="deck-cards-container">
                    {/* Render stacked cards with slight offset */}
                    {[...Array(Math.min(3, cards.length))].map((_, index) => (
                        <div
                            key={`deck-card-${index}`}
                            className="deck-card"
                            style={{
                                transform: `translateY(${-index * 2}px) translateX(${-index * 2}px)`,
                                zIndex: 3 - index
                            }}
                        >
                            <Card
                                id={`deck-card-${index}`}
                                name="Card Back"
                                variant="deck"
                                size="md"
                                faceDown={true}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="deck-placeholder-container">
                    <CardPlaceholder
                        variant="deck"
                        size="md"
                    />
                </div>
            )}

            {showCardCount && cards.length > 0 && (
                <div className="deck-card-count">
                    {cards.length}
                </div>
            )}

            <div className="deck-zone-label">
                Deck
            </div>
        </div>
    );
};

export default DeckZone;
