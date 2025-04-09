import React, { useState } from 'react';
import { StadiumZone } from '../zones/StadiumZone';
import { CardType, PokemonType } from '../ui';

/**
 * Example component demonstrating the StadiumZone component
 */
const StadiumZoneExample: React.FC = () => {
    // Sample stadium card
    const sampleStadiumCard = {
        id: 'stadium-1',
        name: 'Viridian Forest',
        cardType: CardType.STADIUM,
        description: 'Once during each player\'s turn, that player may discard a card from their hand. If they do, that player searches their deck for a basic Energy card, reveals it, and puts it into their hand. Then that player shuffles their deck.',
        imageUrl: 'https://images.pokemontcg.io/sm9/156.png',
    };

    // State for stadium card
    const [stadiumCard, setStadiumCard] = useState<any>(sampleStadiumCard);
    const [isDropTarget, setIsDropTarget] = useState<boolean>(false);
    const [isFaceDown, setIsFaceDown] = useState<boolean>(false);
    const [isSelectable, setIsSelectable] = useState<boolean>(true);

    // Handle card click
    const handleCardClick = (cardId: string) => {
        console.log(`Stadium card clicked: ${cardId}`);
    };

    // Handle card context menu
    const handleCardContextMenu = (cardId: string, event: React.MouseEvent) => {
        console.log(`Stadium card context menu: ${cardId}`);
    };

    // Handle drag events
    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        setIsDropTarget(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        setIsDropTarget(false);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        setIsDropTarget(false);
        console.log('Card dropped on stadium zone');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Stadium Zone Example</h2>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ width: '200px' }}>
                    <h3>With Stadium Card</h3>
                    <StadiumZone
                        card={stadiumCard}
                        isDropTarget={isDropTarget}
                        faceDown={isFaceDown}
                        selectable={isSelectable}
                        onCardClick={handleCardClick}
                        onCardContextMenu={handleCardContextMenu}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />
                </div>

                <div style={{ width: '200px' }}>
                    <h3>Empty Stadium Zone</h3>
                    <StadiumZone
                        isDropTarget={isDropTarget}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Controls</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button onClick={() => setStadiumCard(sampleStadiumCard)}>
                        Add Stadium Card
                    </button>
                    <button onClick={() => setStadiumCard(null)}>
                        Remove Stadium Card
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={isFaceDown}
                            onChange={() => setIsFaceDown(!isFaceDown)}
                        />
                        Face Down
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={isSelectable}
                            onChange={() => setIsSelectable(!isSelectable)}
                        />
                        Selectable
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={isDropTarget}
                            onChange={() => setIsDropTarget(!isDropTarget)}
                        />
                        Drop Target
                    </label>
                </div>
            </div>

            <div>
                <h3>Drag and Drop</h3>
                <p>
                    Drag a card onto the stadium zone to see the drop target styling.
                    In a real implementation, you would use the HTML5 Drag and Drop API
                    to make cards draggable and handle the drop event.
                </p>
            </div>
        </div>
    );
};

export default StadiumZoneExample;
