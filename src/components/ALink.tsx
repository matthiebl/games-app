import React from 'react'
import { useNavigate } from 'react-router-dom'

interface ALinkProps {
    href: string
    onClick?: (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => any
    className?: string
    children?: React.ReactNode
}

export const ALink: React.FC<ALinkProps> = ({ href, onClick = () => {}, className = '', children }) => {
    const navigate = useNavigate()
    const goto = (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
        onClick(ev)

        if (ev.metaKey) {
            return
        }
        ev.preventDefault()
        navigate(href)
    }
    return (
        <a href={href} onClick={ev => goto(ev, href)} className={className}>
            {children}
        </a>
    )
}
