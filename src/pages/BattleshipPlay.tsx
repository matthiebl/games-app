import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
    BattleshipGame,
    BattleshipGuess,
    BattleshipPlayer,
    GameID,
    Ship,
    ShipId,
    createBattleshipGame,
    getBattleshipGame,
    joinAsSecondPlayerToBattleshipGame,
    sendGameInvite,
} from '../api'
import { Button, Page, classNames } from '../components'
import { UserContext } from '../context'
import { BattleshipBoard } from '../components/Battleship/Board'

interface BattleshipPlayProps {}

export const BattleshipPlay: React.FC<BattleshipPlayProps> = ({}) => {
    const { gid } = useParams()
    const { user } = React.useContext(UserContext)

    const [player, setPlayer] = React.useState<BattleshipPlayer | ''>('')
    const [game, setGame] = React.useState<BattleshipGame | null>(null)

    const [shareMessage, setShareMessage] = React.useState<string>('Share Game')

    React.useEffect(() => {
        document.title = 'Games | Battleship'

        if (gid === undefined || user === null) {
            return
        }
        getBattleshipGame(gid, data => {
            if (data.player1.uid !== user.uid && data.player2.uid === '') {
                joinAsSecondPlayerToBattleshipGame(gid, user.uid, user.name)
                setPlayer(BattleshipPlayer.Player2)
            } else if (data.player1.uid === user.uid) {
                setPlayer(BattleshipPlayer.Player1)
            } else if (data.player2.uid === user.uid) {
                setPlayer(BattleshipPlayer.Player2)
            }
            setGame(data)
        })
    }, [user, gid])

    const shareGame = () => {
        if (gid === undefined || user === null || game === null) {
            return
        }
        const copyLink = () => {
            navigator.clipboard.writeText(`${user.name} is inviting you to play Battleship!\n${window.location.href}`)
            setShareMessage('Copied to Clipboard')
            setTimeout(() => setShareMessage('Share Game'), 5000)
        }
        try {
            navigator
                .share({
                    title: 'Play Battleship',
                    text: `${user.name} is inviting you to play Battleship!`,
                    url: window.location.href,
                })
                .catch(() => copyLink())
        } catch {
            copyLink()
        }
    }

    const shipsPlaced = React.useMemo(
        () => !!game && !!game.player1.ships.length && !!game.player2.ships.length,
        [game],
    )
    const GameBoard = game === null ? EmptyBoard : Board

    return (
        <Page centered>
            <div className='w-full max-w-7xl p-5 gap-5 flex flex-col items-center'>
                <h1 className='text-3xl font-extrabold text-center'>Battleship</h1>
                <div className='w-full gap-5 flex flex-col items-center'>
                    {shipsPlaced ? (
                        <div className='relative max-w-xl w-full h-full'>
                            <div
                                aria-hidden={game?.winner === ''}
                                data-finish={game?.winner !== ''}
                                className='hidden z-40 absolute w-full h-full data-[finish=true]:flex items-center justify-center text-4xl font-extrabold'
                            >
                                {/* {game !== null && connectGameMessage(game, player)} */}
                            </div>
                            <GameBoard player={player} game={game} />
                        </div>
                    ) : (
                        <ShipPlacement />
                    )}
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

interface ShipPlacementProps {}

const ShipPlacement: React.FC<ShipPlacementProps> = ({}) => {
    const [ships, setShips] = React.useState(defaultShips)
    const [isValid, setIsValid] = React.useState(true)
    const [selected, setSelected] = React.useState(0)
    const [cellWidth, setCellWidth] = React.useState(572 / 10)

    React.useEffect(() => {
        const onResize = () => setCellWidth(document.getElementById('board')?.clientWidth! / 10)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    React.useEffect(() => {
        const onKeyPress = ({ key }: KeyboardEvent) => {
            const ship = ships[selected]
            const newShips = [...ships]

            const canRotate =
                (ship.dir === 'RIGHT' && ship.row <= 10 - shipLength[ship.id]) ||
                (ship.dir === 'DOWN' && ship.col <= 10 - shipLength[ship.id])
            const canMoveRight =
                (ship.dir === 'DOWN' && ship.col < 10 - 1) ||
                (ship.dir === 'RIGHT' && ship.col < 10 - shipLength[ship.id])
            const canMoveDown =
                (ship.dir === 'RIGHT' && ship.row < 10 - 1) ||
                (ship.dir === 'DOWN' && ship.row < 10 - shipLength[ship.id])

            if (key === 'n' || key === 'N') {
                setSelected((selected + 1) % ships.length)
            } else if ((key === 'r' || key === 'R') && canRotate) {
                newShips[selected].dir = ship.dir === 'RIGHT' ? 'DOWN' : 'RIGHT'
                setShips(newShips)
            } else if (key === 'ArrowLeft' && ship.col > 0) {
                newShips[selected].col -= 1
                setShips(newShips)
            } else if (key === 'ArrowUp' && ship.row > 0) {
                newShips[selected].row -= 1
                setShips(newShips)
            } else if (key === 'ArrowRight' && canMoveRight) {
                newShips[selected].col += 1
                setShips(newShips)
            } else if (key === 'ArrowDown' && canMoveDown) {
                newShips[selected].row += 1
                setShips(newShips)
            }
        }

        window.addEventListener('keydown', onKeyPress)
        return () => window.removeEventListener('keydown', onKeyPress)
    }, [selected, ships])

    React.useEffect(() => {
        const filledCells = new Array(100).fill(0)
        for (const ship of ships) {
            for (let i = 0; i < shipLength[ship.id]; i++) {
                if (ship.dir === 'RIGHT') {
                    filledCells[10 * ship.row + ship.col + i] = 1
                } else {
                    filledCells[10 * (ship.row + i) + ship.col] = 1
                }
            }
        }
        const sum = filledCells.reduce((prev, n) => n + prev, 0)
        setIsValid(sum === 17)
    }, [ships])

    const displayShip = (cellRow: number, cellCol: number) => {
        const shipIndex = ships.findIndex(({ row, col }) => row === cellRow && col === cellCol)
        if (shipIndex === -1) {
            return null
        }

        const ship = ships[shipIndex]
        const width = ship.dir === 'RIGHT' ? cellWidth * shipLength[ship.id] - cellWidth / 2 : cellWidth / 2
        const height = ship.dir === 'DOWN' ? cellWidth * shipLength[ship.id] - cellWidth / 2 : cellWidth / 2

        return (
            <button
                onClick={() => setSelected(shipIndex)}
                aria-selected={selected === shipIndex}
                className='absolute bg-gray-600 rounded-full z-20 aria-selected:z-30 aria-selected:ring ring-offset-1 ring-sky-500'
                style={{ width: `${width}px`, height: `${height}px`, left: cellWidth / 4, top: cellWidth / 4 }}
            />
        )
    }

    return (
        <div className='max-w-xl w-full flex flex-col items-center gap-3'>
            <div className='w-full'>
                <h2 className='text-2xl font-semibold text-gray-800'>Place your ships</h2>
                <p className='my-2 text-gray-600'>
                    Move the ships with arrow keys, (R) to rotate, (N) to go to next ship. Confirm by selecting the
                    button
                </p>
                <Button
                    disabled={!isValid}
                    onClick={() => {}}
                    className='bg-lime-500 text-white disabled:bg-gray-400 outline-offset-2 focus:outline-lime-500'
                >
                    Confirm Ships
                </Button>
            </div>

            <BattleshipBoard boat={displayShip} />
        </div>
    )
}

const defaultShips: Ship[] = [
    {
        id: ShipId.Two,
        row: 0,
        col: 0,
        dir: 'RIGHT',
    },
    {
        id: ShipId.ThreeA,
        row: 1,
        col: 0,
        dir: 'RIGHT',
    },
    {
        id: ShipId.ThreeB,
        row: 2,
        col: 0,
        dir: 'RIGHT',
    },
    {
        id: ShipId.Four,
        row: 3,
        col: 0,
        dir: 'RIGHT',
    },
    {
        id: ShipId.Five,
        row: 4,
        col: 0,
        dir: 'RIGHT',
    },
]

const shipLength = {
    TWO: 2,
    THREE_A: 3,
    THREE_B: 3,
    FOUR: 4,
    FIVE: 5,
}

interface BoardProps {
    player: BattleshipPlayer | ''
    game: BattleshipGame | null
}

const Board: React.FC<BoardProps> = ({ player, game }) => {
    if (game === null || player === '') {
        return <EmptyBoard player={player} game={game} />
    }

    const playerData = player === BattleshipPlayer.Player1 ? game.player1 : game.player2

    return (
        <div className='w-full aspect-square grid grid-cols-10'>
            {Object.entries(playerData.guesses).map(([columnIndex, column]) => (
                <div
                    key={`col-${columnIndex}`}
                    className='border h-full w-full flex flex-col-reverse gap-2.5 border-gray-200'
                >
                    {column.map((cell, cellIndex) => (
                        <button
                            key={`col-${columnIndex},row-${cellIndex}`}
                            className={classNames(
                                'w-full aspect-square',
                                cell === BattleshipGuess.Hit && 'bg-red-600',
                                cell === BattleshipGuess.Miss && 'bg-gray-300',
                            )}
                            disabled
                        />
                    ))}
                </div>
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

interface InfoSectionProps {
    gid: GameID | undefined
    game: BattleshipGame | null
    player: BattleshipPlayer | ''
    shareMessage: string
    shareGame: () => void
}

const InfoSection: React.FC<InfoSectionProps> = ({ gid, game, player, shareMessage, shareGame }) => {
    const navigate = useNavigate()

    const onRematch = () => {
        if (gid === undefined || game === null) {
            return
        }
        const uid = player === BattleshipPlayer.Player1 ? game.player1.uid : game.player2.uid
        const name = player === BattleshipPlayer.Player1 ? game.player1.name : game.player2.name
        const opponent = player === BattleshipPlayer.Player1 ? game.player2.uid : game.player1.uid
        createBattleshipGame(uid, name, id => {
            sendGameInvite(opponent, 'battleship', id)
            navigate(`/play/battleship/${id}`)
        })
    }

    return (
        <div className='flex flex-col max-w-xl w-full gap-5'>
            <div className='py-2 px-3 gap-3 shadow rounded-md grid grid-cols-2'>
                <div className=''>
                    <p className='text-sm'>Player 1</p>
                    <p>{game?.player1.name || 'Loading'}</p>
                </div>
                <div className='text-right'>
                    <p className='text-sm'>Player 2</p>
                    <p>{game?.player2.name || 'Loading'}</p>
                </div>
                <div className='col-span-2 text-center font-bold'>{game === null ? 'LOADING' : 'Display here'}</div>
            </div>
            {game !== null && game.winner !== '' && player !== '' && (
                <Button onClick={onRematch} className='bg-sky-500 text-white'>
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
