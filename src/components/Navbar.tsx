import React from 'react'
import { ALink, HamburgerIcon, MailIcon } from '.'
import { UserContext } from '../context'
import { acceptGameInvite } from '../api'

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
    const { user } = React.useContext(UserContext)

    const [gameMenu, setGameMenu] = React.useState(false)
    const [inviteMenu, setInviteMenu] = React.useState(false)
    const [userMenu, setUserMenu] = React.useState(false)

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setGameMenu(false)
            setInviteMenu(false)
            setUserMenu(false)
        }
    }

    React.useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)

        // cleanup this component
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    const toggleGameMenu = () => {
        if (gameMenu) {
            setGameMenu(false)
        } else {
            setGameMenu(true)
            setInviteMenu(false)
            setUserMenu(false)
        }
    }
    const toggleInviteMenu = () => {
        if (inviteMenu) {
            setInviteMenu(false)
        } else {
            setGameMenu(false)
            setInviteMenu(true)
            setUserMenu(false)
        }
    }
    const toggleUserMenu = () => {
        if (userMenu) {
            setUserMenu(false)
        } else {
            setGameMenu(false)
            setInviteMenu(false)
            setUserMenu(true)
        }
    }

    return (
        <nav className='h-14 min-h-[56px] border-b bg-white px-4 items-center flex justify-between z-40'>
            {/* Games menu */}
            <div className='flex items-center gap-4'>
                <button
                    disabled={user === null}
                    onClick={toggleGameMenu}
                    className='px-1 flex items-center gap-2 sm:hidden'
                >
                    <HamburgerIcon />
                    <h2 className='text-xl font-bold'>Games</h2>
                </button>
                <ALink href='/' className='px-1 items-center gap-2 hidden sm:flex'>
                    <h2 className='text-xl font-bold'>Games</h2>
                </ALink>
                <ALink href='/play/connect' className='hidden sm:block text-sm'>
                    Connect 4
                </ALink>
                <ALink href='/play/yahtzee' className='hidden sm:block text-sm'>
                    Yahtzee
                </ALink>
                <ALink href='/play/battleship' className='hidden sm:block text-sm'>
                    Battleship
                </ALink>
            </div>
            {/* Games dropdown available on small screens via hamburger */}
            <div
                aria-hidden={!gameMenu}
                aria-expanded={gameMenu}
                className='fixed top-12 flex flex-col text-gray-700 border shadow rounded-md bg-white py-1 sm:hidden aria-hidden:hidden'
            >
                <ALink href='/' className='py-1 px-3 hover:bg-gray-100 w-full'>
                    Home
                </ALink>
                <div className='w-full border-t my-1' />
                <ALink href='/play/connect' className='py-1 px-3 hover:bg-gray-100 w-full'>
                    Connect 4
                </ALink>
                <ALink href='/play/yahtzee' className='py-1 px-3 hover:bg-gray-100 w-full'>
                    Yahtzee
                </ALink>
                <ALink href='/play/battleship' className='py-1 px-3 hover:bg-gray-100 w-full'>
                    Battleship
                </ALink>
            </div>

            {/* Invites and user menu */}
            <div className='flex gap-4 items-center'>
                <button
                    disabled={user === null}
                    onClick={toggleInviteMenu}
                    className='relative rounded-full w-9 h-9 flex items-center justify-center'
                >
                    <MailIcon />
                    {user !== null && user.invites.length > 0 && (
                        <span className='absolute flex h-2.5 w-2.5 right-[3px] top-[5px]'>
                            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75'></span>
                            <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500'></span>
                        </span>
                    )}
                </button>
                <button
                    disabled={user === null}
                    onClick={toggleUserMenu}
                    className='rounded-full bg-gray-300 h-9 w-9 flex items-center justify-center border border-gray-500'
                >
                    {user === null ? '?' : user.name[0].toUpperCase()}
                </button>
            </div>

            {/* User Invites menu */}
            <div
                aria-hidden={!inviteMenu}
                aria-expanded={inviteMenu}
                className='fixed top-12 right-16 flex flex-col text-gray-700 border shadow rounded-md bg-white py-1 aria-hidden:hidden'
            >
                {user !== null && user.invites.length === 0 && <div className='py-1 px-3'>No invites</div>}
                {user !== null &&
                    user.invites.map(game => (
                        <ALink
                            href={`/play/connect/${game.id}`}
                            onClick={() => acceptGameInvite(user.uid, game.id)}
                            className='py-1 px-3 hover:bg-gray-100'
                        >
                            Connect 4 game invite!
                        </ALink>
                    ))}
            </div>

            {/* User Menu */}
            <div
                aria-hidden={!userMenu}
                aria-expanded={userMenu}
                className='fixed top-12 right-4 flex flex-col text-gray-700 border shadow rounded-md bg-white py-1 aria-hidden:hidden'
            >
                <ALink href='/profile' className='py-1 px-3 hover:bg-gray-100'>
                    Profile
                </ALink>
                <ALink href='/profile/stats' className='py-1 px-3 hover:bg-gray-100'>
                    Stats
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

// type MenuItem = MenuItemLink | MenuItemText | MenuItemLine

// type MenuItemLink = {
//     type: 'link'
//     text: string
//     href: string
// }

// type MenuItemText = {
//     type: 'text'
//     text: string
// }

// type MenuItemLine = {
//     type: 'line'
// }

// interface NavMenuProps {
//     control: boolean
//     items: MenuItem[]
// }

// export const NavMenu: React.FC<NavMenuProps> = ({ control, items }) => {
//     return <div>Hello</div>
// }
