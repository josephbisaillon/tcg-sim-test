import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DeckBuilder: React.FC = () => {
    const [deckName, setDeckName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCards, setSelectedCards] = useState<string[]>([]);

    // Mock card data - in a real app, this would come from an API or database
    const mockCards = [
        { id: '1', name: 'Pikachu', type: 'Electric', image: 'pikachu.jpg' },
        { id: '2', name: 'Charizard', type: 'Fire', image: 'charizard.jpg' },
        { id: '3', name: 'Bulbasaur', type: 'Grass', image: 'bulbasaur.jpg' },
        { id: '4', name: 'Squirtle', type: 'Water', image: 'squirtle.jpg' },
        { id: '5', name: 'Jigglypuff', type: 'Fairy', image: 'jigglypuff.jpg' },
    ];

    const filteredCards = mockCards.filter(card =>
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addCardToDeck = (cardId: string) => {
        if (selectedCards.length < 60) {
            setSelectedCards([...selectedCards, cardId]);
        } else {
            alert('Your deck already has 60 cards, which is the maximum allowed.');
        }
    };

    const removeCardFromDeck = (cardId: string) => {
        setSelectedCards(selectedCards.filter(id => id !== cardId));
    };

    const saveDeck = () => {
        if (!deckName) {
            alert('Please enter a deck name');
            return;
        }

        if (selectedCards.length < 20) {
            alert('Your deck must have at least 20 cards');
            return;
        }

        // In a real app, this would save to a database or local storage
        alert(`Deck "${deckName}" saved with ${selectedCards.length} cards!`);
    };

    return (
        <div className="deck-builder-page">
            <header className="deck-builder-header">
                <h1>Deck Builder</h1>
                <Link to="/" className="button secondary">Back to Home</Link>
            </header>

            <div className="deck-builder-content">
                <div className="card-browser">
                    <h2>Card Browser</h2>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search cards by name or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="card-list">
                        {filteredCards.map(card => (
                            <div key={card.id} className="card-item">
                                <div className="card-preview">
                                    {/* In a real app, this would be an actual card image */}
                                    <div className="card-placeholder">{card.name}</div>
                                </div>
                                <div className="card-details">
                                    <h3>{card.name}</h3>
                                    <p>Type: {card.type}</p>
                                    <button
                                        className="button primary small"
                                        onClick={() => addCardToDeck(card.id)}
                                    >
                                        Add to Deck
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="deck-editor">
                    <h2>Deck Editor</h2>
                    <div className="deck-info">
                        <input
                            type="text"
                            placeholder="Enter deck name"
                            value={deckName}
                            onChange={(e) => setDeckName(e.target.value)}
                        />
                        <p>Cards: {selectedCards.length}/60</p>
                    </div>

                    <div className="selected-cards">
                        {selectedCards.map((cardId, index) => {
                            const card = mockCards.find(c => c.id === cardId);
                            return card ? (
                                <div key={`${cardId}-${index}`} className="selected-card">
                                    <span>{card.name}</span>
                                    <button
                                        className="button danger small"
                                        onClick={() => removeCardFromDeck(cardId)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : null;
                        })}
                    </div>

                    <div className="deck-actions">
                        <button className="button primary" onClick={saveDeck}>
                            Save Deck
                        </button>
                        <button
                            className="button secondary"
                            onClick={() => setSelectedCards([])}
                        >
                            Clear Deck
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeckBuilder;
