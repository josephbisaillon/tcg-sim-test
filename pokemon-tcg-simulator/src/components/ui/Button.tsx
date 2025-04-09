import React, { ButtonHTMLAttributes } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * The visual style of the button
     * @default 'primary'
     */
    variant?: ButtonVariant;

    /**
     * The size of the button
     * @default 'md'
     */
    size?: ButtonSize;

    /**
     * Whether the button should take up the full width of its container
     * @default false
     */
    fullWidth?: boolean;

    /**
     * Whether the button is in a loading state
     * @default false
     */
    isLoading?: boolean;

    /**
     * Icon to display before the button text
     */
    leftIcon?: React.ReactNode;

    /**
     * Icon to display after the button text
     */
    rightIcon?: React.ReactNode;
}

/**
 * Primary UI component for user interaction
 */
export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    // Combine all classes
    const baseClasses = 'button';
    const variantClasses = `button-${variant}`;
    const sizeClasses = `button-${size}`;
    const widthClasses = fullWidth ? 'button-full-width' : '';
    const stateClasses = isLoading ? 'button-loading' : '';
    const disabledClasses = disabled ? 'button-disabled' : '';

    const combinedClasses = [
        baseClasses,
        variantClasses,
        sizeClasses,
        widthClasses,
        stateClasses,
        disabledClasses,
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={combinedClasses}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <span className="button-spinner" aria-hidden="true">
                    {/* We'll implement a spinner component later */}
                    <span className="sr-only">Loading...</span>
                </span>
            )}

            {!isLoading && leftIcon && (
                <span className="button-left-icon">{leftIcon}</span>
            )}

            <span className="button-text">{children}</span>

            {!isLoading && rightIcon && (
                <span className="button-right-icon">{rightIcon}</span>
            )}
        </button>
    );
};

export default Button;
