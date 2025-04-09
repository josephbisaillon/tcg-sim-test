import React, { useState } from 'react';
import { HandZone } from '../zones';
import { CardType, PokemonType } from '../ui';

/**
 * Example component demonstrating the HandZone component
 */
const HandZoneExample: React.FC = () => {
    // Sample cards for demonstration
    const sampleCards = [
        {
            id: 'hand-1',
            name: 'Pikachu',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.ELECTRIC],
            hp: 70,
        },
        {
            id: 'hand-2',
            name: 'Charizard',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.FIRE],
            hp: 150,
        },
        {
            id: 'hand-3',
            name: 'Blastoise',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.WATER],
            hp: 120,
        },
        {
            id: 'hand-4',
            name: 'Venusaur',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.GRASS],
            hp: 120,
        },
        {
            id: 'hand-5',
            name: 'Mewtwo',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.PSYCHIC],
            hp: 150,
        },
        {
            id: 'hand-6',
            name: 'Snorlax',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.COLORLESS],
            hp: 140,
        },
        {
            id: 'hand-7',
            name: 'Lightning Energy',
            cardType: CardType.ENERGY,
            pokemonTypes: [PokemonType.ELECTRIC],
        },
        {
            id: 'hand-8',
            name: 'Fire Energy',
            cardType: CardType.ENERGY,
            pokemonTypes: [PokemonType.FIRE],
        },
        {
            id: 'hand-9',
            name: 'Water Energy',
            cardType: CardType.ENERGY,
            pokemonTypes: [PokemonType.WATER],
        },
        {
            id: 'hand-10',
            name: 'Grass Energy',
            cardType: CardType.ENERGY,
            pokemonTypes: [PokemonType.GRASS],
        },
        {
            id: 'hand-11',
            name: "Professor's Research",
            cardType: CardType.TRAINER,
        },
        {
            id: 'hand-12',
            name: 'Marnie',
            cardType: CardType.TRAINER,
        },
    ];

    // State for tracking hand cards
    const [playerHand, setPlayerHand] = useState<any[]>(sampleCards.slice(0, 7));
    const [opponentHand, setOpponentHand] = useState<any[]>(sampleCards.slice(7, 10));
    const [isDropTarget, setIsDropTarget] = useState(false);
    const [fanCards, setFanCards] = useState(true);
    const [maxFanAngle, setMaxFanAngle] = useState(20);
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

    // Handle card click
    const handleCardClick = (cardId: string, index: number) => {
        setSelectedCardIndex(index === selectedCardIndex ? null : index);
        console.log(`Clicked card: ${cardId} at index ${index}`);
    };

    // Handle card context menu
    const handleCardContextMenu = (cardId: string, index: number, event: React.MouseEvent) => {
        console.log(`Context menu for card: ${cardId} at index ${index}`);
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
        // and add it to the hand
        console.log('Card dropped on hand zone');
    };

    // Add a card to the hand
    const addCard = () => {
        if (playerHand.length < sampleCards.length) {
            const nextCardIndex = playerHand.length % sampleCards.length;
            setPlayerHand(prev => [...prev, sampleCards[nextCardIndex]]);
        }
    };

    // Remove a card from the hand
    const removeCard = () => {
        if (playerHand.length > 0) {
            setPlayerHand(prev => prev.slice(0, -1));
            if (selectedCardIndex !== null && selectedCardIndex >= playerHand.length - 1) {
                setSelectedCardIndex(null);
            }
        }
    };

    // Play selected card
    const playSelectedCard = () => {
        if (selectedCardIndex !== null) {
            const newHand = [...playerHand];
            newHand.splice(selectedCardIndex, 1);
            setPlayerHand(newHand);
            setSelectedCardIndex(null);
        }
    };

    // Toggle fan cards
    const toggleFanCards = () => {
        setFanCards(prev => !prev);
    };

    // Change max fan angle
    const changeMaxFanAngle = (angle: number) => {
        setMaxFanAngle(angle);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Hand Zone Examples</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '40px' }}>
                {/* Player's hand */}
                <div>
                    <h3>Player's Hand</h3>
                    <HandZone
                        cards={playerHand}
                        isDropTarget={isDropTarget}
                        fanCards={fanCards}
                        maxFanAngle={maxFanAngle}
                        onCardClick={handleCardClick}
                        onCardContextMenu={handleCardContextMenu}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={addCard} disabled={playerHand.length >= sampleCards.length}>
                            Add Card
                        </button>

                        <button onClick={removeCard} disabled={playerHand.length === 0}>
                            Remove Card
                        </button>

                        <button onClick={playSelectedCard} disabled={selectedCardIndex === null}>
                            Play Selected Card
                        </button>

                        <button onClick={toggleFanCards}>
                            {fanCards ? 'Disable Fan' : 'Enable Fan'}
                        </button>

                        <div>
                            <label style={{ marginRight: '10px' }}>Fan Angle:</label>
                            <select
                                value={maxFanAngle}
                                onChange={(e) => changeMaxFanAngle(Number(e.target.value))}
                                style={{ padding: '5px' }}
                            >
                                <option value="10">10°</option>
                                <option value="20">20°</option>
                                <option value="30">30°</option>
                                <option value="45">45°</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Opponent's hand */}
                <div>
                    <h3>Opponent's Hand</h3>
                    <HandZone
                        cards={opponentHand}
                        isOpponent={true}
                        fanCards={fanCards}
                        maxFanAngle={maxFanAngle}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3>Empty Hand</h3>
                <HandZone
                    cards={[]}
                />
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3>Many Cards in Hand</h3>
                <HandZone
                    cards={sampleCards}
                    fanCards={fanCards}
                    maxFanAngle={maxFanAngle}
                />
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3>Hand with Face Down Cards</h3>
                <HandZone
                    cards={sampleCards.slice(0, 5)}
                    faceDown={true}
                    fanCards={fanCards}
                    maxFanAngle={maxFanAngle}
                />
            </div>
        </div>
    );
};

export default HandZoneExample;
