import React from 'react'
import { ALink, DownArrowIcon } from '.'
import { UserContext } from '../context'

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
    const { user } = React.useContext(UserContext)

    const [gameMenu, setGameMenu] = React.useState(false)
    const [userMenu, setUserMenu] = React.useState(false)

    return (
        <nav className='h-14 min-h-[56px] border-b bg-white px-4 items-center flex justify-between z-40'>
            <div className='flex items-end gap-4'>
                <button onClick={() => setGameMenu(!gameMenu)} className='px-1 flex items-center gap-2 sm:hidden'>
                    <h2 className='text-xl font-bold'>Games</h2>
                    <DownArrowIcon />
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
                <ALink href='/play/connect' className='py-1 px-3 hover:bg-gray-100'>
                    Connect 4
                </ALink>
            </div>

            <div className='flex flex-row-reverse gap-2'>
                <button
                    onClick={() => setUserMenu(!userMenu)}
                    className='rounded-full bg-gray-300 h-9 w-9 flex items-center justify-center border border-gray-500'
                >
                    {user === null ? '?' : user.name[0].toUpperCase()}
                </button>
            </div>
            <div
                aria-hidden={!userMenu}
                aria-expanded={userMenu}
                className='fixed top-12 right-4 flex flex-col text-gray-700 border shadow rounded-md text-right bg-white py-1 aria-hidden:hidden'
            >
                <ALink href='/profile' className='py-1 px-3 hover:bg-gray-100'>
                    Profile
                </ALink>
                {user?.isAnonymous === false && (
                    <>
                        <div className='border-t w-full my-1' />
                        <ALink href='#' className='py-1 px-3 hover:bg-gray-100'>
                            Logout
                        </ALink>
                    </>
                )}
            </div>
        </nav>
    )
}
