import React from 'react';
import './Card.css';
import { CardType, PokemonType } from '../../types/game';
import { CardProps, CardSize } from './Card';

export interface CardAttachmentProps {
    /**
     * The card that is attached
     */
    card: CardProps;

    /**
     * Type of attachment
     */
    attachmentType: 'energy' | 'tool' | 'evolution' | 'other';

    /**
     * Position index of the attachment (for stacking)
     */
    index: number;

    /**
     * Total number of attachments (for stacking)
     */
    total: number;

    /**
     * Size of the attachment visualization
     */
    size?: CardSize;

    /**
     * Whether the attachment is selectable
     */
    selectable?: boolean;

    /**
     * Whether the attachment is selected
     */
    selected?: boolean;

    /**
     * Click handler
     */
    onClick?: (card: CardProps, event: React.MouseEvent<HTMLDivElement>) => void;

    /**
     * Context menu handler
     */
    onContextMenu?: (card: CardProps, event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Component for visualizing card attachments (energy, tools, etc.)
 */
export const CardAttachment: React.FC<CardAttachmentProps> = ({
    card,
    attachmentType,
    index,
    total,
    size = 'sm',
    selectable = false,
    selected = false,
    onClick,
    onContextMenu,
}) => {
    // Calculate position based on index and total
    const calculatePosition = () => {
        // Different positioning strategies based on attachment type
        if (attachmentType === 'energy') {
            // Energy cards are stacked with slight offset
            return {
                top: `${index * 5}px`,
                left: `${index * 5}px`,
                zIndex: index + 1,
            };
        } else if (attachmentType === 'tool') {
            // Tool cards are positioned to the right
            return {
                top: '0',
                right: `${-20 - (index * 5)}px`,
                zIndex: index + 1,
            };
        } else if (attachmentType === 'evolution') {
            // Evolution cards are stacked beneath with slight offset
            return {
                bottom: `${index * 5}px`,
                left: `${index * 2}px`,
                zIndex: -index,
            };
        } else {
            // Default positioning
            return {
                top: `${index * 3}px`,
                left: `${index * 3}px`,
                zIndex: index + 1,
            };
        }
    };

    // Get position styles
    const positionStyle = calculatePosition();

    // Determine classes based on attachment type
    const getAttachmentClasses = () => {
        const baseClasses = ['card-attachment'];

        // Add attachment type class
        baseClasses.push(`card-attachment-${attachmentType}`);

        // Add size class
        baseClasses.push(`card-size-${size}`);

        // Add card type class
        if (card.cardType) {
            baseClasses.push(`card-cardtype-${card.cardType.toLowerCase()}`);
        }

        // Add energy type class for energy cards
        if (attachmentType === 'energy' && card.pokemonTypes && card.pokemonTypes.length > 0) {
            baseClasses.push(`card-type-${card.pokemonTypes[0].toLowerCase()}`);
        }

        // Add state classes
        if (selectable) baseClasses.push('card-attachment-selectable');
        if (selected) baseClasses.push('card-attachment-selected');

        return baseClasses.join(' ');
    };

    // Handle click events
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (onClick) {
            e.stopPropagation(); // Prevent parent card from receiving the click
            onClick(card, e);
        }
    };

    // Handle context menu events
    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        if (onContextMenu) {
            e.preventDefault();
            e.stopPropagation(); // Prevent parent card from receiving the context menu
            onContextMenu(card, e);
        }
    };

    // Render different attachment visualizations based on type
    const renderAttachmentContent = () => {
        if (attachmentType === 'energy') {
            // For energy cards, show a colored circle with the energy type
            const energyType = card.pokemonTypes && card.pokemonTypes.length > 0
                ? card.pokemonTypes[0]
                : PokemonType.COLORLESS;

            return (
                <div
                    className={`card-attachment-energy-symbol type-${energyType.toLowerCase()}`}
                    title={`${energyType} Energy`}
                >
                    {/* First letter of energy type */}
                    {energyType.charAt(0)}
                </div>
            );
        } else if (attachmentType === 'tool') {
            // For tool cards, show a tool icon with the card name
            return (
                <div
                    className="card-attachment-tool-symbol"
                    title={`Tool: ${card.name}`}
                >
                    T
                </div>
            );
        } else if (attachmentType === 'evolution') {
            // For evolution cards, show a small version of the card
            return (
                <div
                    className="card-attachment-evolution-symbol"
                    title={`Evolution: ${card.name}`}
                >
                    E
                </div>
            );
        } else {
            // For other attachments, show a generic icon
            return (
                <div
                    className="card-attachment-generic-symbol"
                    title={card.name}
                >
                    +
                </div>
            );
        }
    };

    return (
        <div
            className={getAttachmentClasses()}
            style={{
                position: 'absolute',
                ...positionStyle,
            }}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            tabIndex={selectable ? 0 : -1}
            role={selectable ? 'button' : undefined}
            aria-label={`${attachmentType} attachment: ${card.name}`}
            data-card-id={card.id}
            data-card-name={card.name}
            data-attachment-type={attachmentType}
        >
            {renderAttachmentContent()}
        </div>
    );
};

export default CardAttachment;
