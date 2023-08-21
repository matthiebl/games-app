import React from 'react'

interface CardProps {
    className?: string
    children?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => (
    <div className={'border bg-white shadow-lg rounded-lg p-5 gap-5 ' + className}>{children}</div>
)
