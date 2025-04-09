import React from 'react';
import { CardPlaceholder, CardType, PokemonType } from '../ui';

/**
 * Example component demonstrating different CardPlaceholder variants and states
 */
const CardPlaceholderExample: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h2>Card Placeholder Examples</h2>

            <h3>Zone-specific Placeholders</h3>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div>
                    <h4>Deck</h4>
                    <CardPlaceholder
                        variant="deck"
                        text="Deck"
                    />
                </div>

                <div>
                    <h4>Discard</h4>
                    <CardPlaceholder
                        variant="discard"
                        text="Discard"
                    />
                </div>

                <div>
                    <h4>Prize</h4>
                    <CardPlaceholder
                        variant="prize"
                        text="Prize"
                    />
                </div>

                <div>
                    <h4>Active</h4>
                    <CardPlaceholder
                        variant="active"
                        text="Active"
                    />
                </div>

                <div>
                    <h4>Bench</h4>
                    <CardPlaceholder
                        variant="bench"
                        text="Bench"
                    />
                </div>

                <div>
                    <h4>Hand</h4>
                    <CardPlaceholder
                        variant="hand"
                        text="Hand"
                    />
                </div>

                <div>
                    <h4>Stadium</h4>
                    <CardPlaceholder
                        variant="stadium"
                        text="Stadium"
                        cardType={CardType.STADIUM}
                    />
                </div>
            </div>

            <h3>Card Type Placeholders</h3>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div>
                    <h4>Pokémon</h4>
                    <CardPlaceholder
                        cardType={CardType.POKEMON}
                        text="Pokémon"
                    />
                </div>

                <div>
                    <h4>Energy (Fire)</h4>
                    <CardPlaceholder
                        cardType={CardType.ENERGY}
                        pokemonType={PokemonType.FIRE}
                        text="Fire Energy"
                    />
                </div>

                <div>
                    <h4>Energy (Water)</h4>
                    <CardPlaceholder
                        cardType={CardType.ENERGY}
                        pokemonType={PokemonType.WATER}
                        text="Water Energy"
                    />
                </div>

                <div>
                    <h4>Trainer</h4>
                    <CardPlaceholder
                        cardType={CardType.TRAINER}
                        text="Trainer"
                    />
                </div>

                <div>
                    <h4>Supporter</h4>
                    <CardPlaceholder
                        cardType={CardType.SUPPORTER}
                        text="Supporter"
                    />
                </div>

                <div>
                    <h4>Item</h4>
                    <CardPlaceholder
                        cardType={CardType.ITEM}
                        text="Item"
                    />
                </div>
            </div>

            <h3>State Placeholders</h3>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div>
                    <h4>Loading</h4>
                    <CardPlaceholder
                        isLoading={true}
                        text="Loading"
                    />
                </div>

                <div>
                    <h4>Error</h4>
                    <CardPlaceholder
                        isError={true}
                        text="Error"
                    />
                </div>
            </div>

            <h3>Size Variants</h3>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-end' }}>
                <div>
                    <h4>XS</h4>
                    <CardPlaceholder
                        size="xs"
                        text="XS"
                    />
                </div>

                <div>
                    <h4>SM</h4>
                    <CardPlaceholder
                        size="sm"
                        text="SM"
                    />
                </div>

                <div>
                    <h4>MD (Default)</h4>
                    <CardPlaceholder
                        size="md"
                        text="MD"
                    />
                </div>

                <div>
                    <h4>LG</h4>
                    <CardPlaceholder
                        size="lg"
                        text="LG"
                    />
                </div>

                <div>
                    <h4>XL</h4>
                    <CardPlaceholder
                        size="xl"
                        text="XL"
                    />
                </div>
            </div>

            <h3>Interactive Example</h3>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <CardPlaceholder
                    variant="active"
                    cardType={CardType.POKEMON}
                    text="Click Me"
                    onClick={() => alert('Placeholder clicked!')}
                />
            </div>
        </div>
    );
};

export default CardPlaceholderExample;
