import React from 'react'
import { useNavigate } from 'react-router-dom'

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

interface ALinkButtonProps {
    href: string
    className?: string
    children?: React.ReactNode
}

export const ALinkButton: React.FC<ALinkButtonProps> = ({ href, className = '', children }) => {
    const navigate = useNavigate()
    const goto = (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
        if (ev.metaKey) {
            return
        }
        ev.preventDefault()
        navigate(href)
    }
    return (
        <a
            href={href}
            onClick={ev => goto(ev, href)}
            className={
                'px-4 py-2 rounded shadow-sm disabled:bg-gray-300 disabled:hover:shadow-sm hover:shadow-md text-sm font-bold ' +
                className
            }
        >
            {children}
        </a>
    )
}
