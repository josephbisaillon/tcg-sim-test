import React from 'react';
import { Card, CardPlaceholder } from '../ui';
import './StadiumZone.css';

export interface StadiumZoneProps {
    /**
     * Card data for the stadium card (if any)
     */
    card?: any;

    /**
     * Whether the zone is a valid drop target
     * @default false
     */
    isDropTarget?: boolean;

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
 * StadiumZone component for displaying the stadium card
 */
export const StadiumZone: React.FC<StadiumZoneProps> = ({
    card,
    isDropTarget = false,
    selectable = false,
    faceDown = false,
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
        'stadium-zone',
        isDropTarget ? 'stadium-zone-drop-target' : '',
        !card ? 'stadium-zone-empty' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={zoneClasses}
            data-testid="stadium-zone"
            aria-label="Stadium zone"
            onDrop={onDrop}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
        >
            {card ? (
                <div className="stadium-card-container">
                    <Card
                        {...card}
                        variant="stadium"
                        size="md"
                        faceDown={faceDown}
                        selectable={selectable}
                        onClick={() => handleCardClick(card.id)}
                        onContextMenu={(e) => handleCardContextMenu(card.id, e)}
                    />
                </div>
            ) : (
                <div className="stadium-placeholder-container">
                    <CardPlaceholder
                        variant="stadium"
                        size="md"
                    />
                </div>
            )}

            <div className="stadium-zone-label">
                Stadium
            </div>
        </div>
    );
};

export default StadiumZone;
