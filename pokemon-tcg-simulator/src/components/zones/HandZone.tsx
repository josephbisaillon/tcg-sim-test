import React, { useRef, useState, useEffect } from 'react';
import { Card } from '../ui';
import './HandZone.css';

export interface HandZoneProps {
    /**
     * Array of card data for the hand
     */
    cards: any[];

    /**
     * Whether the zone belongs to the opponent
     * @default false
     */
    isOpponent?: boolean;

    /**
     * Whether the cards are face down (for opponent's hand)
     * @default false for player, true for opponent
     */
    faceDown?: boolean;

    /**
     * Whether the cards are selectable
     * @default true for player, false for opponent
     */
    selectable?: boolean;

    /**
     * Whether the zone is a valid drop target
     * @default false
     */
    isDropTarget?: boolean;

    /**
     * Whether to fan the cards (spread them out)
     * @default true
     */
    fanCards?: boolean;

    /**
     * Maximum fan angle in degrees
     * @default 20
     */
    maxFanAngle?: number;

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
 * HandZone component for displaying a player's hand of cards with horizontal scrolling
 */
export const HandZone: React.FC<HandZoneProps> = ({
    cards = [],
    isOpponent = false,
    faceDown = isOpponent,
    selectable = !isOpponent,
    isDropTarget = false,
    fanCards = true,
    maxFanAngle = 20,
    onCardClick,
    onCardContextMenu,
    onDrop,
    onDragEnter,
    onDragLeave,
    onDragOver,
    className = '',
}) => {
    // Ref for the hand container
    const handContainerRef = useRef<HTMLDivElement>(null);

    // State for tracking scroll position
    const [scrollPosition, setScrollPosition] = useState(0);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);

    // Handle card click
    const handleCardClick = (cardId: string, index: number) => {
        if (onCardClick && selectable) {
            onCardClick(cardId, index);
        }
    };

    // Handle card context menu
    const handleCardContextMenu = (cardId: string, index: number, event: React.MouseEvent) => {
        if (onCardContextMenu && selectable) {
            event.preventDefault();
            onCardContextMenu(cardId, index, event);
        }
    };

    // Handle scroll
    const handleScroll = () => {
        if (handContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = handContainerRef.current;
            setScrollPosition(scrollLeft);
            setShowLeftScroll(scrollLeft > 0);
            setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
        }
    };

    // Scroll left
    const scrollLeft = () => {
        if (handContainerRef.current) {
            handContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    // Scroll right
    const scrollRight = () => {
        if (handContainerRef.current) {
            handContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    // Check scroll buttons on mount and when cards change
    useEffect(() => {
        handleScroll();

        // Add resize observer to handle container size changes
        const resizeObserver = new ResizeObserver(() => {
            handleScroll();
        });

        if (handContainerRef.current) {
            resizeObserver.observe(handContainerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [cards]);

    // Determine zone classes
    const zoneClasses = [
        'hand-zone',
        isOpponent ? 'hand-zone-opponent' : '',
        isDropTarget ? 'hand-zone-drop-target' : '',
        cards.length === 0 ? 'hand-zone-empty' : '',
        className
    ].filter(Boolean).join(' ');

    // Calculate fan angles for cards
    const calculateFanAngle = (index: number, total: number) => {
        if (!fanCards || total <= 1) return 0;

        // Calculate angle based on position in hand
        const middleIndex = (total - 1) / 2;
        const relativePosition = index - middleIndex;
        const normalizedPosition = relativePosition / Math.max(middleIndex, 1);

        return normalizedPosition * maxFanAngle;
    };

    // Calculate horizontal offset for fanned cards
    const calculateHorizontalOffset = (index: number, total: number) => {
        if (!fanCards || total <= 1) return 0;

        // Calculate offset based on position in hand
        const middleIndex = (total - 1) / 2;
        const relativePosition = index - middleIndex;
        const normalizedPosition = relativePosition / Math.max(middleIndex, 1);

        // Offset more for cards further from center
        return normalizedPosition * 15;
    };

    // Calculate vertical offset for fanned cards
    const calculateVerticalOffset = (index: number, total: number) => {
        if (!fanCards || total <= 1) return 0;

        // Calculate offset based on position in hand
        const middleIndex = (total - 1) / 2;
        const relativePosition = Math.abs(index - middleIndex);
        const normalizedPosition = relativePosition / Math.max(middleIndex, 1);

        // Cards further from center are lower
        return normalizedPosition * 10;
    };

    return (
        <div
            className={zoneClasses}
            data-testid="hand-zone"
            aria-label={`${isOpponent ? 'Opponent' : 'Your'} hand with ${cards.length} cards`}
            data-droppable={!isOpponent}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
        >
            {/* Scroll buttons */}
            {showLeftScroll && (
                <button
                    className="hand-zone-scroll-button hand-zone-scroll-left"
                    onClick={scrollLeft}
                    aria-label="Scroll left"
                >
                    &lt;
                </button>
            )}

            {showRightScroll && (
                <button
                    className="hand-zone-scroll-button hand-zone-scroll-right"
                    onClick={scrollRight}
                    aria-label="Scroll right"
                >
                    &gt;
                </button>
            )}

            {/* Cards container with horizontal scrolling */}
            <div
                className="hand-cards-container"
                ref={handContainerRef}
                onScroll={handleScroll}
            >
                {cards.length > 0 ? (
                    <div className="hand-cards-inner">
                        {cards.map((card, index) => {
                            const fanAngle = calculateFanAngle(index, cards.length);
                            const horizontalOffset = calculateHorizontalOffset(index, cards.length);
                            const verticalOffset = calculateVerticalOffset(index, cards.length);

                            return (
                                <div
                                    key={card.id || `hand-card-${index}`}
                                    className="hand-card-container"
                                    style={{
                                        transform: `rotate(${fanAngle}deg) translateX(${horizontalOffset}px) translateY(${verticalOffset}px)`,
                                        zIndex: index + 1
                                    }}
                                >
                                    <Card
                                        {...card}
                                        id={card.id || `hand-card-${index}`}
                                        name={card.name || 'Card'}
                                        variant="hand"
                                        size="md"
                                        faceDown={faceDown}
                                        selectable={selectable}
                                        onClick={() => handleCardClick(card.id, index)}
                                        onContextMenu={(e) => handleCardContextMenu(card.id, index, e)}
                                        draggable={selectable}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="hand-zone-empty-message">
                        {isOpponent ? "Opponent's hand is empty" : "Your hand is empty"}
                    </div>
                )}
            </div>

            <div className="hand-zone-label">
                Hand ({cards.length})
            </div>
        </div>
    );
};

export default HandZone;
