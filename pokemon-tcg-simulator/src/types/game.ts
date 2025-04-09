/**
 * This file contains all the type definitions for the game state.
 * These types are used throughout the application to ensure type safety.
 */

// Card Types
export enum CardType {
    POKEMON = 'pokemon',
    ENERGY = 'energy',
    TRAINER = 'trainer',
    STADIUM = 'stadium',
    TOOL = 'tool',
    SUPPORTER = 'supporter',
    ITEM = 'item',
}

// Pokémon Types
export enum PokemonType {
    NORMAL = 'normal',
    FIRE = 'fire',
    WATER = 'water',
    ELECTRIC = 'electric',
    GRASS = 'grass',
    ICE = 'ice',
    FIGHTING = 'fighting',
    POISON = 'poison',
    GROUND = 'ground',
    FLYING = 'flying',
    PSYCHIC = 'psychic',
    BUG = 'bug',
    ROCK = 'rock',
    GHOST = 'ghost',
    DRAGON = 'dragon',
    DARK = 'dark',
    STEEL = 'steel',
    FAIRY = 'fairy',
    COLORLESS = 'colorless',
}

// Special Conditions
export enum SpecialCondition {
    ASLEEP = 'asleep',
    CONFUSED = 'confused',
    PARALYZED = 'paralyzed',
    POISONED = 'poisoned',
    BURNED = 'burned',
}

// Game Phases
export enum GamePhase {
    SETUP = 'setup',
    DRAW = 'draw',
    PLAY = 'play',
    ATTACK = 'attack',
    END = 'end',
}

// Zone Types
export enum ZoneType {
    DECK = 'deck',
    HAND = 'hand',
    ACTIVE = 'active',
    BENCH = 'bench',
    DISCARD = 'discard',
    PRIZE = 'prize',
    STADIUM = 'stadium',
    LOST = 'lost', // Lost zone
}

// Card interface
export interface Card {
    id: string;
    name: string;
    imageUrl: string;
    cardType: CardType;
    isRevealed: boolean;
    owner: string; // Player ID

    // Optional properties based on card type
    pokemonType?: PokemonType[];
    hp?: number;
    stage?: number;
    evolvesFrom?: string;
    retreat?: number;
    weakness?: { type: PokemonType; value: number }[];
    resistance?: { type: PokemonType; value: number }[];
    attacks?: Attack[];
    abilities?: Ability[];
    energyType?: PokemonType;
    effect?: string;
    rules?: string[];

    // Game state properties
    damage?: number;
    specialConditions?: SpecialCondition[];
    attachedCards?: string[]; // IDs of attached cards
    counters?: { type: string; count: number }[];
    isActive?: boolean;
    isTapped?: boolean; // For cards that are "used" this turn

    // Special card properties
    isGX?: boolean;
    isVSTAR?: boolean;
    isVMAX?: boolean;
    isPrism?: boolean;
    isTagTeam?: boolean;
}

// Attack interface
export interface Attack {
    name: string;
    cost: { [key in PokemonType]?: number };
    damage: number;
    effect?: string;
    text?: string;
}

// Ability interface
export interface Ability {
    name: string;
    type: 'ability' | 'power' | 'ancient trait';
    effect: string;
    text?: string;
}

// Player interface
export interface Player {
    id: string;
    username: string;
    avatar?: string;
    isActive: boolean;

    // Game state
    deck: Card[];
    hand: Card[];
    active: Card | null;
    bench: Card[];
    discard: Card[];
    prizes: Card[];

    // Player state
    hasPlayedEnergy: boolean;
    hasDoneTurn: boolean;
    isReady: boolean;

    // Special markers
    hasUsedGX: boolean;
    hasUsedVSTAR: boolean;
}

// Zone interface
export interface Zone {
    id: string;
    type: ZoneType;
    playerId: string;
    cards: string[]; // Card IDs
    maxSize?: number; // Maximum number of cards in the zone
}

// Game state interface
export interface GameState {
    id: string;
    players: { [key: string]: Player };
    activePlayer: string; // Player ID
    phase: GamePhase;
    turn: number;
    stadium: Card | null;
    zones: { [key: string]: Zone };

    // Game status
    isStarted: boolean;
    isEnded: boolean;
    winner: string | null;

    // Action history
    actions: GameAction[];

    // Timestamps
    createdAt: string;
    updatedAt: string;
    startedAt?: string;
    endedAt?: string;
}

// Game action interface
export interface GameAction {
    id: string;
    type: GameActionType;
    playerId: string;
    timestamp: string;
    data: any;
    undoable: boolean;
}

// Game action types
export enum GameActionType {
    // Setup actions
    SETUP_GAME = 'setup_game',
    SHUFFLE_DECK = 'shuffle_deck',
    DRAW_STARTING_HAND = 'draw_starting_hand',
    PLACE_ACTIVE = 'place_active',
    PLACE_BENCH = 'place_bench',
    PLACE_PRIZES = 'place_prizes',

    // Turn actions
    START_TURN = 'start_turn',
    END_TURN = 'end_turn',
    CHANGE_PHASE = 'change_phase',

    // Card movement actions
    DRAW_CARD = 'draw_card',
    PLAY_CARD = 'play_card',
    MOVE_CARD = 'move_card',
    ATTACH_ENERGY = 'attach_energy',
    EVOLVE_POKEMON = 'evolve_pokemon',
    RETREAT_POKEMON = 'retreat_pokemon',
    DISCARD_CARD = 'discard_card',

    // Game actions
    USE_ATTACK = 'use_attack',
    USE_ABILITY = 'use_ability',
    APPLY_DAMAGE = 'apply_damage',
    APPLY_SPECIAL_CONDITION = 'apply_special_condition',
    REMOVE_SPECIAL_CONDITION = 'remove_special_condition',
    TAKE_PRIZE = 'take_prize',

    // Special actions
    USE_GX = 'use_gx',
    USE_VSTAR = 'use_vstar',
    FLIP_COIN = 'flip_coin',
    ROLL_DIE = 'roll_die',

    // Meta actions
    UNDO = 'undo',
    REDO = 'redo',
    CONCEDE = 'concede',
    OFFER_DRAW = 'offer_draw',
    ACCEPT_DRAW = 'accept_draw',
    DECLINE_DRAW = 'decline_draw',
}

// Card movement data
export interface CardMovementData {
    cardId: string;
    sourceZone: ZoneType;
    targetZone: ZoneType;
    sourcePlayerId: string;
    targetPlayerId: string;
    position?: number; // Position in the target zone
}

// Damage data
export interface DamageData {
    sourceCardId: string;
    targetCardId: string;
    amount: number;
    isCritical?: boolean;
    isResisted?: boolean;
    isWeak?: boolean;
}

// Special condition data
export interface SpecialConditionData {
    cardId: string;
    condition: SpecialCondition;
    sourceCardId?: string;
}

// Attack data
export interface AttackData {
    attackerId: string;
    attackName: string;
    targetId?: string;
    damage?: number;
    effect?: string;
}

// Ability data
export interface AbilityData {
    cardId: string;
    abilityName: string;
    targetId?: string;
    effect?: string;
}

// Coin flip data
export interface CoinFlipData {
    result: 'heads' | 'tails';
    reason?: string;
}

// Die roll data
export interface DieRollData {
    result: number;
    sides: number;
    reason?: string;
}

// Game result
export enum GameResult {
    WIN = 'win',
    LOSS = 'loss',
    DRAW = 'draw',
    CONCEDE = 'concede',
}

// Game settings
export interface GameSettings {
    timeLimit?: number; // Time limit in seconds
    prizeCount: number; // Number of prize cards
    allowSpectators: boolean;
    isRanked: boolean;
    format?: string; // Game format (standard, expanded, etc.)
    deckValidation: boolean;
}

// Deck interface
export interface Deck {
    id: string;
    name: string;
    format: string;
    cards: { [cardId: string]: number }; // Card ID to count mapping
    owner: string; // Player ID
    isValid: boolean;
    createdAt: string;
    updatedAt: string;
}

// Export all types directly
// No need for a namespace as it creates circular references
