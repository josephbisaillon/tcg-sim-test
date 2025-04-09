import React from 'react';
import { Card, CardPlaceholder } from '../ui';
import './DiscardPileZone.css';

export interface DiscardPileZoneProps {
    /**
     * Array of card data for the discard pile
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
     * Whether to show the number of cards in the discard pile
     * @default true
     */
    showCardCount?: boolean;

    /**
     * Whether to show the top card face up
     * @default true
     */
    showTopCard?: boolean;

    /**
     * Callback when the discard pile is clicked
     */
    onClick?: () => void;

    /**
     * Callback when the discard pile is right-clicked
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
 * DiscardPileZone component for displaying a discard pile of cards
 */
export const DiscardPileZone: React.FC<DiscardPileZoneProps> = ({
    cards = [],
    isOpponent = false,
    isDropTarget = false,
    showCardCount = true,
    showTopCard = true,
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
        'discard-pile-zone',
        isOpponent ? 'discard-pile-zone-opponent' : '',
        isDropTarget ? 'discard-pile-zone-drop-target' : '',
        cards.length === 0 ? 'discard-pile-zone-empty' : '',
        className
    ].filter(Boolean).join(' ');

    // Get the top card if available
    const topCard = cards.length > 0 ? cards[cards.length - 1] : null;

    return (
        <div
            className={zoneClasses}
            data-testid="discard-pile-zone"
            aria-label={`${isOpponent ? 'Opponent' : 'Your'} discard pile with ${cards.length} cards`}
            data-droppable={!isOpponent}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
        >
            {cards.length > 0 ? (
                <div className="discard-pile-cards-container">
                    {/* Render stacked cards with slight offset */}
                    {[...Array(Math.min(3, cards.length))].map((_, index) => {
                        const isTopCard = index === 0;
                        const cardToShow = isTopCard ? topCard : null;

                        return (
                            <div
                                key={`discard-pile-card-${index}`}
                                className="discard-pile-card"
                                style={{
                                    transform: `translateY(${index * 2}px) translateX(${index * 2}px)`,
                                    zIndex: 3 - index
                                }}
                            >
                                {isTopCard && showTopCard && cardToShow ? (
                                    <Card
                                        {...cardToShow}
                                        id={cardToShow.id || `discard-top-card`}
                                        name={cardToShow.name || 'Discarded Card'}
                                        variant="discard"
                                        size="md"
                                        faceDown={false}
                                    />
                                ) : (
                                    <Card
                                        id={`discard-pile-card-${index}`}
                                        name="Discarded Card"
                                        variant="discard"
                                        size="md"
                                        faceDown={!showTopCard}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="discard-pile-placeholder-container">
                    <CardPlaceholder
                        variant="discard"
                        size="md"
                    />
                </div>
            )}

            {showCardCount && cards.length > 0 && (
                <div className="discard-pile-card-count">
                    {cards.length}
                </div>
            )}

            <div className="discard-pile-zone-label">
                Discard
            </div>
        </div>
    );
};

export default DiscardPileZone;
