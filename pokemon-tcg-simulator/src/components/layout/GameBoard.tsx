import React from 'react';
import { PlayerField } from './PlayerField';
import { StadiumZone, StatusMarkerZone } from '../zones';
import './GameBoard.css';

export interface GameBoardProps {
    /**
     * Player's prize cards data
     */
    playerPrizeCards: any[];

    /**
     * Player's active Pokémon data
     */
    playerActivePokemon: any | null;

    /**
     * Stadium card data
     */
    stadiumCard?: any;

    /**
     * Whether the player has used their VSTAR power
     * @default false
     */
    playerVstarUsed?: boolean;

    /**
     * Whether the player has used their GX attack
     * @default false
     */
    playerGxUsed?: boolean;

    /**
     * Whether the player has used their ACE SPEC card
     * @default false
     */
    playerAceSpecUsed?: boolean;

    /**
     * Whether the opponent has used their VSTAR power
     * @default false
     */
    opponentVstarUsed?: boolean;

    /**
     * Whether the opponent has used their GX attack
     * @default false
     */
    opponentGxUsed?: boolean;

    /**
     * Whether the opponent has used their ACE SPEC card
     * @default false
     */
    opponentAceSpecUsed?: boolean;

    /**
     * Player's bench Pokémon data
     */
    playerBenchPokemon: any[];

    /**
     * Player's deck cards data
     */
    playerDeckCards: any[];

    /**
     * Player's discard pile cards data
     */
    playerDiscardPileCards: any[];

    /**
     * Player's hand cards data
     */
    playerHandCards: any[];

    /**
     * Opponent's prize cards data
     */
    opponentPrizeCards: any[];

    /**
     * Opponent's active Pokémon data
     */
    opponentActivePokemon: any | null;

    /**
     * Opponent's bench Pokémon data
     */
    opponentBenchPokemon: any[];

    /**
     * Opponent's deck cards data
     */
    opponentDeckCards: any[];

    /**
     * Opponent's discard pile cards data
     */
    opponentDiscardPileCards: any[];

    /**
     * Opponent's hand cards data
     */
    opponentHandCards: any[];

    /**
     * Whether to hide the contents of the player's hand
     * @default false
     */
    hidePlayerHand?: boolean;

    /**
     * Whether to hide the contents of the opponent's hand
     * @default true
     */
    hideOpponentHand?: boolean;

    /**
     * Whether to fan the cards in the player's hand
     * @default true
     */
    fanPlayerHandCards?: boolean;

    /**
     * Whether to fan the cards in the opponent's hand
     * @default true
     */
    fanOpponentHandCards?: boolean;

    /**
     * Maximum fan angle for player's hand cards
     * @default 20
     */
    playerHandFanAngle?: number;

    /**
     * Maximum fan angle for opponent's hand cards
     * @default 20
     */
    opponentHandFanAngle?: number;

    /**
     * Callback when a player's prize card is clicked
     */
    onPlayerPrizeCardClick?: (index: number) => void;

    /**
     * Callback when the player's active Pokémon is clicked
     */
    onPlayerActivePokemonClick?: () => void;

    /**
     * Callback when a player's bench Pokémon is clicked
     */
    onPlayerBenchPokemonClick?: (index: number) => void;

    /**
     * Callback when the player's deck is clicked
     */
    onPlayerDeckClick?: () => void;

    /**
     * Callback when the player's discard pile is clicked
     */
    onPlayerDiscardPileClick?: () => void;

    /**
     * Callback when a player's hand card is clicked
     */
    onPlayerHandCardClick?: (cardId: string, index: number) => void;

    /**
     * Callback when an opponent's prize card is clicked
     */
    onOpponentPrizeCardClick?: (index: number) => void;

    /**
     * Callback when the opponent's active Pokémon is clicked
     */
    onOpponentActivePokemonClick?: () => void;

    /**
     * Callback when an opponent's bench Pokémon is clicked
     */
    onOpponentBenchPokemonClick?: (index: number) => void;

    /**
     * Callback when the opponent's deck is clicked
     */
    onOpponentDeckClick?: () => void;

    /**
     * Callback when the opponent's discard pile is clicked
     */
    onOpponentDiscardPileClick?: () => void;

    /**
     * Callback when an opponent's hand card is clicked
     */
    onOpponentHandCardClick?: (cardId: string, index: number) => void;

    /**
     * Callback when the stadium card is clicked
     */
    onStadiumCardClick?: (cardId: string) => void;

    /**
     * Callback when the stadium card is right-clicked
     */
    onStadiumCardContextMenu?: (cardId: string, event: React.MouseEvent) => void;

    /**
     * Whether the stadium zone is a valid drop target
     * @default false
     */
    isStadiumDropTarget?: boolean;

    /**
     * Callback when the player's VSTAR marker is clicked
     */
    onPlayerVstarClick?: () => void;

    /**
     * Callback when the player's GX marker is clicked
     */
    onPlayerGxClick?: () => void;

    /**
     * Callback when the player's ACE SPEC marker is clicked
     */
    onPlayerAceSpecClick?: () => void;

    /**
     * Callback when the opponent's VSTAR marker is clicked
     */
    onOpponentVstarClick?: () => void;

    /**
     * Callback when the opponent's GX marker is clicked
     */
    onOpponentGxClick?: () => void;

    /**
     * Callback when the opponent's ACE SPEC marker is clicked
     */
    onOpponentAceSpecClick?: () => void;

    /**
     * Callback when a card is right-clicked
     */
    onCardContextMenu?: (cardId: string, side: 'player' | 'opponent', zone: string, index: number, event: React.MouseEvent) => void;

    /**
     * Callback when a drag enters a zone
     */
    onDragEnter?: (side: 'player' | 'opponent' | 'stadium', zone: string, event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Callback when a drag leaves a zone
     */
    onDragLeave?: (side: 'player' | 'opponent' | 'stadium', zone: string, event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Callback when a drag is over a zone
     */
    onDragOver?: (side: 'player' | 'opponent' | 'stadium', zone: string, event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Callback when a card is dropped on a zone
     */
    onDrop?: (side: 'player' | 'opponent' | 'stadium', zone: string, event: React.DragEvent<HTMLDivElement>) => void;

    /**
     * Map of zones that are valid drop targets for the player
     */
    playerDropTargets?: {
        prizeCards?: boolean;
        activePokemon?: boolean;
        benchPokemon?: boolean;
        deck?: boolean;
        discardPile?: boolean;
        hand?: boolean;
    };

    /**
     * Map of zones that are valid drop targets for the opponent
     */
    opponentDropTargets?: {
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
 * GameBoard component for displaying the complete game board with player and opponent fields
 */
export const GameBoard: React.FC<GameBoardProps> = ({
    playerPrizeCards = [],
    playerActivePokemon = null,
    stadiumCard = null,
    playerVstarUsed = false,
    playerGxUsed = false,
    playerAceSpecUsed = false,
    opponentVstarUsed = false,
    opponentGxUsed = false,
    opponentAceSpecUsed = false,
    playerBenchPokemon = [],
    playerDeckCards = [],
    playerDiscardPileCards = [],
    playerHandCards = [],
    opponentPrizeCards = [],
    opponentActivePokemon = null,
    opponentBenchPokemon = [],
    opponentDeckCards = [],
    opponentDiscardPileCards = [],
    opponentHandCards = [],
    hidePlayerHand = false,
    hideOpponentHand = true,
    fanPlayerHandCards = true,
    fanOpponentHandCards = true,
    playerHandFanAngle = 20,
    opponentHandFanAngle = 20,
    onPlayerPrizeCardClick,
    onPlayerActivePokemonClick,
    onPlayerBenchPokemonClick,
    onPlayerDeckClick,
    onPlayerDiscardPileClick,
    onPlayerHandCardClick,
    onOpponentPrizeCardClick,
    onOpponentActivePokemonClick,
    onOpponentBenchPokemonClick,
    onOpponentDeckClick,
    onOpponentDiscardPileClick,
    onOpponentHandCardClick,
    onStadiumCardClick,
    onStadiumCardContextMenu,
    isStadiumDropTarget = false,
    onPlayerVstarClick,
    onPlayerGxClick,
    onPlayerAceSpecClick,
    onOpponentVstarClick,
    onOpponentGxClick,
    onOpponentAceSpecClick,
    onCardContextMenu,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    playerDropTargets = {},
    opponentDropTargets = {},
    className = '',
}) => {
    // Handle player card context menu
    const handlePlayerCardContextMenu = (cardId: string, zone: string, index: number, event: React.MouseEvent) => {
        if (onCardContextMenu) {
            onCardContextMenu(cardId, 'player', zone, index, event);
        }
    };

    // Handle opponent card context menu
    const handleOpponentCardContextMenu = (cardId: string, zone: string, index: number, event: React.MouseEvent) => {
        if (onCardContextMenu) {
            onCardContextMenu(cardId, 'opponent', zone, index, event);
        }
    };

    // Handle player drag events
    const handlePlayerDragEnter = (zone: string, event: React.DragEvent<HTMLDivElement>) => {
        if (onDragEnter) {
            onDragEnter('player', zone, event);
        }
    };

    const handlePlayerDragLeave = (zone: string, event: React.DragEvent<HTMLDivElement>) => {
        if (onDragLeave) {
            onDragLeave('player', zone, event);
        }
    };

    const handlePlayerDragOver = (zone: string, event: React.DragEvent<HTMLDivElement>) => {
        if (onDragOver) {
            onDragOver('player', zone, event);
        }
    };

    const handlePlayerDrop = (zone: string, event: React.DragEvent<HTMLDivElement>) => {
        if (onDrop) {
            onDrop('player', zone, event);
        }
    };

    // Handle opponent drag events
    const handleOpponentDragEnter = (zone: string, event: React.DragEvent<HTMLDivElement>) => {
        if (onDragEnter) {
            onDragEnter('opponent', zone, event);
        }
    };

    const handleOpponentDragLeave = (zone: string, event: React.DragEvent<HTMLDivElement>) => {
        if (onDragLeave) {
            onDragLeave('opponent', zone, event);
        }
    };

    const handleOpponentDragOver = (zone: string, event: React.DragEvent<HTMLDivElement>) => {
        if (onDragOver) {
            onDragOver('opponent', zone, event);
        }
    };

    const handleOpponentDrop = (zone: string, event: React.DragEvent<HTMLDivElement>) => {
        if (onDrop) {
            onDrop('opponent', zone, event);
        }
    };

    // Determine board classes
    const boardClasses = [
        'game-board',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={boardClasses} data-testid="game-board">
            {/* Opponent's field */}
            <div className="game-board-opponent">
                <PlayerField
                    isOpponent={true}
                    prizeCards={opponentPrizeCards}
                    activePokemon={opponentActivePokemon}
                    benchPokemon={opponentBenchPokemon}
                    deckCards={opponentDeckCards}
                    discardPileCards={opponentDiscardPileCards}
                    handCards={opponentHandCards}
                    hideHand={hideOpponentHand}
                    fanHandCards={fanOpponentHandCards}
                    maxHandFanAngle={opponentHandFanAngle}
                    onPrizeCardClick={onOpponentPrizeCardClick}
                    onActivePokemonClick={onOpponentActivePokemonClick}
                    onBenchPokemonClick={onOpponentBenchPokemonClick}
                    onDeckClick={onOpponentDeckClick}
                    onDiscardPileClick={onOpponentDiscardPileClick}
                    onHandCardClick={onOpponentHandCardClick}
                    onCardContextMenu={handleOpponentCardContextMenu}
                    onDragEnter={handleOpponentDragEnter}
                    onDragLeave={handleOpponentDragLeave}
                    onDragOver={handleOpponentDragOver}
                    onDrop={handleOpponentDrop}
                    dropTargets={opponentDropTargets}
                />
            </div>

            {/* Center area for stadium and special status zones */}
            <div className="game-board-center">
                {/* Opponent's status markers */}
                <StatusMarkerZone
                    vstarUsed={opponentVstarUsed}
                    gxUsed={opponentGxUsed}
                    aceSpecUsed={opponentAceSpecUsed}
                    onVstarClick={onOpponentVstarClick}
                    onGxClick={onOpponentGxClick}
                    onAceSpecClick={onOpponentAceSpecClick}
                    isOpponent={true}
                />

                {/* Stadium zone */}
                <StadiumZone
                    card={stadiumCard}
                    isDropTarget={isStadiumDropTarget}
                    selectable={true}
                    onCardClick={onStadiumCardClick}
                    onCardContextMenu={onStadiumCardContextMenu}
                    onDragEnter={(e) => onDragEnter?.('stadium', 'stadium', e)}
                    onDragLeave={(e) => onDragLeave?.('stadium', 'stadium', e)}
                    onDragOver={(e) => onDragOver?.('stadium', 'stadium', e)}
                    onDrop={(e) => onDrop?.('stadium', 'stadium', e)}
                />

                {/* Player's status markers */}
                <StatusMarkerZone
                    vstarUsed={playerVstarUsed}
                    gxUsed={playerGxUsed}
                    aceSpecUsed={playerAceSpecUsed}
                    onVstarClick={onPlayerVstarClick}
                    onGxClick={onPlayerGxClick}
                    onAceSpecClick={onPlayerAceSpecClick}
                />
            </div>

            {/* Player's field */}
            <div className="game-board-player">
                <PlayerField
                    prizeCards={playerPrizeCards}
                    activePokemon={playerActivePokemon}
                    benchPokemon={playerBenchPokemon}
                    deckCards={playerDeckCards}
                    discardPileCards={playerDiscardPileCards}
                    handCards={playerHandCards}
                    hideHand={hidePlayerHand}
                    fanHandCards={fanPlayerHandCards}
                    maxHandFanAngle={playerHandFanAngle}
                    onPrizeCardClick={onPlayerPrizeCardClick}
                    onActivePokemonClick={onPlayerActivePokemonClick}
                    onBenchPokemonClick={onPlayerBenchPokemonClick}
                    onDeckClick={onPlayerDeckClick}
                    onDiscardPileClick={onPlayerDiscardPileClick}
                    onHandCardClick={onPlayerHandCardClick}
                    onCardContextMenu={handlePlayerCardContextMenu}
                    onDragEnter={handlePlayerDragEnter}
                    onDragLeave={handlePlayerDragLeave}
                    onDragOver={handlePlayerDragOver}
                    onDrop={handlePlayerDrop}
                    dropTargets={playerDropTargets}
                />
            </div>
        </div>
    );
};

export default GameBoard;
