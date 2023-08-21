import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
    ConnectGame,
    ConnectPiece,
    GameID,
    acceptConnectChallenge,
    connectGameMessage,
    getConnectGame,
    joinAsSecondPlayerToConnectGame,
    placeConnectPiece,
    sendConnectChallengeInvite,
} from '../api'
import { Button, Page, classNames } from '../components'
import { UserContext } from '../context'

interface ConnectPlayProps {}

export const ConnectPlay: React.FC<ConnectPlayProps> = ({}) => {
    const { gid } = useParams()
    const { user } = React.useContext(UserContext)

    const [player, setPlayer] = React.useState<ConnectPiece | ''>('')
    const [game, setGame] = React.useState<ConnectGame | null>(null)

    const [shareMessage, setShareMessage] = React.useState<string>('Invite')

    React.useEffect(() => {
        document.title = 'Games | Connect 4'

        if (gid === undefined || user === null) {
            return
        }
        getConnectGame(gid, data => {
            if (data.player1 !== user.uid && data.player2 === '') {
                joinAsSecondPlayerToConnectGame(gid, user.uid, user.name)
                setPlayer('2')
            } else if (data.player1 === user.uid) {
                setPlayer('1')
            } else if (data.player2 === user.uid) {
                setPlayer('2')
            }
            setGame(data)
        })
    }, [user, gid])

    const shareGame = () => {
        if (gid === undefined || user === null || game === null) {
            return
        }
        const copyLink = () => {
            navigator.clipboard.writeText(`${user.name} is inviting you to play Connect 4!\n${window.location.href}`)
            setShareMessage('Copied to Clipboard')
            setTimeout(() => setShareMessage('Invite'), 5000)
        }
        try {
            navigator
                .share({
                    title: 'Play Connect 4',
                    text: `${user.name} is inviting you to play Connect 4!`,
                    url: window.location.href,
                })
                .catch(() => copyLink())
        } catch {
            copyLink()
        }
    }

    const placePiece = (column: number) => {
        if (
            user === null ||
            game === null ||
            gid === undefined ||
            player !== game.turn ||
            column < 0 ||
            column >= 7 ||
            game.board[column].length >= 6
        ) {
            return
        }
        placeConnectPiece(gid, game.board, game.turn, column)
    }

    const GameBoard = game === null ? EmptyBoard : Board

    return (
        <Page centered>
            <div className='w-full max-w-7xl p-5 gap-5 flex flex-col items-center'>
                <h1 className='text-3xl font-extrabold text-center'>Connect 4</h1>
                <div className='w-full gap-5 flex flex-col lg:flex-row items-center lg:justify-center lg:items-start'>
                    <div className='relative max-w-xl w-full h-full'>
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
                    />
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
            {game !== null && game.winner !== '' && player !== '' && game.challenge === null && (
                <Button
                    onClick={() => {
                        if (gid === undefined || game === null) {
                            return
                        }
                        const uid = player === '1' ? game.player1 : game.player2
                        const name = player === '1' ? game.player1Name : game.player2Name
                        sendConnectChallengeInvite(gid, uid, name, player, id => navigate(`/play/connect/${id}`))
                    }}
                    className='bg-sky-500 text-white'
                >
                    Challenge Again
                </Button>
            )}
            {game !== null && player !== '' && game.challenge !== null && game.accepted === false && (
                <Button
                    onClick={() => {
                        if (game === null || game.challenge === null || gid === undefined) {
                            return
                        }
                        acceptConnectChallenge(gid, () => navigate(`/play/connect/${game.challenge?.code || ''}`))
                    }}
                    className='bg-lime-500 text-white'
                >
                    Accept Invite
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
