import React from 'react'

interface ButtonProps {
    disabled?: boolean
    className?: string

    children?: React.ReactNode

    onClick: React.MouseEventHandler<HTMLButtonElement>
}

export const Button: React.FC<ButtonProps> = ({ disabled = false, className = '', children, onClick }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={
                'px-4 py-2 rounded shadow-sm disabled:bg-gray-300 disabled:hover:shadow-sm hover:shadow-md text-sm font-bold ' +
                className
            }
        >
            {children}
        </button>
    )
}
