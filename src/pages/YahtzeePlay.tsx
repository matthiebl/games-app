import React from 'react'
import { useParams } from 'react-router-dom'

import {
    GameID,
    UserData,
    UserID,
    YahtzeeGame,
    getYahtzeeGame,
    putYahtzeeAllPlayersJoined,
    sendGameInvite,
} from '../api'
import { Button, Page } from '../components'
import { UserContext } from '../context'

interface YahtzeePlayProps {}

export const YahtzeePlay: React.FC<YahtzeePlayProps> = ({}) => {
    const { gid } = useParams()
    const { user } = React.useContext(UserContext)

    const [playerIndex, setPlayerIndex] = React.useState<number>(-1)
    const [game, setGame] = React.useState<YahtzeeGame | null>(null)

    const [dice, setDice] = React.useState<Die[]>(gameDiceToPlayDice([1, 1, 1, 1, 1]))
    const [shareMessage, setShareMessage] = React.useState<string>('Share Game')

    React.useEffect(() => {
        document.title = 'Games | Yahtzee'

        if (gid === undefined || user === null) {
            return
        }
        getYahtzeeGame(gid, data => {
            setGame(data)
            setDice(gameDiceToPlayDice(data.turn.dice))
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
        if (user === null || game === null || gid === undefined || playerIndex !== game.turn.playerIndex) {
            return
        }
    }

    return (
        <Page centered>
            <div className='w-full max-w-4xl p-5 gap-5 flex flex-col items-center'>
                <h1 className='text-3xl font-extrabold text-center'>Yahtzee</h1>
                <div className='w-full gap-5 flex flex-col items-center'>
                    <PlayersSection gid={gid} game={game} user={user} />
                    <Dice game={game} dice={dice} />

                    <h3 className='text-xl w-full -mb-3 text-left'>Scorecard</h3>
                    <div className='w-full flex'>
                        <div className=''>
                            {[
                                'Aces',
                                'Twos',
                                'Threes',
                                'Fours',
                                'Fives',
                                'Sixes',
                                'Total',
                                'Bonus',
                                'Upper Total',
                                '3 of a Kind',
                                '4 of a Kind',
                                'Full House',
                                'SM Straight',
                                'LG Straight',
                                'YAHTZEE',
                                'Chance',
                                'BONUS',
                                'Lower Total',
                                'Grand Total',
                            ].map(s => (
                                <div>{s}</div>
                            ))}
                        </div>
                        <div className='px-2 py-1 text-center'>
                            {game !== null && user !== null && game.players[getPlayerIndex(game, user.uid)].card}
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    )
}

interface PlayersSectionProps {
    gid: GameID | undefined
    game: YahtzeeGame | null
    user: UserData | null
}

const PlayersSection: React.FC<PlayersSectionProps> = ({ gid, game, user }) => {
    return (
        <>
            <div className='w-full flex gap-2 justify-center'>
                <span>{game === null || game.playersJoined ? 'Players' : 'Players Joined'}:</span>
                {game === null ? (
                    <span>Loading Players</span>
                ) : (
                    game.players.map((player, i) => (
                        <React.Fragment key={crypto.randomUUID()}>
                            <span
                                data-user={user !== null && player.uid === user.uid}
                                data-turn={i === game.turn.playerIndex}
                                className='data-[user=true]:underline data-[turn=true]:font-bold'
                            >
                                {user !== null && player.uid === user.uid ? 'You' : player.name}
                                {i === 0 && ' (Host)'}
                            </span>
                            <span className='last:hidden'>•</span>
                        </React.Fragment>
                    ))
                )}
            </div>
            {game !== null && user !== null && !game.playersJoined && getPlayerIndex(game, user.uid) === 0 && (
                <Button
                    onClick={() => {
                        if (gid !== undefined) putYahtzeeAllPlayersJoined(gid)
                    }}
                    className='w-full bg-lime-500 text-white'
                >
                    Start Game
                </Button>
            )}
        </>
    )
}

interface DieProps {
    game: YahtzeeGame | null
    dice: Die[]
}

const Dice: React.FC<DieProps> = ({ game, dice }) => {
    return (
        <>
            <div className='w-full py-2 px-5 flex justify-center items-center flex-wrap gap-5'>
                {dice.map(die => (
                    <button
                        key={crypto.randomUUID()}
                        className='w-16 h-16 min-w-[4rem] min-h-[4rem] flex justify-center items-center border rounded border-black'
                    >
                        {die.value}
                    </button>
                ))}
            </div>
            <Button
                disabled={game === null || !game.playersJoined}
                onClick={() => {}}
                className='w-full bg-sky-500 text-white'
            >
                Roll
            </Button>
        </>
    )
}

// interface BoardProps {
//     player: ConnectPiece | ''
//     game: ConnectGame | null
//     placePiece: (column: number) => void
// }

// const Board: React.FC<BoardProps> = ({ player, game, placePiece }) => {
//     if (game === null) {
//         return <EmptyBoard player={player} game={game} placePiece={placePiece} />
//     }

//     return (
//         <div className='w-full aspect-[7/6] grid items-end grid-cols-7 gap-2'>
//             {game.board.map((column, columnIndex) => (
//                 <button
//                     key={crypto.randomUUID()}
//                     data-player={player}
//                     disabled={
//                         game === null ||
//                         game.turn !== player ||
//                         game.player2 === '' ||
//                         game.winner !== '' ||
//                         game.board[columnIndex].length >= 6
//                     }
//                     onClick={() => placePiece(columnIndex)}
//                     className='rounded-full border h-full w-full flex flex-col-reverse gap-2.5 disabled:border-gray-200 data-[player="1"]:border-red-500 data-[player="2"]:border-yellow-500 disabled:data-[player="1"]:border-gray-200 disabled:data-[player="2"]:border-gray-200'
//                 >
//                     {column.split('').map(piece => (
//                         <div
//                             key={crypto.randomUUID()}
//                             className={classNames(
//                                 'w-full aspect-square rounded-full',
//                                 piece === '1' ? 'bg-red-500' : 'bg-yellow-500',
//                                 columnIndex === game.lastColumn
//                                     ? 'last:animate-fall last:motion-safe:animate-fall last:motion-reduce:animate-none'
//                                     : '',
//                             )}
//                         />
//                     ))}
//                 </button>
//             ))}
//         </div>
//     )
// }

// const EmptyBoard: React.FC<BoardProps> = () => (
//     <div className='w-full aspect-[7/6] grid items-end grid-cols-7 gap-2'>
//         {['', '', '', '', '', '', ''].map(() => (
//             <button
//                 key={crypto.randomUUID()}
//                 disabled={true}
//                 className='rounded-full border h-full w-full flex flex-col-reverse gap-3 disabled:border-gray-200'
//             ></button>
//         ))}
//     </div>
// )

// const redPlayer = (player: ConnectPiece | ''): string => {
//     if (player === '') {
//         return 'Player 1'
//     } else if (player === '1') {
//         return 'You'
//     } else {
//         return 'Opponent'
//     }
// }

// const yellowPlayer = (player: ConnectPiece | ''): string => {
//     if (player === '') {
//         return 'Player 2'
//     } else if (player === '2') {
//         return 'You'
//     } else {
//         return 'Opponent'
//     }
// }

// interface InfoSectionProps {
//     gid: GameID | undefined
//     game: ConnectGame | null
//     player: ConnectPiece | ''
//     shareMessage: string
//     shareGame: () => void
// }

// const InfoSection: React.FC<InfoSectionProps> = ({ gid, game, player, shareMessage, shareGame }) => {
//     const navigate = useNavigate()

//     return (
//         <div className='flex flex-col max-w-xl w-full gap-5'>
//             <div className='py-2 px-3 gap-3 shadow rounded-md grid grid-cols-2'>
//                 <div className=''>
//                     <p className='text-sm text-red-500'>{redPlayer(player)}</p>
//                     <p>{game?.player1Name || 'Loading'}</p>
//                 </div>
//                 <div className='text-right'>
//                     <p className='text-sm text-yellow-500'>{yellowPlayer(player)}</p>
//                     <p>{game?.player2Name || 'Loading'}</p>
//                 </div>
//                 <div className='col-span-2 text-center font-bold'>
//                     {game === null ? 'LOADING' : connectGameMessage(game, player)}
//                 </div>
//             </div>
//             {game !== null && game.winner !== '' && player !== '' && (
//                 <Button
//                     onClick={() => {
//                         if (gid === undefined || game === null) {
//                             return
//                         }
//                         const uid = player === '1' ? game.player1 : game.player2
//                         const name = player === '1' ? game.player1Name : game.player2Name
//                         const opponent = player === '1' ? game.player2 : game.player1
//                         createConnectGame(uid, name, id => {
//                             sendGameInvite(opponent, 'connect', id)
//                             navigate(`/play/connect/${id}`)
//                         })
//                     }}
//                     className='bg-sky-500 text-white'
//                 >
//                     Rematch Opponent
//                 </Button>
//             )}
//             <Button
//                 onClick={shareGame}
//                 disabled={game === null || game.winner !== ''}
//                 className='bg-sky-500 text-white disabled:bg-gray-400'
//             >
//                 {shareMessage}
//             </Button>
//             <span className='-mt-3 text-sm text-gray-600'>
//                 Invite code: {window.location.pathname.split('/').at(-1)}
//             </span>
//         </div>
//     )
// }

// Returns the index of the player, else -1
const getPlayerIndex = (game: YahtzeeGame, uid: UserID): number => {
    for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].uid === uid) {
            return i
        }
    }
    return -1
}

type Die = {
    value: DieV
    locked: boolean
}
type DieV = 1 | 2 | 3 | 4 | 5 | 6

const gameDiceToPlayDice = (dice: number[]): Die[] => dice.map(value => ({ value: numberToDieV(value), locked: false }))

const numberToDieV = (die: number): DieV => {
    switch (die) {
        case 1:
            return 1
        case 2:
            return 2
        case 3:
            return 3
        case 4:
            return 4
        case 5:
            return 5
        default:
            return 6
    }
}

const rollRandomDie = (): DieV => numberToDieV(Math.floor(Math.random() * 6) + 1)

const rollRandomDice = (dice: Die[]): Die[] => {
    return dice.map(({ value, locked }) => (locked ? { value, locked } : { value: rollRandomDie(), locked }))
}
