import React, { useState } from 'react';
import { BenchZone } from '../zones';
import { CardType, PokemonType } from '../ui';

/**
 * Example component demonstrating the BenchZone component
 */
const BenchZoneExample: React.FC = () => {
    // Sample Pokémon cards for demonstration
    const samplePokemonCards = [
        {
            id: 'bench-1',
            name: 'Pikachu',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.ELECTRIC],
            hp: 70,
        },
        {
            id: 'bench-2',
            name: 'Charmander',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.FIRE],
            hp: 70,
        },
        {
            id: 'bench-3',
            name: 'Squirtle',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.WATER],
            hp: 70,
        },
        {
            id: 'bench-4',
            name: 'Bulbasaur',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.GRASS],
            hp: 70,
        },
        {
            id: 'bench-5',
            name: 'Jigglypuff',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.FAIRY],
            hp: 70,
        },
        {
            id: 'bench-6',
            name: 'Meowth',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.NORMAL],
            hp: 70,
        },
        {
            id: 'bench-7',
            name: 'Psyduck',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.WATER],
            hp: 70,
        },
        {
            id: 'bench-8',
            name: 'Geodude',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.FIGHTING],
            hp: 70,
        },
    ];

    // State for tracking bench Pokémon
    const [playerBenchCards, setPlayerBenchCards] = useState<any[]>(samplePokemonCards.slice(0, 3));
    const [opponentBenchCards, setOpponentBenchCards] = useState<any[]>(samplePokemonCards.slice(3, 5));
    const [isDropTarget, setIsDropTarget] = useState(false);
    const [faceDown, setFaceDown] = useState(false);
    const [maxCards, setMaxCards] = useState(8);

    // Handle card click
    const handleCardClick = (cardId: string, index: number) => {
        console.log(`Clicked bench Pokémon: ${cardId} at index ${index}`);
    };

    // Handle card context menu
    const handleCardContextMenu = (cardId: string, index: number, event: React.MouseEvent) => {
        console.log(`Context menu for bench Pokémon: ${cardId} at index ${index}`);
    };

    // Handle drag events
    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDropTarget(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDropTarget(false);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDropTarget(false);
        // In a real implementation, you would get the card data from the drag event
        // and add it to the bench
        console.log('Card dropped on bench zone');
    };

    // Add a card to the bench
    const addCard = () => {
        if (playerBenchCards.length < maxCards) {
            const nextCardIndex = playerBenchCards.length;
            setPlayerBenchCards(prev => [...prev, samplePokemonCards[nextCardIndex % samplePokemonCards.length]]);
        }
    };

    // Remove a card from the bench
    const removeCard = () => {
        if (playerBenchCards.length > 0) {
            setPlayerBenchCards(prev => prev.slice(0, -1));
        }
    };

    // Toggle face down state
    const toggleFaceDown = () => {
        setFaceDown(prev => !prev);
    };

    // Change max cards
    const changeMaxCards = (newMax: number) => {
        setMaxCards(newMax);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Bench Zone Examples</h2>

            <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
                {/* Player's bench zone */}
                <div style={{ width: '100%', maxWidth: '800px' }}>
                    <h3>Player's Bench</h3>
                    <BenchZone
                        cards={playerBenchCards}
                        selectable={true}
                        faceDown={faceDown}
                        isDropTarget={isDropTarget}
                        maxCards={maxCards}
                        onCardClick={handleCardClick}
                        onCardContextMenu={handleCardContextMenu}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={addCard}
                            disabled={playerBenchCards.length >= maxCards}
                        >
                            Add Card
                        </button>

                        <button
                            onClick={removeCard}
                            disabled={playerBenchCards.length === 0}
                        >
                            Remove Card
                        </button>

                        <button onClick={toggleFaceDown}>
                            {faceDown ? 'Flip Face Up' : 'Flip Face Down'}
                        </button>

                        <div>
                            <label style={{ marginRight: '10px' }}>Max Cards:</label>
                            <select
                                value={maxCards}
                                onChange={(e) => changeMaxCards(Number(e.target.value))}
                                style={{ padding: '5px' }}
                            >
                                <option value="5">5</option>
                                <option value="8">8</option>
                                <option value="10">10</option>
                                <option value="15">15</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Opponent's bench zone */}
                <div style={{ width: '100%', maxWidth: '800px' }}>
                    <h3>Opponent's Bench</h3>
                    <BenchZone
                        cards={opponentBenchCards}
                        isOpponent={true}
                        faceDown={true}
                        maxCards={maxCards}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '40px', width: '100%', maxWidth: '800px' }}>
                <h3>Empty Bench Zone</h3>
                <BenchZone
                    cards={[]}
                    maxCards={maxCards}
                />
            </div>

            <div style={{ marginBottom: '40px', width: '100%', maxWidth: '800px' }}>
                <h3>Full Bench Zone</h3>
                <BenchZone
                    cards={samplePokemonCards.slice(0, maxCards)}
                    maxCards={maxCards}
                    faceDown={false}
                />
            </div>

            <div style={{ marginBottom: '40px', width: '100%', maxWidth: '800px' }}>
                <h3>Drop Target Bench Zone</h3>
                <BenchZone
                    cards={samplePokemonCards.slice(0, 2)}
                    isDropTarget={true}
                    maxCards={maxCards}
                />
            </div>
        </div>
    );
};

export default BenchZoneExample;
