import React from 'react';
import { Card, CardPlaceholder } from '../ui';
import './PrizeCardZone.css';

export interface PrizeCardZoneProps {
    /**
     * Array of card data for prize cards
     */
    cards: any[];

    /**
     * Maximum number of prize cards (default: 6)
     */
    maxCards?: number;

    /**
     * Whether the cards are face down
     * @default true
     */
    faceDown?: boolean;

    /**
     * Whether the cards are selectable
     * @default false
     */
    selectable?: boolean;

    /**
     * Whether the zone belongs to the opponent
     * @default false
     */
    isOpponent?: boolean;

    /**
     * Callback when a card is clicked
     */
    onCardClick?: (cardId: string, index: number) => void;

    /**
     * Callback when a card is right-clicked
     */
    onCardContextMenu?: (cardId: string, index: number, event: React.MouseEvent) => void;

    /**
     * Additional CSS class names
     */
    className?: string;
}

/**
 * PrizeCardZone component for displaying the 2×3 grid of prize cards
 */
export const PrizeCardZone: React.FC<PrizeCardZoneProps> = ({
    cards = [],
    maxCards = 6,
    faceDown = true,
    selectable = false,
    isOpponent = false,
    onCardClick,
    onCardContextMenu,
    className = '',
}) => {
    // Calculate empty slots
    const emptySlots = Math.max(0, maxCards - cards.length);

    // Create array of empty slots
    const emptySlotArray = Array(emptySlots).fill(null);

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

    return (
        <div
            className={`prize-card-zone ${isOpponent ? 'prize-card-zone-opponent' : ''} ${className}`}
            data-testid="prize-card-zone"
            aria-label={`${isOpponent ? 'Opponent' : 'Your'} prize cards`}
        >
            <div className="prize-card-zone-grid">
                {/* Render actual prize cards */}
                {cards.map((card, index) => (
                    <div
                        key={`prize-card-${card.id || index}`}
                        className="prize-card-slot"
                        data-index={index}
                    >
                        <Card
                            {...card}
                            variant="prize"
                            size="sm"
                            faceDown={faceDown}
                            selectable={selectable}
                            onClick={() => handleCardClick(card.id, index)}
                            onContextMenu={(e) => handleCardContextMenu(card.id, index, e)}
                        />
                    </div>
                ))}

                {/* Render empty placeholder slots */}
                {emptySlotArray.map((_, index) => (
                    <div
                        key={`prize-card-placeholder-${index}`}
                        className="prize-card-slot prize-card-slot-empty"
                        data-index={cards.length + index}
                    >
                        <CardPlaceholder
                            variant="prize"
                            size="sm"
                        />
                    </div>
                ))}
            </div>

            {/* Optional label */}
            <div className="prize-card-zone-label">
                Prize Cards ({cards.length}/{maxCards})
            </div>
        </div>
    );
};

export default PrizeCardZone;
