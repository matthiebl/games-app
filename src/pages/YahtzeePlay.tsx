import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
    ConnectGame,
    ConnectPiece,
    GameID,
    UserID,
    YahtzeeGame,
    connectGameMessage,
    createConnectGame,
    getYahtzeeGame,
    sendGameInvite,
} from '../api'
import { Button, Page, classNames } from '../components'
import { UserContext } from '../context'

type Die = 1 | 2 | 3 | 4 | 5 | 6 | '?'

interface YahtzeePlayProps {}

export const YahtzeePlay: React.FC<YahtzeePlayProps> = ({}) => {
    const { gid } = useParams()
    const { user } = React.useContext(UserContext)

    const [playerIndex, setPlayerIndex] = React.useState<number>(-1)
    const [game, setGame] = React.useState<YahtzeeGame | null>(null)

    const [dice, setDice] = React.useState<Die[]>(['?', '?', '?', '?', '?'])
    const [shareMessage, setShareMessage] = React.useState<string>('Share Game')

    React.useEffect(() => {
        document.title = 'Games | Yahtzee'

        if (gid === undefined || user === null) {
            return
        }
        getYahtzeeGame(gid, data => {
            setGame(data)
            setPlayerIndex(getPlayerIndex(data, user.uid))
        })
    }, [user, gid])

    const shareGame = () => {
        if (gid === undefined || user === null || game === null) {
            return
        }
        const copyLink = () => {
            navigator.clipboard.writeText(`${user.name} is inviting you to play Yahtzee!\n${window.location.href}`)
            setShareMessage('Copied to Clipboard')
            setTimeout(() => setShareMessage('Share Game'), 5000)
        }
        try {
            navigator
                .share({
                    title: 'Play Yahtzee',
                    text: `${user.name} is inviting you to play Yahtzee!`,
                    url: window.location.href,
                })
                .catch(() => copyLink())
        } catch {
            copyLink()
        }
    }

    const makeTurn = () => {
        if (user === null || game === null || gid === undefined || playerIndex !== game.turn) {
            return
        }
    }

    const GameBoard = game === null ? EmptyBoard : Board

    return (
        <Page centered>
            <div className='w-full max-w-4xl p-5 gap-5 flex flex-col items-center'>
                <h1 className='text-3xl font-extrabold text-center'>Yahtzee</h1>
                <div className='w-full gap-5 flex flex-col items-center'>
                    <div className='w-full p-8'>
                        {dice.map(die => (
                            <button className='w-10 h-10 flex justify-center items-center'>{die}</button>
                        ))}
                    </div>
                    {/* <div className='relative max-w-xl w-full h-full'>
                        <div
                            data-finish={game?.winner !== ''}
                            className='hidden z-40 absolute w-full h-full data-[finish=true]:flex items-center justify-center text-4xl font-extrabold'
                        >
                            {game !== null && connectGameMessage(game, player)}
                        </div>
                        <GameBoard player={player} game={game} placePiece={placePiece} />
                    </div>
                    <InfoSection
                        gid={gid}
                        game={game}
                        player={player}
                        shareMessage={shareMessage}
                        shareGame={shareGame}
                    /> */}
                </div>
            </div>
        </Page>
    )
}

interface BoardProps {
    player: ConnectPiece | ''
    game: ConnectGame | null
    placePiece: (column: number) => void
}

const Board: React.FC<BoardProps> = ({ player, game, placePiece }) => {
    if (game === null) {
        return <EmptyBoard player={player} game={game} placePiece={placePiece} />
    }

    return (
        <div className='w-full aspect-[7/6] grid items-end grid-cols-7 gap-2'>
            {game.board.map((column, columnIndex) => (
                <button
                    key={crypto.randomUUID()}
                    data-player={player}
                    disabled={
                        game === null ||
                        game.turn !== player ||
                        game.player2 === '' ||
                        game.winner !== '' ||
                        game.board[columnIndex].length >= 6
                    }
                    onClick={() => placePiece(columnIndex)}
                    className='rounded-full border h-full w-full flex flex-col-reverse gap-2.5 disabled:border-gray-200 data-[player="1"]:border-red-500 data-[player="2"]:border-yellow-500 disabled:data-[player="1"]:border-gray-200 disabled:data-[player="2"]:border-gray-200'
                >
                    {column.split('').map(piece => (
                        <div
                            key={crypto.randomUUID()}
                            className={classNames(
                                'w-full aspect-square rounded-full',
                                piece === '1' ? 'bg-red-500' : 'bg-yellow-500',
                                columnIndex === game.lastColumn
                                    ? 'last:animate-fall last:motion-safe:animate-fall last:motion-reduce:animate-none'
                                    : '',
                            )}
                        />
                    ))}
                </button>
            ))}
        </div>
    )
}

const EmptyBoard: React.FC<BoardProps> = () => (
    <div className='w-full aspect-[7/6] grid items-end grid-cols-7 gap-2'>
        {['', '', '', '', '', '', ''].map(() => (
            <button
                key={crypto.randomUUID()}
                disabled={true}
                className='rounded-full border h-full w-full flex flex-col-reverse gap-3 disabled:border-gray-200'
            ></button>
        ))}
    </div>
)

const redPlayer = (player: ConnectPiece | ''): string => {
    if (player === '') {
        return 'Player 1'
    } else if (player === '1') {
        return 'You'
    } else {
        return 'Opponent'
    }
}

const yellowPlayer = (player: ConnectPiece | ''): string => {
    if (player === '') {
        return 'Player 2'
    } else if (player === '2') {
        return 'You'
    } else {
        return 'Opponent'
    }
}

interface InfoSectionProps {
    gid: GameID | undefined
    game: ConnectGame | null
    player: ConnectPiece | ''
    shareMessage: string
    shareGame: () => void
}

const InfoSection: React.FC<InfoSectionProps> = ({ gid, game, player, shareMessage, shareGame }) => {
    const navigate = useNavigate()

    return (
        <div className='flex flex-col max-w-xl w-full gap-5'>
            <div className='py-2 px-3 gap-3 shadow rounded-md grid grid-cols-2'>
                <div className=''>
                    <p className='text-sm text-red-500'>{redPlayer(player)}</p>
                    <p>{game?.player1Name || 'Loading'}</p>
                </div>
                <div className='text-right'>
                    <p className='text-sm text-yellow-500'>{yellowPlayer(player)}</p>
                    <p>{game?.player2Name || 'Loading'}</p>
                </div>
                <div className='col-span-2 text-center font-bold'>
                    {game === null ? 'LOADING' : connectGameMessage(game, player)}
                </div>
            </div>
            {game !== null && game.winner !== '' && player !== '' && (
                <Button
                    onClick={() => {
                        if (gid === undefined || game === null) {
                            return
                        }
                        const uid = player === '1' ? game.player1 : game.player2
                        const name = player === '1' ? game.player1Name : game.player2Name
                        const opponent = player === '1' ? game.player2 : game.player1
                        createConnectGame(uid, name, id => {
                            sendGameInvite(opponent, 'connect', id)
                            navigate(`/play/connect/${id}`)
                        })
                    }}
                    className='bg-sky-500 text-white'
                >
                    Rematch Opponent
                </Button>
            )}
            <Button
                onClick={shareGame}
                disabled={game === null || game.winner !== ''}
                className='bg-sky-500 text-white disabled:bg-gray-400'
            >
                {shareMessage}
            </Button>
            <span className='-mt-3 text-sm text-gray-600'>
                Invite code: {window.location.pathname.split('/').at(-1)}
            </span>
        </div>
    )
}

// Returns the index of the player, else -1
const getPlayerIndex = (game: YahtzeeGame, uid: UserID): number => {
    for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].uid === uid) {
            return i
        }
    }
    return -1
}
