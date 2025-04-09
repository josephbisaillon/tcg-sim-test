import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="not-found-page">
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist or has been moved.</p>
            <div className="not-found-image">
                {/* This could be a sad Pikachu or other Pokémon image */}
                <div className="placeholder-image">?_?</div>
            </div>
            <p>Let's get you back on track!</p>
            <div className="not-found-actions">
                <Link to="/" className="button primary">
                    Return to Home
                </Link>
                <Link to="/game" className="button secondary">
                    Go to Game
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
