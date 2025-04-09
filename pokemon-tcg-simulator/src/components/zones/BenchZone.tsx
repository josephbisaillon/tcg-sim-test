import React from 'react';
import { Card, CardPlaceholder } from '../ui';
import './BenchZone.css';

export interface BenchZoneProps {
    /**
     * Array of card data for the bench Pokémon
     */
    cards: any[];

    /**
     * Whether the zone belongs to the opponent
     * @default false
     */
    isOpponent?: boolean;

    /**
     * Whether the cards are selectable
     * @default false
     */
    selectable?: boolean;

    /**
     * Whether the cards are face down
     * @default false
     */
    faceDown?: boolean;

    /**
     * Whether the zone is a valid drop target
     * @default false
     */
    isDropTarget?: boolean;

    /**
     * Maximum number of cards allowed in the bench
     * @default 8
     */
    maxCards?: number;

    /**
     * Callback when a card is clicked
     */
    onCardClick?: (cardId: string, index: number) => void;

    /**
     * Callback when a card is right-clicked
     */
    onCardContextMenu?: (cardId: string, index: number, event: React.MouseEvent) => void;

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
 * BenchZone component for displaying bench Pokémon
 */
export const BenchZone: React.FC<BenchZoneProps> = ({
    cards = [],
    isOpponent = false,
    selectable = false,
    faceDown = false,
    isDropTarget = false,
    maxCards = 8,
    onCardClick,
    onCardContextMenu,
    onDrop,
    onDragEnter,
    onDragLeave,
    onDragOver,
    className = '',
}) => {
    // Handle card click
    const handleCardClick = (cardId: string, index: number) => {
        if (onCardClick && selectable) {
            onCardClick(cardId, index);
        }
    };

    // Handle card context menu
    const handleCardContextMenu = (cardId: string, index: number, event: React.MouseEvent) => {
        if (onCardContextMenu) {
            event.preventDefault();
            onCardContextMenu(cardId, index, event);
        }
    };

    // Determine zone classes
    const zoneClasses = [
        'bench-zone',
        isOpponent ? 'bench-zone-opponent' : '',
        isDropTarget ? 'bench-zone-drop-target' : '',
        cards.length === 0 ? 'bench-zone-empty' : '',
        className
    ].filter(Boolean).join(' ');

    // Determine if the bench is full
    const isBenchFull = cards.length >= maxCards;

    // Create placeholder slots based on the number of cards
    const placeholderSlots = [];
    const remainingSlots = Math.max(0, maxCards - cards.length);

    for (let i = 0; i < remainingSlots; i++) {
        placeholderSlots.push(
            <div key={`placeholder-${i}`} className="bench-card-placeholder-container">
                <CardPlaceholder
                    variant="bench"
                    size="sm"
                />
            </div>
        );
    }

    return (
        <div
            className={zoneClasses}
            data-testid="bench-zone"
            aria-label={`${isOpponent ? 'Opponent' : 'Your'} bench zone with ${cards.length} Pokémon`}
            data-full={isBenchFull}
            data-droppable={!isOpponent && !isBenchFull}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
        >
            <div className="bench-cards-container">
                {cards.map((card, index) => (
                    <div key={card.id} className="bench-card-container">
                        <Card
                            {...card}
                            variant="bench"
                            size="sm"
                            faceDown={faceDown}
                            selectable={selectable}
                            onClick={() => handleCardClick(card.id, index)}
                            onContextMenu={(e) => handleCardContextMenu(card.id, index, e)}
                        />
                    </div>
                ))}

                {placeholderSlots}
            </div>

            <div className="bench-zone-label">
                Bench ({cards.length}/{maxCards})
            </div>
        </div>
    );
};

export default BenchZone;
