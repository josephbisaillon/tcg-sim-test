import React, { useState } from 'react';
import { GameBoard } from '../layout/GameBoard';
import { CardType, PokemonType } from '../ui';

/**
 * Example component demonstrating the GameBoard component
 */
const GameBoardExample: React.FC = () => {
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
            id: 'stadium-1',
            name: 'Viridian Forest',
            cardType: CardType.STADIUM,
            description: 'Once during each player\'s turn, that player may discard a card from their hand. If they do, that player searches their deck for a basic Energy card, reveals it, and puts it into their hand. Then that player shuffles their deck.',
            imageUrl: 'https://images.pokemontcg.io/sm9/156.png',
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
    const [playerPrizeCards, setPlayerPrizeCards] = useState<any[]>(sampleCards.slice(2, 8));
    const [playerActivePokemon, setPlayerActivePokemon] = useState<any>(sampleCards[2]);
    const [playerBenchPokemon, setPlayerBenchPokemon] = useState<any[]>(sampleCards.slice(3, 5));
    const [playerDeckCards, setPlayerDeckCards] = useState<any[]>(sampleCards.slice(7, 11));
    const [playerDiscardPileCards, setPlayerDiscardPileCards] = useState<any[]>([sampleCards[11]]);
    const [playerHandCards, setPlayerHandCards] = useState<any[]>(sampleCards.slice(4, 7));

    // State for stadium card
    const [stadiumCard, setStadiumCard] = useState<any>(sampleCards[1]);
    const [isStadiumDropTarget, setIsStadiumDropTarget] = useState<boolean>(false);

    // State for status markers
    const [playerVstarUsed, setPlayerVstarUsed] = useState<boolean>(false);
    const [playerGxUsed, setPlayerGxUsed] = useState<boolean>(false);
    const [playerAceSpecUsed, setPlayerAceSpecUsed] = useState<boolean>(false);
    const [opponentVstarUsed, setOpponentVstarUsed] = useState<boolean>(false);
    const [opponentGxUsed, setOpponentGxUsed] = useState<boolean>(false);
    const [opponentAceSpecUsed, setOpponentAceSpecUsed] = useState<boolean>(false);

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

    const [opponentDropTargets, setOpponentDropTargets] = useState({
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

    // Handlers for stadium card
    const handleStadiumCardClick = (cardId: string) => {
        console.log(`Stadium card clicked: ${cardId}`);
    };

    const handleStadiumCardContextMenu = (cardId: string, event: React.MouseEvent) => {
        console.log(`Stadium card context menu: ${cardId}`);
    };

    // Handlers for status markers
    const handlePlayerVstarClick = () => {
        setPlayerVstarUsed(prev => !prev);
        console.log(`Player VSTAR power ${playerVstarUsed ? 'available' : 'used'}`);
    };

    const handlePlayerGxClick = () => {
        setPlayerGxUsed(prev => !prev);
        console.log(`Player GX attack ${playerGxUsed ? 'available' : 'used'}`);
    };

    const handlePlayerAceSpecClick = () => {
        setPlayerAceSpecUsed(prev => !prev);
        console.log(`Player ACE SPEC card ${playerAceSpecUsed ? 'available' : 'used'}`);
    };

    const handleOpponentVstarClick = () => {
        setOpponentVstarUsed(prev => !prev);
        console.log(`Opponent VSTAR power ${opponentVstarUsed ? 'available' : 'used'}`);
    };

    const handleOpponentGxClick = () => {
        setOpponentGxUsed(prev => !prev);
        console.log(`Opponent GX attack ${opponentGxUsed ? 'available' : 'used'}`);
    };

    const handleOpponentAceSpecClick = () => {
        setOpponentAceSpecUsed(prev => !prev);
        console.log(`Opponent ACE SPEC card ${opponentAceSpecUsed ? 'available' : 'used'}`);
    };

    // Handle card context menu
    const handleCardContextMenu = (cardId: string, side: 'player' | 'opponent', zone: string, index: number, event: React.MouseEvent) => {
        console.log(`Card context menu: ${cardId} on ${side} side in ${zone} at index ${index}`);
    };

    // Handle drag events
    const handleDragEnter = (side: 'player' | 'opponent' | 'stadium', zone: string, event: React.DragEvent<HTMLDivElement>) => {
        console.log(`Drag enter: ${side} ${zone}`);
    };

    const handleDragLeave = (side: 'player' | 'opponent' | 'stadium', zone: string, event: React.DragEvent<HTMLDivElement>) => {
        console.log(`Drag leave: ${side} ${zone}`);
    };

    const handleDragOver = (side: 'player' | 'opponent' | 'stadium', zone: string, event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault(); // Necessary to allow dropping
        console.log(`Drag over: ${side} ${zone}`);
    };

    const handleDrop = (side: 'player' | 'opponent' | 'stadium', zone: string, event: React.DragEvent<HTMLDivElement>) => {
        console.log(`Drop: ${side} ${zone}`);
    };

    return (
        <div style={{ height: '100vh', width: '100%' }}>
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
                hidePlayerHand={false}
                hideOpponentHand={true}
                isStadiumDropTarget={isStadiumDropTarget}
                onPlayerPrizeCardClick={handlePlayerPrizeCardClick}
                onPlayerActivePokemonClick={handlePlayerActivePokemonClick}
                onPlayerBenchPokemonClick={handlePlayerBenchPokemonClick}
                onPlayerDeckClick={handlePlayerDeckClick}
                onPlayerDiscardPileClick={handlePlayerDiscardPileClick}
                onPlayerHandCardClick={handlePlayerHandCardClick}
                onOpponentPrizeCardClick={handleOpponentPrizeCardClick}
                onOpponentActivePokemonClick={handleOpponentActivePokemonClick}
                onOpponentBenchPokemonClick={handleOpponentBenchPokemonClick}
                onOpponentDeckClick={handleOpponentDeckClick}
                onOpponentDiscardPileClick={handleOpponentDiscardPileClick}
                onOpponentHandCardClick={handleOpponentHandCardClick}
                onStadiumCardClick={handleStadiumCardClick}
                onStadiumCardContextMenu={handleStadiumCardContextMenu}
                onPlayerVstarClick={handlePlayerVstarClick}
                onPlayerGxClick={handlePlayerGxClick}
                onPlayerAceSpecClick={handlePlayerAceSpecClick}
                onOpponentVstarClick={handleOpponentVstarClick}
                onOpponentGxClick={handleOpponentGxClick}
                onOpponentAceSpecClick={handleOpponentAceSpecClick}
                onCardContextMenu={handleCardContextMenu}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                playerDropTargets={playerDropTargets}
                opponentDropTargets={opponentDropTargets}
            />

            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <button onClick={handlePlayerDeckClick} disabled={playerDeckCards.length === 0}>
                    Draw Card
                </button>
                <button onClick={() => {
                    // Reset the game state
                    setPlayerPrizeCards(sampleCards.slice(0, 6));
                    setPlayerActivePokemon(sampleCards[0]);
                    setPlayerBenchPokemon(sampleCards.slice(1, 3));
                    setPlayerDeckCards(sampleCards.slice(6, 10));
                    setPlayerDiscardPileCards([sampleCards[10]]);
                    setPlayerHandCards(sampleCards.slice(3, 6));

                    setOpponentPrizeCards(sampleCards.slice(0, 6));
                    setOpponentActivePokemon(sampleCards[4]);
                    setOpponentBenchPokemon(sampleCards.slice(5, 7));
                    setOpponentDeckCards(sampleCards.slice(7, 11));
                    setOpponentDiscardPileCards([sampleCards[11]]);
                    setOpponentHandCards(sampleCards.slice(8, 11));
                }}>
                    Reset Game
                </button>
            </div>
        </div>
    );
};

export default GameBoardExample;
