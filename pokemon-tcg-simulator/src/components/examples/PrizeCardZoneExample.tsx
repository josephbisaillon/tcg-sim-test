import React, { useState } from 'react';
import { PrizeCardZone, CardType, PokemonType } from '../zones';

/**
 * Example component demonstrating the PrizeCardZone component
 */
const PrizeCardZoneExample: React.FC = () => {
    // Sample cards for demonstration
    const sampleCards = [
        {
            id: 'prize-1',
            name: 'Pikachu',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.ELECTRIC],
            hp: 70,
        },
        {
            id: 'prize-2',
            name: 'Charizard',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.FIRE],
            hp: 150,
        },
        {
            id: 'prize-3',
            name: 'Blastoise',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.WATER],
            hp: 120,
        },
        {
            id: 'prize-4',
            name: 'Venusaur',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.GRASS],
            hp: 120,
        },
        {
            id: 'prize-5',
            name: 'Mewtwo',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.PSYCHIC],
            hp: 150,
        },
        {
            id: 'prize-6',
            name: 'Snorlax',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.COLORLESS],
            hp: 140,
        },
    ];

    // State for tracking prize cards
    const [playerPrizeCards, setPlayerPrizeCards] = useState([...sampleCards]);
    const [opponentPrizeCards, setOpponentPrizeCards] = useState([...sampleCards.slice(0, 4)]);
    const [selectedPrizeCard, setSelectedPrizeCard] = useState<string | null>(null);
    const [faceDown, setFaceDown] = useState(true);

    // Handle card click
    const handleCardClick = (cardId: string, index: number) => {
        setSelectedPrizeCard(cardId);
        console.log(`Selected prize card: ${cardId} at index ${index}`);
    };

    // Handle card context menu
    const handleCardContextMenu = (cardId: string, index: number, event: React.MouseEvent) => {
        console.log(`Context menu for prize card: ${cardId} at index ${index}`);
    };

    // Take a prize card
    const takePrizeCard = () => {
        if (selectedPrizeCard) {
            setPlayerPrizeCards(prevCards =>
                prevCards.filter(card => card.id !== selectedPrizeCard)
            );
            setSelectedPrizeCard(null);
        }
    };

    // Toggle face down state
    const toggleFaceDown = () => {
        setFaceDown(prev => !prev);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Prize Card Zone Examples</h2>

            <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
                {/* Player's prize card zone */}
                <div>
                    <h3>Player's Prize Cards</h3>
                    <PrizeCardZone
                        cards={playerPrizeCards}
                        faceDown={faceDown}
                        selectable={true}
                        onCardClick={handleCardClick}
                        onCardContextMenu={handleCardContextMenu}
                    />

                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={takePrizeCard}
                            disabled={!selectedPrizeCard}
                            style={{ marginRight: '10px' }}
                        >
                            Take Selected Prize Card
                        </button>

                        <button onClick={toggleFaceDown}>
                            {faceDown ? 'Flip Face Up' : 'Flip Face Down'}
                        </button>
                    </div>
                </div>

                {/* Opponent's prize card zone */}
                <div>
                    <h3>Opponent's Prize Cards</h3>
                    <PrizeCardZone
                        cards={opponentPrizeCards}
                        faceDown={true}
                        isOpponent={true}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3>Empty Prize Card Zone</h3>
                <PrizeCardZone
                    cards={[]}
                />
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3>Partially Filled Prize Card Zone</h3>
                <PrizeCardZone
                    cards={sampleCards.slice(0, 3)}
                    faceDown={false}
                />
            </div>

            <div>
                <h3>Custom Max Cards</h3>
                <PrizeCardZone
                    cards={sampleCards.slice(0, 2)}
                    maxCards={4}
                    faceDown={false}
                />
            </div>

            {selectedPrizeCard && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                    <p>Selected prize card: {selectedPrizeCard}</p>
                    <button onClick={() => setSelectedPrizeCard(null)}>Clear Selection</button>
                </div>
            )}
        </div>
    );
};

export default PrizeCardZoneExample;
