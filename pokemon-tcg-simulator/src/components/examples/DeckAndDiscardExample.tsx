import React, { useState } from 'react';
import { DeckZone, DiscardPileZone } from '../zones';
import { CardType, PokemonType } from '../ui';

/**
 * Example component demonstrating the DeckZone and DiscardPileZone components
 */
const DeckAndDiscardExample: React.FC = () => {
    // Sample cards for demonstration
    const sampleCards = [
        {
            id: 'card-1',
            name: 'Pikachu',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.ELECTRIC],
            hp: 70,
        },
        {
            id: 'card-2',
            name: 'Charizard',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.FIRE],
            hp: 150,
        },
        {
            id: 'card-3',
            name: 'Blastoise',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.WATER],
            hp: 120,
        },
        {
            id: 'card-4',
            name: 'Venusaur',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.GRASS],
            hp: 120,
        },
        {
            id: 'card-5',
            name: 'Mewtwo',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.PSYCHIC],
            hp: 150,
        },
        {
            id: 'card-6',
            name: 'Snorlax',
            cardType: CardType.POKEMON,
            pokemonTypes: [PokemonType.COLORLESS],
            hp: 140,
        },
        {
            id: 'card-7',
            name: 'Lightning Energy',
            cardType: CardType.ENERGY,
            pokemonTypes: [PokemonType.ELECTRIC],
        },
        {
            id: 'card-8',
            name: 'Fire Energy',
            cardType: CardType.ENERGY,
            pokemonTypes: [PokemonType.FIRE],
        },
        {
            id: 'card-9',
            name: 'Water Energy',
            cardType: CardType.ENERGY,
            pokemonTypes: [PokemonType.WATER],
        },
        {
            id: 'card-10',
            name: 'Grass Energy',
            cardType: CardType.ENERGY,
            pokemonTypes: [PokemonType.GRASS],
        },
    ];

    // State for tracking deck and discard pile
    const [playerDeck, setPlayerDeck] = useState<any[]>(sampleCards.slice());
    const [playerDiscard, setPlayerDiscard] = useState<any[]>([]);
    const [opponentDeck, setOpponentDeck] = useState<any[]>(sampleCards.slice(0, 5));
    const [opponentDiscard, setOpponentDiscard] = useState<any[]>(sampleCards.slice(5, 7));
    const [isDeckDropTarget, setIsDeckDropTarget] = useState(false);
    const [isDiscardDropTarget, setIsDiscardDropTarget] = useState(false);

    // Draw a card from the deck to the discard pile
    const drawCard = () => {
        if (playerDeck.length > 0) {
            const drawnCard = playerDeck[playerDeck.length - 1];
            setPlayerDeck(prev => prev.slice(0, -1));
            setPlayerDiscard(prev => [...prev, drawnCard]);
        }
    };

    // Recover a card from the discard pile to the deck
    const recoverCard = () => {
        if (playerDiscard.length > 0) {
            const recoveredCard = playerDiscard[playerDiscard.length - 1];
            setPlayerDiscard(prev => prev.slice(0, -1));
            setPlayerDeck(prev => [...prev, recoveredCard]);
        }
    };

    // Shuffle the deck
    const shuffleDeck = () => {
        setPlayerDeck(prev => {
            const newDeck = [...prev];
            for (let i = newDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
            }
            return newDeck;
        });
    };

    // Handle deck click
    const handleDeckClick = () => {
        drawCard();
    };

    // Handle discard pile click
    const handleDiscardClick = () => {
        // In a real implementation, this might show a modal with all discarded cards
        console.log('Discard pile clicked');
    };

    // Handle drag events for deck
    const handleDeckDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDeckDropTarget(true);
    };

    const handleDeckDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDeckDropTarget(false);
    };

    const handleDeckDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDeckDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDeckDropTarget(false);
        // In a real implementation, you would get the card data from the drag event
        // and add it to the deck
        console.log('Card dropped on deck');
    };

    // Handle drag events for discard pile
    const handleDiscardDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDiscardDropTarget(true);
    };

    const handleDiscardDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDiscardDropTarget(false);
    };

    const handleDiscardDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDiscardDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDiscardDropTarget(false);
        // In a real implementation, you would get the card data from the drag event
        // and add it to the discard pile
        console.log('Card dropped on discard pile');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Deck and Discard Pile Examples</h2>

            <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
                {/* Player's deck and discard pile */}
                <div>
                    <h3>Player's Deck and Discard Pile</h3>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <DeckZone
                            cards={playerDeck}
                            isDropTarget={isDeckDropTarget}
                            onClick={handleDeckClick}
                            onDragEnter={handleDeckDragEnter}
                            onDragLeave={handleDeckDragLeave}
                            onDragOver={handleDeckDragOver}
                            onDrop={handleDeckDrop}
                        />

                        <DiscardPileZone
                            cards={playerDiscard}
                            isDropTarget={isDiscardDropTarget}
                            onClick={handleDiscardClick}
                            onDragEnter={handleDiscardDragEnter}
                            onDragLeave={handleDiscardDragLeave}
                            onDragOver={handleDiscardDragOver}
                            onDrop={handleDiscardDrop}
                        />
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={drawCard} disabled={playerDeck.length === 0}>
                            Draw Card
                        </button>

                        <button onClick={recoverCard} disabled={playerDiscard.length === 0}>
                            Recover Card
                        </button>

                        <button onClick={shuffleDeck} disabled={playerDeck.length === 0}>
                            Shuffle Deck
                        </button>
                    </div>
                </div>

                {/* Opponent's deck and discard pile */}
                <div>
                    <h3>Opponent's Deck and Discard Pile</h3>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <DeckZone
                            cards={opponentDeck}
                            isOpponent={true}
                        />

                        <DiscardPileZone
                            cards={opponentDiscard}
                            isOpponent={true}
                        />
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3>Empty Deck and Discard Pile</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <DeckZone
                        cards={[]}
                    />

                    <DiscardPileZone
                        cards={[]}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3>Deck with Hidden Card Count and Discard Pile with Hidden Top Card</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <DeckZone
                        cards={sampleCards.slice(0, 5)}
                        showCardCount={false}
                    />

                    <DiscardPileZone
                        cards={sampleCards.slice(5, 8)}
                        showTopCard={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default DeckAndDiscardExample;
