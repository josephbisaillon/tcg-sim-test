import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div className="home-page">
            <h1>Welcome to Pokémon TCG Simulator</h1>
            <p>A web-based simulator for the Pokémon Trading Card Game</p>

            <div className="actions">
                <Link to="/game" className="button primary">
                    Start Game
                </Link>
                <Link to="/deck-builder" className="button secondary">
                    Deck Builder
                </Link>
            </div>

            <div className="features">
                <h2>Features</h2>
                <ul>
                    <li>Authentic Pokémon TCG board layout</li>
                    <li>Drag-and-drop card interactions</li>
                    <li>Support for custom cards</li>
                    <li>Real-time multiplayer gameplay</li>
                    <li>Game state saving and restoration</li>
                </ul>
            </div>
        </div>
    );
};

export default Home;
