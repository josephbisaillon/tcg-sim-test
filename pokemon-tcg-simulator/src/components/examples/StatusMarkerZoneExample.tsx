import React, { useState } from 'react';
import { StatusMarkerZone } from '../zones/StatusMarkerZone';

/**
 * Example component demonstrating the StatusMarkerZone component
 */
const StatusMarkerZoneExample: React.FC = () => {
    // State for player's status markers
    const [playerVstarUsed, setPlayerVstarUsed] = useState(false);
    const [playerGxUsed, setPlayerGxUsed] = useState(false);
    const [playerAceSpecUsed, setPlayerAceSpecUsed] = useState(false);

    // State for opponent's status markers
    const [opponentVstarUsed, setOpponentVstarUsed] = useState(false);
    const [opponentGxUsed, setOpponentGxUsed] = useState(false);
    const [opponentAceSpecUsed, setOpponentAceSpecUsed] = useState(false);

    // Handlers for player's status markers
    const handlePlayerVstarClick = () => {
        setPlayerVstarUsed(prev => !prev);
    };

    const handlePlayerGxClick = () => {
        setPlayerGxUsed(prev => !prev);
    };

    const handlePlayerAceSpecClick = () => {
        setPlayerAceSpecUsed(prev => !prev);
    };

    // Handlers for opponent's status markers
    const handleOpponentVstarClick = () => {
        setOpponentVstarUsed(prev => !prev);
    };

    const handleOpponentGxClick = () => {
        setOpponentGxUsed(prev => !prev);
    };

    const handleOpponentAceSpecClick = () => {
        setOpponentAceSpecUsed(prev => !prev);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            <h1>Status Marker Zone Examples</h1>

            <section>
                <h2>Player's Status Markers</h2>
                <p>Click on a marker to toggle its state.</p>
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <StatusMarkerZone
                        vstarUsed={playerVstarUsed}
                        gxUsed={playerGxUsed}
                        aceSpecUsed={playerAceSpecUsed}
                        onVstarClick={handlePlayerVstarClick}
                        onGxClick={handlePlayerGxClick}
                        onAceSpecClick={handlePlayerAceSpecClick}
                    />
                </div>
                <div style={{ marginTop: '1rem' }}>
                    <p>Current state:</p>
                    <ul>
                        <li>VSTAR Power: {playerVstarUsed ? 'Used' : 'Available'}</li>
                        <li>GX Attack: {playerGxUsed ? 'Used' : 'Available'}</li>
                        <li>ACE SPEC Card: {playerAceSpecUsed ? 'Used' : 'Available'}</li>
                    </ul>
                </div>
            </section>

            <section>
                <h2>Opponent's Status Markers</h2>
                <p>Click on a marker to toggle its state.</p>
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <StatusMarkerZone
                        vstarUsed={opponentVstarUsed}
                        gxUsed={opponentGxUsed}
                        aceSpecUsed={opponentAceSpecUsed}
                        onVstarClick={handleOpponentVstarClick}
                        onGxClick={handleOpponentGxClick}
                        onAceSpecClick={handleOpponentAceSpecClick}
                        isOpponent={true}
                    />
                </div>
                <div style={{ marginTop: '1rem' }}>
                    <p>Current state:</p>
                    <ul>
                        <li>VSTAR Power: {opponentVstarUsed ? 'Used' : 'Available'}</li>
                        <li>GX Attack: {opponentGxUsed ? 'Used' : 'Available'}</li>
                        <li>ACE SPEC Card: {opponentAceSpecUsed ? 'Used' : 'Available'}</li>
                    </ul>
                </div>
            </section>

            <section>
                <h2>Non-Interactive Status Markers</h2>
                <p>These markers cannot be clicked.</p>
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <StatusMarkerZone
                        vstarUsed={true}
                        gxUsed={false}
                        aceSpecUsed={true}
                        interactive={false}
                    />
                </div>
            </section>

            <section>
                <h2>Reset All Markers</h2>
                <button
                    onClick={() => {
                        setPlayerVstarUsed(false);
                        setPlayerGxUsed(false);
                        setPlayerAceSpecUsed(false);
                        setOpponentVstarUsed(false);
                        setOpponentGxUsed(false);
                        setOpponentAceSpecUsed(false);
                    }}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Reset All Markers
                </button>
            </section>
        </div>
    );
};

export default StatusMarkerZoneExample;
