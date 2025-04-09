import React from 'react';
import './StatusMarkerZone.css';

export type StatusMarkerType = 'VSTAR' | 'GX' | 'ACE_SPEC';

export interface StatusMarkerZoneProps {
    /**
     * Whether the VSTAR power has been used
     * @default false
     */
    vstarUsed?: boolean;

    /**
     * Whether the GX attack has been used
     * @default false
     */
    gxUsed?: boolean;

    /**
     * Whether the ACE SPEC card has been used
     * @default false
     */
    aceSpecUsed?: boolean;

    /**
     * Callback when the VSTAR marker is clicked
     */
    onVstarClick?: () => void;

    /**
     * Callback when the GX marker is clicked
     */
    onGxClick?: () => void;

    /**
     * Callback when the ACE SPEC marker is clicked
     */
    onAceSpecClick?: () => void;

    /**
     * Whether the markers are interactive
     * @default true
     */
    interactive?: boolean;

    /**
     * Whether this is the opponent's status markers
     * @default false
     */
    isOpponent?: boolean;

    /**
     * Additional CSS class names
     */
    className?: string;
}

/**
 * StatusMarkerZone component for displaying VSTAR, GX, and ACE SPEC markers
 */
export const StatusMarkerZone: React.FC<StatusMarkerZoneProps> = ({
    vstarUsed = false,
    gxUsed = false,
    aceSpecUsed = false,
    onVstarClick,
    onGxClick,
    onAceSpecClick,
    interactive = true,
    isOpponent = false,
    className = '',
}) => {
    // Handle marker click
    const handleMarkerClick = (type: StatusMarkerType) => {
        if (!interactive) return;

        switch (type) {
            case 'VSTAR':
                onVstarClick?.();
                break;
            case 'GX':
                onGxClick?.();
                break;
            case 'ACE_SPEC':
                onAceSpecClick?.();
                break;
        }
    };

    // Determine zone classes
    const zoneClasses = [
        'status-marker-zone',
        isOpponent ? 'status-marker-zone-opponent' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={zoneClasses}
            data-testid="status-marker-zone"
            aria-label={isOpponent ? "Opponent's status markers" : "Your status markers"}
        >
            <div className="status-marker-container">
                <button
                    className={`status-marker status-marker-vstar ${vstarUsed ? 'status-marker-used' : ''}`}
                    onClick={() => handleMarkerClick('VSTAR')}
                    disabled={!interactive}
                    aria-label={`VSTAR power ${vstarUsed ? 'used' : 'available'}`}
                    aria-pressed={vstarUsed}
                    data-testid="vstar-marker"
                >
                    <div className="status-marker-icon">★</div>
                    <div className="status-marker-label">VSTAR</div>
                    <div className="status-marker-state">
                        {vstarUsed ? 'USED' : 'POWER'}
                    </div>
                </button>

                <button
                    className={`status-marker status-marker-gx ${gxUsed ? 'status-marker-used' : ''}`}
                    onClick={() => handleMarkerClick('GX')}
                    disabled={!interactive}
                    aria-label={`GX attack ${gxUsed ? 'used' : 'available'}`}
                    aria-pressed={gxUsed}
                    data-testid="gx-marker"
                >
                    <div className="status-marker-icon">GX</div>
                    <div className="status-marker-label">GX</div>
                    <div className="status-marker-state">
                        {gxUsed ? 'USED' : 'ATTACK'}
                    </div>
                </button>

                <button
                    className={`status-marker status-marker-ace-spec ${aceSpecUsed ? 'status-marker-used' : ''}`}
                    onClick={() => handleMarkerClick('ACE_SPEC')}
                    disabled={!interactive}
                    aria-label={`ACE SPEC card ${aceSpecUsed ? 'used' : 'available'}`}
                    aria-pressed={aceSpecUsed}
                    data-testid="ace-spec-marker"
                >
                    <div className="status-marker-icon">♠</div>
                    <div className="status-marker-label">ACE</div>
                    <div className="status-marker-state">
                        {aceSpecUsed ? 'USED' : 'SPEC'}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default StatusMarkerZone;
