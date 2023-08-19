import React from 'react'
import { ALink } from '.'

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
    const [gameMenu, setGameMenu] = React.useState(false)
    return (
        <nav className='h-14 min-h-[56px] border-b px-4 items-center flex justify-between'>
            <div className='flex items-end gap-4'>
                <button onClick={() => setGameMenu(!gameMenu)} className='px-1 flex items-center gap-2 sm:hidden'>
                    <h2 className='text-xl font-bold'>Games</h2>
                    <span>v</span>
                </button>
                <ALink href='/' className='px-1 items-center gap-2 hidden sm:flex'>
                    <h2 className='text-xl font-bold'>Games</h2>
                </ALink>
                <ALink href='/play/connect' className='hidden sm:block'>
                    Connect 4
                </ALink>
            </div>
            <div
                aria-hidden={!gameMenu}
                aria-expanded={gameMenu}
                className='fixed top-12 text-gray-700 border shadow rounded-md bg-white py-1 sm:hidden aria-hidden:hidden'
            >
                <ALink href='/play/connect' className='py-1 px-2 hover:bg-gray-100'>
                    Connect 4
                </ALink>
            </div>
            <div className='flex flex-row-reverse gap-2'>
                <button className='rounded-full bg-gray-300 h-9 w-9 flex items-center justify-center border border-gray-500'>
                    A
                </button>
            </div>
        </nav>
    )
}
