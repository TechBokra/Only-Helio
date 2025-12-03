import React from 'react';

const inputBase = 'w-full p-3 bg-white dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed';

const stateClasses = {
    default: 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-amber-500 focus:border-transparent',
    error: 'border-red-500 text-red-900 dark:text-red-100 placeholder-red-300 focus:ring-red-500 focus:border-red-500',
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean | string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, error, ...props }, ref) => {
    const stateClass = error ? stateClasses.error : stateClasses.default;
    const classes = [inputBase, stateClass, className].filter(Boolean).join(' ');
    
    return <input type={type} className={classes} ref={ref} {...props} />;
});
Input.displayName = 'Input';

export { Input };