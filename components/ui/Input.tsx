import React from 'react';

const inputVariants =
    'w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-gray-900 placeholder-gray-500';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
    const classes = [inputVariants, className].join(' ');
    return <input type={type} className={classes} ref={ref} {...props} />;
});
Input.displayName = 'Input';

export { Input };