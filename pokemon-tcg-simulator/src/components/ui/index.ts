// UI Components Barrel File
// This file exports all UI components for easier imports

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';
export { Card, type CardProps, type CardVariant, type CardSize, type CardRarity, type CardGeneration } from './Card';
export { CardFace, type CardFaceProps } from './CardFace';
export { CardBack, type CardBackProps } from './CardBack';
export { CardPlaceholder, type CardPlaceholderProps } from './CardPlaceholder';
export { CardAttachment, type CardAttachmentProps } from './CardAttachment';
export { Icon, type IconProps, type IconSize, type IconVariant } from './Icon';

// Re-export game types that are used by UI components
export { CardType, PokemonType, SpecialCondition } from '../../types/game';
