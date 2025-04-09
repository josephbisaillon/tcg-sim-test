import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GameBoard } from '../components/layout/GameBoard';

const Game: React.FC = () => {
    const [isGameStarted, setIsGameStarted] = useState(false);

    // Sample data for the game board
    const [playerPrizeCards, setPlayerPrizeCards] = useState<any[]>([]);
    const [playerActivePokemon, setPlayerActivePokemon] = useState<any>(null);
    const [playerBenchPokemon, setPlayerBenchPokemon] = useState<any[]>([]);
    const [playerDeckCards, setPlayerDeckCards] = useState<any[]>([]);
    const [playerDiscardPileCards, setPlayerDiscardPileCards] = useState<any[]>([]);
    const [playerHandCards, setPlayerHandCards] = useState<any[]>([]);

    const [opponentPrizeCards, setOpponentPrizeCards] = useState<any[]>([]);
    const [opponentActivePokemon, setOpponentActivePokemon] = useState<any>(null);
    const [opponentBenchPokemon, setOpponentBenchPokemon] = useState<any[]>([]);
    const [opponentDeckCards, setOpponentDeckCards] = useState<any[]>([]);
    const [opponentDiscardPileCards, setOpponentDiscardPileCards] = useState<any[]>([]);
    const [opponentHandCards, setOpponentHandCards] = useState<any[]>([]);

    const [stadiumCard, setStadiumCard] = useState<any>(null);

    // Status marker states
    const [playerVstarUsed, setPlayerVstarUsed] = useState<boolean>(false);
    const [playerGxUsed, setPlayerGxUsed] = useState<boolean>(false);
    const [playerAceSpecUsed, setPlayerAceSpecUsed] = useState<boolean>(false);
    const [opponentVstarUsed, setOpponentVstarUsed] = useState<boolean>(false);
    const [opponentGxUsed, setOpponentGxUsed] = useState<boolean>(false);
    const [opponentAceSpecUsed, setOpponentAceSpecUsed] = useState<boolean>(false);

    const startGame = () => {
        setIsGameStarted(true);
        // Initialize game state here
        setPlayerPrizeCards(Array(6).fill(null).map((_, index) => ({ id: `player-prize-${index}` })));
        setOpponentPrizeCards(Array(6).fill(null).map((_, index) => ({ id: `opponent-prize-${index}` })));
        setPlayerDeckCards(Array(10).fill(null).map((_, index) => ({ id: `player-deck-${index}` })));
        setOpponentDeckCards(Array(10).fill(null).map((_, index) => ({ id: `opponent-deck-${index}` })));
        setPlayerHandCards(Array(5).fill(null).map((_, index) => ({ id: `player-hand-${index}` })));
        setOpponentHandCards(Array(5).fill(null).map((_, index) => ({ id: `opponent-hand-${index}` })));
        setPlayerDiscardPileCards(Array(2).fill(null).map((_, index) => ({ id: `player-discard-${index}` })));
        setOpponentDiscardPileCards(Array(2).fill(null).map((_, index) => ({ id: `opponent-discard-${index}` })));
    };

    // Status marker handlers
    const handlePlayerVstarClick = () => {
        setPlayerVstarUsed(prev => !prev);
    };

    const handlePlayerGxClick = () => {
        setPlayerGxUsed(prev => !prev);
    };

    const handlePlayerAceSpecClick = () => {
        setPlayerAceSpecUsed(prev => !prev);
    };

    const handleOpponentVstarClick = () => {
        setOpponentVstarUsed(prev => !prev);
    };

    const handleOpponentGxClick = () => {
        setOpponentGxUsed(prev => !prev);
    };

    const handleOpponentAceSpecClick = () => {
        setOpponentAceSpecUsed(prev => !prev);
    };

    return (
        <div className="game-page">
            <header className="game-header">
                <h1>Pokémon TCG Game</h1>
                <Link to="/" className="button secondary">Back to Home</Link>
            </header>

            <main className="game-board">
                {!isGameStarted ? (
                    <div className="game-setup">
                        <h2>Game Setup</h2>
                        <div className="setup-options">
                            <div className="option">
                                <h3>Player Mode</h3>
                                <div className="radio-group">
                                    <label>
                                        <input type="radio" name="mode" value="single" defaultChecked />
                                        Single Player
                                    </label>
                                    <label>
                                        <input type="radio" name="mode" value="multi" />
                                        Multiplayer
                                    </label>
                                </div>
                            </div>

                            <div className="option">
                                <h3>Select Deck</h3>
                                <select defaultValue="default">
                                    <option value="default" disabled>Choose a deck</option>
                                    <option value="starter">Starter Deck</option>
                                    <option value="custom1">Custom Deck 1</option>
                                    <option value="custom2">Custom Deck 2</option>
                                </select>
                            </div>
                        </div>

                        <button className="button primary" onClick={startGame}>
                            Start Game
                        </button>
                    </div>
                ) : (
                    <GameBoard
                        playerPrizeCards={playerPrizeCards}
                        playerActivePokemon={playerActivePokemon}
                        stadiumCard={stadiumCard}
                        playerVstarUsed={playerVstarUsed}
                        playerGxUsed={playerGxUsed}
                        playerAceSpecUsed={playerAceSpecUsed}
                        opponentVstarUsed={opponentVstarUsed}
                        opponentGxUsed={opponentGxUsed}
                        opponentAceSpecUsed={opponentAceSpecUsed}
                        playerBenchPokemon={playerBenchPokemon}
                        playerDeckCards={playerDeckCards}
                        playerDiscardPileCards={playerDiscardPileCards}
                        playerHandCards={playerHandCards}
                        opponentPrizeCards={opponentPrizeCards}
                        opponentActivePokemon={opponentActivePokemon}
                        opponentBenchPokemon={opponentBenchPokemon}
                        opponentDeckCards={opponentDeckCards}
                        opponentDiscardPileCards={opponentDiscardPileCards}
                        opponentHandCards={opponentHandCards}
                        onPlayerVstarClick={handlePlayerVstarClick}
                        onPlayerGxClick={handlePlayerGxClick}
                        onPlayerAceSpecClick={handlePlayerAceSpecClick}
                        onOpponentVstarClick={handleOpponentVstarClick}
                        onOpponentGxClick={handleOpponentGxClick}
                        onOpponentAceSpecClick={handleOpponentAceSpecClick}
                    />
                )}
            </main>
        </div>
    );
};

export default Game;
