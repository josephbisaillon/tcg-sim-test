import React, { useState } from 'react';
import { ActivePokemonZone } from '../zones';
import { CardType, PokemonType } from '../ui';

/**
 * Example component demonstrating the ActivePokemonZone component
 */
const ActivePokemonZoneExample: React.FC = () => {
    // Sample Pokémon card for demonstration
    const samplePokemonCard = {
        id: 'pokemon-1',
        name: 'Pikachu',
        cardType: CardType.POKEMON,
        pokemonTypes: [PokemonType.ELECTRIC],
        hp: 70,
    };

    // State for tracking active Pokémon
    const [playerActivePokemon, setPlayerActivePokemon] = useState<any | null>(samplePokemonCard);
    const [opponentActivePokemon, setOpponentActivePokemon] = useState<any | null>(null);
    const [isDropTarget, setIsDropTarget] = useState(false);
    const [faceDown, setFaceDown] = useState(false);

    // Handle card click
    const handleCardClick = (cardId: string) => {
        console.log(`Clicked active Pokémon: ${cardId}`);
    };

    // Handle card context menu
    const handleCardContextMenu = (cardId: string, event: React.MouseEvent) => {
        console.log(`Context menu for active Pokémon: ${cardId}`);
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
        // and set it as the active Pokémon
        console.log('Card dropped on active Pokémon zone');
    };

    // Toggle active Pokémon
    const toggleActivePokemon = () => {
        setPlayerActivePokemon((prev: any) => prev ? null : samplePokemonCard);
    };

    // Toggle opponent's active Pokémon
    const toggleOpponentActivePokemon = () => {
        setOpponentActivePokemon((prev: any) => prev ? null : {
            ...samplePokemonCard,
            id: 'opponent-pokemon-1',
            name: 'Charizard',
            pokemonTypes: [PokemonType.FIRE],
            hp: 150,
        });
    };

    // Toggle face down state
    const toggleFaceDown = () => {
        setFaceDown((prev: boolean) => !prev);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Active Pokémon Zone Examples</h2>

            <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
                {/* Player's active Pokémon zone */}
                <div>
                    <h3>Player's Active Pokémon</h3>
                    <ActivePokemonZone
                        card={playerActivePokemon}
                        selectable={true}
                        faceDown={faceDown}
                        isDropTarget={isDropTarget}
                        onCardClick={handleCardClick}
                        onCardContextMenu={handleCardContextMenu}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />

                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={toggleActivePokemon}
                            style={{ marginRight: '10px' }}
                        >
                            {playerActivePokemon ? 'Remove Active Pokémon' : 'Add Active Pokémon'}
                        </button>

                        <button onClick={toggleFaceDown}>
                            {faceDown ? 'Flip Face Up' : 'Flip Face Down'}
                        </button>
                    </div>
                </div>

                {/* Opponent's active Pokémon zone */}
                <div>
                    <h3>Opponent's Active Pokémon</h3>
                    <ActivePokemonZone
                        card={opponentActivePokemon}
                        isOpponent={true}
                        faceDown={true}
                    />

                    <div style={{ marginTop: '20px' }}>
                        <button onClick={toggleOpponentActivePokemon}>
                            {opponentActivePokemon ? 'Remove Opponent Active Pokémon' : 'Add Opponent Active Pokémon'}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3>Empty Active Pokémon Zone</h3>
                <ActivePokemonZone />
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3>Drop Target Active Pokémon Zone</h3>
                <ActivePokemonZone
                    isDropTarget={true}
                />
            </div>
        </div>
    );
};

export default ActivePokemonZoneExample;
