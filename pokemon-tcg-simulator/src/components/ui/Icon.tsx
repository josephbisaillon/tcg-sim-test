import React from 'react';
import './Icon.css';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconVariant = 'default' | 'solid' | 'outline';

export interface IconProps {
    /**
     * The name of the icon
     */
    name: string;

    /**
     * The size of the icon
     * @default 'md'
     */
    size?: IconSize;

    /**
     * The variant of the icon
     * @default 'default'
     */
    variant?: IconVariant;

    /**
     * The color of the icon
     */
    color?: string;

    /**
     * Additional CSS class names
     */
    className?: string;

    /**
     * Additional inline styles
     */
    style?: React.CSSProperties;

    /**
     * Accessibility label for the icon
     */
    ariaLabel?: string;

    /**
     * Click handler
     */
    onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
}

/**
 * Icon component for displaying SVG icons
 */
export const Icon: React.FC<IconProps> = ({
    name,
    size = 'md',
    variant = 'default',
    color,
    className = '',
    style = {},
    ariaLabel,
    onClick,
}) => {
    // Combine all classes
    const baseClasses = 'icon';
    const sizeClasses = `icon-size-${size}`;
    const variantClasses = `icon-variant-${variant}`;
    const nameClasses = `icon-${name}`;

    const combinedClasses = [
        baseClasses,
        sizeClasses,
        variantClasses,
        nameClasses,
        className
    ].filter(Boolean).join(' ');

    // Combine styles
    const combinedStyles: React.CSSProperties = {
        ...style,
        ...(color ? { color } : {}),
    };

    return (
        <span
            className={combinedClasses}
            style={combinedStyles}
            aria-label={ariaLabel}
            role={ariaLabel ? 'img' : undefined}
            aria-hidden={!ariaLabel}
            onClick={onClick}
        >
            {/* We'll use a custom SVG sprite system or an icon library like Font Awesome */}
            {/* For now, we'll use a placeholder */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="1em"
                height="1em"
            >
                {/* This is a placeholder path that will be replaced with actual icons */}
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
        </span>
    );
};

export default Icon;
