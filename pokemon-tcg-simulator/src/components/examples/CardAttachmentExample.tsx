import React, { useState } from 'react';
import { Card, CardAttachment, CardType, PokemonType } from '../ui';

/**
 * Example component demonstrating different CardAttachment visualizations
 */
const CardAttachmentExample: React.FC = () => {
    // Sample cards for demonstration
    const pokemonCard = {
        id: 'pokemon-1',
        name: 'Pikachu',
        cardType: CardType.POKEMON,
        pokemonTypes: [PokemonType.ELECTRIC],
        hp: 70,
    };

    const energyCard = {
        id: 'energy-1',
        name: 'Lightning Energy',
        cardType: CardType.ENERGY,
        pokemonTypes: [PokemonType.ELECTRIC],
    };

    const toolCard = {
        id: 'tool-1',
        name: 'Choice Band',
        cardType: CardType.TOOL,
    };

    const evolutionCard = {
        id: 'evolution-1',
        name: 'Raichu',
        cardType: CardType.POKEMON,
        pokemonTypes: [PokemonType.ELECTRIC],
        isEvolution: true,
        evolvesFrom: 'Pikachu',
        hp: 120,
    };

    // State for tracking selected attachments
    const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);

    // Handle attachment click
    const handleAttachmentClick = (card: any) => {
        setSelectedAttachment(card.id);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Card Attachment Visualization Examples</h2>

            <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
                {/* Base Pokémon card with attachments */}
                <div>
                    <h3>Pokémon Card with Attachments</h3>
                    <div style={{ position: 'relative', width: '200px', height: '280px' }}>
                        <Card
                            {...pokemonCard}
                            size="lg"
                            variant="active"
                            selectable={true}
                        />

                        {/* Energy attachments */}
                        <CardAttachment
                            card={energyCard}
                            attachmentType="energy"
                            index={0}
                            total={3}
                            size="sm"
                            selectable={true}
                            selected={selectedAttachment === energyCard.id}
                            onClick={handleAttachmentClick}
                        />

                        <CardAttachment
                            card={{
                                ...energyCard,
                                id: 'energy-2',
                                name: 'Fire Energy',
                                pokemonTypes: [PokemonType.FIRE],
                            }}
                            attachmentType="energy"
                            index={1}
                            total={3}
                            size="sm"
                            selectable={true}
                            selected={selectedAttachment === 'energy-2'}
                            onClick={handleAttachmentClick}
                        />

                        <CardAttachment
                            card={{
                                ...energyCard,
                                id: 'energy-3',
                                name: 'Water Energy',
                                pokemonTypes: [PokemonType.WATER],
                            }}
                            attachmentType="energy"
                            index={2}
                            total={3}
                            size="sm"
                            selectable={true}
                            selected={selectedAttachment === 'energy-3'}
                            onClick={handleAttachmentClick}
                        />

                        {/* Tool attachment */}
                        <CardAttachment
                            card={toolCard}
                            attachmentType="tool"
                            index={0}
                            total={1}
                            size="sm"
                            selectable={true}
                            selected={selectedAttachment === toolCard.id}
                            onClick={handleAttachmentClick}
                        />
                    </div>
                </div>

                {/* Evolution example */}
                <div>
                    <h3>Evolution Card Example</h3>
                    <div style={{ position: 'relative', width: '200px', height: '280px' }}>
                        <Card
                            {...evolutionCard}
                            size="lg"
                            variant="active"
                            selectable={true}
                        />

                        <CardAttachment
                            card={pokemonCard}
                            attachmentType="evolution"
                            index={0}
                            total={1}
                            size="sm"
                            selectable={true}
                            selected={selectedAttachment === pokemonCard.id}
                            onClick={handleAttachmentClick}
                        />

                        {/* Energy attachments */}
                        <CardAttachment
                            card={{
                                ...energyCard,
                                id: 'energy-4',
                                name: 'Lightning Energy',
                            }}
                            attachmentType="energy"
                            index={0}
                            total={2}
                            size="sm"
                            selectable={true}
                            selected={selectedAttachment === 'energy-4'}
                            onClick={handleAttachmentClick}
                        />

                        <CardAttachment
                            card={{
                                ...energyCard,
                                id: 'energy-5',
                                name: 'Lightning Energy',
                            }}
                            attachmentType="energy"
                            index={1}
                            total={2}
                            size="sm"
                            selectable={true}
                            selected={selectedAttachment === 'energy-5'}
                            onClick={handleAttachmentClick}
                        />
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Individual Attachment Types</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div>
                        <h4>Energy</h4>
                        <CardAttachment
                            card={energyCard}
                            attachmentType="energy"
                            index={0}
                            total={1}
                            size="md"
                            selectable={true}
                        />
                    </div>

                    <div>
                        <h4>Tool</h4>
                        <CardAttachment
                            card={toolCard}
                            attachmentType="tool"
                            index={0}
                            total={1}
                            size="md"
                            selectable={true}
                        />
                    </div>

                    <div>
                        <h4>Evolution</h4>
                        <CardAttachment
                            card={evolutionCard}
                            attachmentType="evolution"
                            index={0}
                            total={1}
                            size="md"
                            selectable={true}
                        />
                    </div>

                    <div>
                        <h4>Other</h4>
                        <CardAttachment
                            card={{
                                id: 'other-1',
                                name: 'Other Card',
                                cardType: CardType.TRAINER,
                            }}
                            attachmentType="other"
                            index={0}
                            total={1}
                            size="md"
                            selectable={true}
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3>Size Variants</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div>
                        <h4>XS</h4>
                        <CardAttachment
                            card={energyCard}
                            attachmentType="energy"
                            index={0}
                            total={1}
                            size="xs"
                            selectable={true}
                        />
                    </div>

                    <div>
                        <h4>SM</h4>
                        <CardAttachment
                            card={energyCard}
                            attachmentType="energy"
                            index={0}
                            total={1}
                            size="sm"
                            selectable={true}
                        />
                    </div>

                    <div>
                        <h4>MD</h4>
                        <CardAttachment
                            card={energyCard}
                            attachmentType="energy"
                            index={0}
                            total={1}
                            size="md"
                            selectable={true}
                        />
                    </div>

                    <div>
                        <h4>LG</h4>
                        <CardAttachment
                            card={energyCard}
                            attachmentType="energy"
                            index={0}
                            total={1}
                            size="lg"
                            selectable={true}
                        />
                    </div>

                    <div>
                        <h4>XL</h4>
                        <CardAttachment
                            card={energyCard}
                            attachmentType="energy"
                            index={0}
                            total={1}
                            size="xl"
                            selectable={true}
                        />
                    </div>
                </div>
            </div>

            {selectedAttachment && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                    <p>Selected attachment: {selectedAttachment}</p>
                    <button onClick={() => setSelectedAttachment(null)}>Clear Selection</button>
                </div>
            )}
        </div>
    );
};

export default CardAttachmentExample;
