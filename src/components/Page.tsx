import React from 'react'
import { Navbar } from '.'

interface PageProps {
    centered?: boolean
    children?: React.ReactNode
}

export const Page: React.FC<PageProps> = ({ centered = false, children }) => {
    return (
        <div className='w-full h-full flex flex-col'>
            <Navbar />
            <div className={'flex-grow ' + (centered ? 'flex justify-center' : '')}>{children}</div>
        </div>
    )
}
