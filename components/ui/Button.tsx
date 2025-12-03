import React from 'react';
import { Spinner } from './Spinner';

// Manual implementation of cva-like functionality
const buttonVariants = {
    base: 'inline-flex items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:pointer-events-none',
    variants: {
        variant: {
            primary: 'bg-amber-500 text-gray-900 hover:bg-amber-600 shadow-sm hover:shadow-md',
            secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
            outline: 'border-2 border-amber-500 text-amber-600 hover:bg-amber-50',
            ghost: 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
            danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
            success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm',
            link: 'text-amber-600 underline-offset-4 hover:underline p-0 h-auto',
        },
        size: {
            default: 'px-4 py-2',
            sm: 'h-9 px-3 text-xs rounded-md',
            lg: 'h-12 px-8 rounded-lg text-base',
            icon: 'h-10 w-10 p-2',
        },
        width: {
            default: '',
            full: 'w-full',
        }
    },
};

type ButtonVariant = keyof typeof buttonVariants.variants.variant;
type ButtonSize = keyof typeof buttonVariants.variants.size;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    isLoading?: boolean;
    loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'default', fullWidth = false, isLoading, loadingText, type = 'button', children, ...props }, ref) => {
        const classes = [
            buttonVariants.base,
            buttonVariants.variants.variant[variant],
            buttonVariants.variants.size[size],
            fullWidth ? buttonVariants.variants.width.full : '',
            className,
        ].filter(Boolean).join(' ');

        return (
            <button 
                type={type} 
                className={classes} 
                ref={ref} 
                disabled={isLoading || props.disabled} 
                {...props}
            >
                {isLoading && <Spinner size="sm" className="mr-2" />}
                {isLoading && loadingText ? loadingText : children}
            </button>
        );
    },
);
Button.displayName = 'Button';

export { Button };