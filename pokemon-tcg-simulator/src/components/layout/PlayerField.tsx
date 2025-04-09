import React from 'react';
import {
    PrizeCardZone,
    ActivePokemonZone,
    BenchZone,
    DeckZone,
    DiscardPileZone,
    HandZone
} from '../zones';
import './PlayerField.css';

export interface PlayerFieldProps {
    /**
     * Whether this field belongs to the opponent
     * @default false
     */
    isOpponent?: boolean;

    /**
     * Prize cards data
     */
    prizeCards: any[];

    /**
     * Active Pokémon data
     */
    activePokemon: any | null;

    /**
     * Bench Pokémon data
     */
    benchPokemon: any[];

    /**
     * Deck cards data
     */
    deckCards: any[];

    /**
     * Discard pile cards data
     */
    discardPileCards: any[];

    /**
     * Hand cards data
     */
    handCards: any[];

    /**
     * Whether to hide the contents of the hand
     * @default false for player, true for opponent
     */
    hideHand?: boolean;

    /**
     * Whether to fan the cards in the hand
     * @default true
     */
    fanHandCards?: boolean;

    /**
     * Maximum fan angle for hand cards
     * @default 20
     */
    maxHandFanAngle?: number;

    /**
     * Callback when a prize card is clicked
     */
    onPrizeCardClick?: (index: number) => void;

    /**
     * Callback when the active Pokémon is clicked
     */
    onActivePokemonClick?: () => void;

    /**
     * Callback when a bench Pokémon is clicked
     */
    onBenchPokemonClick?: (index: number) => void;

    /**
     * Callback when the deck is clicked
     */
    onDeckClick?: () => void;

    /**
     * Callback when the discard pile is clicked
     */
    onDiscardPileClick?: () => void;

    /**
     * Callback when a hand card is clicked
     */
    onHandCardClick?: (cardId: string, index: number) => void;

    /**
     * Callback when a card is right-clicked
     */
    onCardContextMenu?: (cardId: string, zone: string, index: number, event: React.MouseEvent) => void;

    /**
     * Callback when a drag enters a zone
     */
    onDragEnter?: (zone: string, event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Callback when a drag leaves a zone
     */
    onDragLeave?: (zone: string, event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Callback when a drag is over a zone
     */
    onDragOver?: (zone: string, event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Callback when a card is dropped on a zone
     */
    onDrop?: (zone: string, event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Map of zones that are valid drop targets
     */
    dropTargets?: {
        prizeCards?: boolean;
        activePokemon?: boolean;
        benchPokemon?: boolean;
        deck?: boolean;
        discardPile?: boolean;
        hand?: boolean;
    };

    /**
     * Additional CSS class names
     */
    className?: string;
}

/**
 * PlayerField component for displaying a player's side of the game board
 */
export const PlayerField: React.FC<PlayerFieldProps> = ({
    isOpponent = false,
    prizeCards = [],
    activePokemon = null,
    benchPokemon = [],
    deckCards = [],
    discardPileCards = [],
    handCards = [],
    hideHand = isOpponent,
    fanHandCards = true,
    maxHandFanAngle = 20,
    onPrizeCardClick,
    onActivePokemonClick,
    onBenchPokemonClick,
    onDeckClick,
    onDiscardPileClick,
    onHandCardClick,
    onCardContextMenu,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    dropTargets = {},
    className = '',
}) => {
    // Handle card context menu
    const handleCardContextMenu = (cardId: string, zone: string, index: number, event: React.MouseEvent) => {
        if (onCardContextMenu) {
            onCardContextMenu(cardId, zone, index, event);
        }
    };

    // Handle drag events
    const handleDragEnter = (zone: string, event: React.DragEvent<HTMLDivElement>) => {
        if (onDragEnter) {
            onDragEnter(zone, event);
        }
    };

    const handleDragLeave = (zone: string, event: React.DragEvent<HTMLDivElement>) => {
        if (onDragLeave) {
            onDragLeave(zone, event);
        }
    };

    const handleDragOver = (zone: string, event: React.DragEvent<HTMLDivElement>) => {
        if (onDragOver) {
            onDragOver(zone, event);
        }
    };

    const handleDrop = (zone: string, event: React.DragEvent<HTMLDivElement>) => {
        if (onDrop) {
            onDrop(zone, event);
        }
    };

    // Determine field classes
    const fieldClasses = [
        'player-field',
        isOpponent ? 'player-field-opponent' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={fieldClasses} data-testid={`${isOpponent ? 'opponent' : 'player'}-field`}>
            <div className="player-field-top">
                <div className="player-field-left">
                    <div className="player-field-prize-zone">
                        <PrizeCardZone
                            cards={prizeCards}
                            isOpponent={isOpponent}
                            onCardClick={(cardId, index) => onPrizeCardClick?.(index)}
                        />
                    </div>

                    <div className="player-field-deck-discard">
                        <DeckZone
                            cards={deckCards}
                            isOpponent={isOpponent}
                            isDropTarget={dropTargets.deck}
                            onClick={onDeckClick}
                            onDragEnter={(e) => handleDragEnter('deck', e)}
                            onDragLeave={(e) => handleDragLeave('deck', e)}
                            onDragOver={(e) => handleDragOver('deck', e)}
                            onDrop={(e) => handleDrop('deck', e)}
                        />

                        <DiscardPileZone
                            cards={discardPileCards}
                            isOpponent={isOpponent}
                            isDropTarget={dropTargets.discardPile}
                            onClick={onDiscardPileClick}
                            onDragEnter={(e) => handleDragEnter('discardPile', e)}
                            onDragLeave={(e) => handleDragLeave('discardPile', e)}
                            onDragOver={(e) => handleDragOver('discardPile', e)}
                            onDrop={(e) => handleDrop('discardPile', e)}
                        />
                    </div>
                </div>

                <div className="player-field-center">
                    <div className="player-field-active-zone">
                        <ActivePokemonZone
                            card={activePokemon}
                            isOpponent={isOpponent}
                            isDropTarget={dropTargets.activePokemon}
                            onCardClick={onActivePokemonClick ? () => onActivePokemonClick() : undefined}
                            onCardContextMenu={(cardId, event) => handleCardContextMenu(cardId, 'activePokemon', 0, event)}
                            onDragEnter={(e) => handleDragEnter('activePokemon', e)}
                            onDragLeave={(e) => handleDragLeave('activePokemon', e)}
                            onDragOver={(e) => handleDragOver('activePokemon', e)}
                            onDrop={(e) => handleDrop('activePokemon', e)}
                        />
                    </div>

                    <div className="player-field-bench-zone">
                        <BenchZone
                            cards={benchPokemon}
                            isOpponent={isOpponent}
                            isDropTarget={dropTargets.benchPokemon}
                            onCardClick={(cardId, index) => onBenchPokemonClick?.(index)}
                            onCardContextMenu={(cardId, index, event) => handleCardContextMenu(cardId, 'benchPokemon', index, event)}
                            onDragEnter={(e) => handleDragEnter('benchPokemon', e)}
                            onDragLeave={(e) => handleDragLeave('benchPokemon', e)}
                            onDragOver={(e) => handleDragOver('benchPokemon', e)}
                            onDrop={(e) => handleDrop('benchPokemon', e)}
                        />
                    </div>
                </div>
            </div>

            <div className="player-field-hand-zone">
                <HandZone
                    cards={handCards}
                    isOpponent={isOpponent}
                    faceDown={hideHand}
                    fanCards={fanHandCards}
                    maxFanAngle={maxHandFanAngle}
                    isDropTarget={dropTargets.hand}
                    onCardClick={onHandCardClick}
                    onCardContextMenu={(cardId, index, event) => handleCardContextMenu(cardId, 'hand', index, event)}
                    onDragEnter={(e) => handleDragEnter('hand', e)}
                    onDragLeave={(e) => handleDragLeave('hand', e)}
                    onDragOver={(e) => handleDragOver('hand', e)}
                    onDrop={(e) => handleDrop('hand', e)}
                />
            </div>
        </div>
    );
};

export default PlayerField;
