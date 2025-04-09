// Zones Components Barrel File
// This file exports all zone components for easier imports

export { PrizeCardZone, type PrizeCardZoneProps } from './PrizeCardZone';
export { ActivePokemonZone, type ActivePokemonZoneProps } from './ActivePokemonZone';
export { BenchZone, type BenchZoneProps } from './BenchZone';
export { DeckZone, type DeckZoneProps } from './DeckZone';
export { DiscardPileZone, type DiscardPileZoneProps } from './DiscardPileZone';
export { HandZone, type HandZoneProps } from './HandZone';
export { StadiumZone, type StadiumZoneProps } from './StadiumZone';
export { StatusMarkerZone, type StatusMarkerZoneProps, type StatusMarkerType } from './StatusMarkerZone';

// Re-export game types that are used by zone components
export { CardType, PokemonType, SpecialCondition } from '../../types/game';
