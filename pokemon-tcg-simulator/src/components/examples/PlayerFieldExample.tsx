import React, { useState } from 'react';
import { PlayerField } from '../layout/PlayerField';
import { CardType, PokemonType } from '../ui';

/**
 * Example component demonstrating the PlayerField component
 */
const PlayerFieldExample: React.FC = () => {
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
        {
            id: 'card-11',
            name: "Professor's Research",
            cardType: CardType.TRAINER,
        },
        {
            id: 'card-12',
            name: 'Marnie',
            cardType: CardType.TRAINER,
        },
    ];

    // State for player's field
    const [playerPrizeCards, setPlayerPrizeCards] = useState<any[]>(sampleCards.slice(0, 6));
    const [playerActivePokemon, setPlayerActivePokemon] = useState<any>(sampleCards[0]);
    const [playerBenchPokemon, setPlayerBenchPokemon] = useState<any[]>(sampleCards.slice(1, 3));
    const [playerDeckCards, setPlayerDeckCards] = useState<any[]>(sampleCards.slice(6, 10));
    const [playerDiscardPileCards, setPlayerDiscardPileCards] = useState<any[]>([sampleCards[10]]);
    const [playerHandCards, setPlayerHandCards] = useState<any[]>(sampleCards.slice(3, 6));

    // State for opponent's field
    const [opponentPrizeCards, setOpponentPrizeCards] = useState<any[]>(sampleCards.slice(0, 6));
    const [opponentActivePokemon, setOpponentActivePokemon] = useState<any>(sampleCards[4]);
    const [opponentBenchPokemon, setOpponentBenchPokemon] = useState<any[]>(sampleCards.slice(5, 7));
    const [opponentDeckCards, setOpponentDeckCards] = useState<any[]>(sampleCards.slice(7, 11));
    const [opponentDiscardPileCards, setOpponentDiscardPileCards] = useState<any[]>([sampleCards[11]]);
    const [opponentHandCards, setOpponentHandCards] = useState<any[]>(sampleCards.slice(8, 11));

    // State for drop targets
    const [playerDropTargets, setPlayerDropTargets] = useState({
        activePokemon: false,
        benchPokemon: false,
        deck: false,
        discardPile: false,
        hand: false,
    });

    // Handlers for player's field
    const handlePlayerPrizeCardClick = (index: number) => {
        console.log(`Player prize card clicked at index ${index}`);
    };

    const handlePlayerActivePokemonClick = () => {
        console.log('Player active Pokémon clicked');
    };

    const handlePlayerBenchPokemonClick = (index: number) => {
        console.log(`Player bench Pokémon clicked at index ${index}`);
    };

    const handlePlayerDeckClick = () => {
        console.log('Player deck clicked');
        // Draw a card from the deck to the hand
        if (playerDeckCards.length > 0) {
            const drawnCard = playerDeckCards[playerDeckCards.length - 1];
            setPlayerDeckCards(prev => prev.slice(0, -1));
            setPlayerHandCards(prev => [...prev, drawnCard]);
        }
    };

    const handlePlayerDiscardPileClick = () => {
        console.log('Player discard pile clicked');
    };

    const handlePlayerHandCardClick = (cardId: string, index: number) => {
        console.log(`Player hand card clicked: ${cardId} at index ${index}`);

        // Play the card to the bench if it's a Pokémon
        const card = playerHandCards[index];
        if (card.cardType === CardType.POKEMON) {
            setPlayerHandCards(prev => prev.filter((_, i) => i !== index));
            setPlayerBenchPokemon(prev => [...prev, card]);
        }
        // Play the card to the discard pile if it's a Trainer
        else if (card.cardType === CardType.TRAINER) {
            setPlayerHandCards(prev => prev.filter((_, i) => i !== index));
            setPlayerDiscardPileCards(prev => [...prev, card]);
        }
        // Attach the card to the active Pokémon if it's an Energy
        else if (card.cardType === CardType.ENERGY && playerActivePokemon) {
            setPlayerHandCards(prev => prev.filter((_, i) => i !== index));
            // In a real implementation, you would attach the energy to the active Pokémon
            // For this example, we'll just discard it
            setPlayerDiscardPileCards(prev => [...prev, card]);
        }
    };

    const handlePlayerCardContextMenu = (cardId: string, zone: string, index: number, event: React.MouseEvent) => {
        console.log(`Player card context menu: ${cardId} in ${zone} at index ${index}`);
    };

    // Handlers for opponent's field
    const handleOpponentPrizeCardClick = (index: number) => {
        console.log(`Opponent prize card clicked at index ${index}`);
    };

    const handleOpponentActivePokemonClick = () => {
        console.log('Opponent active Pokémon clicked');
    };

    const handleOpponentBenchPokemonClick = (index: number) => {
        console.log(`Opponent bench Pokémon clicked at index ${index}`);
    };

    const handleOpponentDeckClick = () => {
        console.log('Opponent deck clicked');
    };

    const handleOpponentDiscardPileClick = () => {
        console.log('Opponent discard pile clicked');
    };

    const handleOpponentHandCardClick = (cardId: string, index: number) => {
        console.log(`Opponent hand card clicked: ${cardId} at index ${index}`);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Player Field Example</h2>

            <div style={{ marginBottom: '40px' }}>
                <h3>Player's Field</h3>
                <PlayerField
                    prizeCards={playerPrizeCards}
                    activePokemon={playerActivePokemon}
                    benchPokemon={playerBenchPokemon}
                    deckCards={playerDeckCards}
                    discardPileCards={playerDiscardPileCards}
                    handCards={playerHandCards}
                    onPrizeCardClick={handlePlayerPrizeCardClick}
                    onActivePokemonClick={handlePlayerActivePokemonClick}
                    onBenchPokemonClick={handlePlayerBenchPokemonClick}
                    onDeckClick={handlePlayerDeckClick}
                    onDiscardPileClick={handlePlayerDiscardPileClick}
                    onHandCardClick={handlePlayerHandCardClick}
                    onCardContextMenu={handlePlayerCardContextMenu}
                    dropTargets={playerDropTargets}
                />

                <div style={{ marginTop: '20px' }}>
                    <button onClick={handlePlayerDeckClick} disabled={playerDeckCards.length === 0}>
                        Draw Card
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3>Opponent's Field</h3>
                <PlayerField
                    isOpponent={true}
                    prizeCards={opponentPrizeCards}
                    activePokemon={opponentActivePokemon}
                    benchPokemon={opponentBenchPokemon}
                    deckCards={opponentDeckCards}
                    discardPileCards={opponentDiscardPileCards}
                    handCards={opponentHandCards}
                    onPrizeCardClick={handleOpponentPrizeCardClick}
                    onActivePokemonClick={handleOpponentActivePokemonClick}
                    onBenchPokemonClick={handleOpponentBenchPokemonClick}
                    onDeckClick={handleOpponentDeckClick}
                    onDiscardPileClick={handleOpponentDiscardPileClick}
                    onHandCardClick={handleOpponentHandCardClick}
                />
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3>Empty Player Field</h3>
                <PlayerField
                    prizeCards={[]}
                    activePokemon={null}
                    benchPokemon={[]}
                    deckCards={[]}
                    discardPileCards={[]}
                    handCards={[]}
                />
            </div>
        </div>
    );
};

export default PlayerFieldExample;
