import React from 'react'
import { useParams } from 'react-router-dom'

import {
    GameID,
    UserData,
    UserID,
    YahtzeeCard,
    YahtzeeGame,
    getYahtzeeGame,
    postYahtzeeMove,
    postYahtzeeRoll,
    putYahtzeeAllPlayersJoined,
    putYahtzeePlayer,
} from '../api'
import { Button, CancelIcon, Page } from '../components'
import { UserContext } from '../context'

interface YahtzeePlayProps {}

export const YahtzeePlay: React.FC<YahtzeePlayProps> = ({}) => {
    const { gid } = useParams()
    const { user } = React.useContext(UserContext)

    const [playerIndex, setPlayerIndex] = React.useState<number>(-1)
    const [game, setGame] = React.useState<YahtzeeGame | null>(null)

    const [dice, setDice] = React.useState<Die[]>(gameDiceToPlayDice([1, 1, 1, 1, 1]))

    React.useEffect(() => {
        document.title = 'Games | Yahtzee'

        if (gid === undefined || user === null) {
            return
        }
        getYahtzeeGame(gid, data => {
            setGame(data)
            const index = getPlayerIndex(data, user.uid)
            if (index === -1 && !data.playersJoined) {
                putYahtzeePlayer(gid, user.uid, user.name)
            }
        })
    }, [gid, user])

    React.useEffect(() => {
        if (game === null || user === null) {
            return
        }
        setDice(gameDiceToPlayDice(game.turn.dice))
        setPlayerIndex(getPlayerIndex(game, user.uid))
    }, [game, user])

    return (
        <Page centered>
            <div className='w-full max-w-4xl p-5 gap-5 flex flex-col items-center'>
                <h1 className='text-3xl font-extrabold text-center'>Yahtzee</h1>
                <div className='w-full gap-5 flex flex-col items-center'>
                    <PlayersSection gid={gid} game={game} user={user} />
                    <Dice game={game} dice={dice} setDice={setDice} />
                    <Scorecard game={game} playerIndex={playerIndex} />
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
    const [shareMessage, setShareMessage] = React.useState<string>('Share Game')

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
                                // data-user={user !== null && player.uid === user.uid}
                                data-turn={i === game.turn.playerIndex}
                                className='data-[user=true]:font-bold data-[turn=true]:underline'
                            >
                                {user !== null && player.uid === user.uid ? 'You' : player.name}
                                {i === 0 && ' (Host)'}
                            </span>
                            <span className='last:hidden'>•</span>
                        </React.Fragment>
                    ))
                )}
            </div>
            {game !== null && user !== null && !game.playersJoined && (
                <Button onClick={shareGame} className='bg-sky-500 text-white w-full'>
                    {shareMessage}
                </Button>
            )}
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

interface DiceProps {
    game: YahtzeeGame | null
    dice: Die[]
    setDice: React.Dispatch<React.SetStateAction<Die[]>>
}

const Dice: React.FC<DiceProps> = ({ game, dice, setDice }) => {
    const { gid } = useParams()
    const { user } = React.useContext(UserContext)

    const [shaking, setShaking] = React.useState(false)

    const updateLockedDice = (index: number) => {
        if (game === null || game.turn.roll === 0 || game.turn.roll >= 3) {
            return
        }
        setDice(dice.map(({ value, locked }, i) => ({ value, locked: i === index ? !locked : locked })))
    }
    const doDiceRoll = () => {
        if (gid === undefined || user === null) {
            return
        }
        setShaking(true)
        setTimeout(() => {
            const toKeep = dice.map((die, i) => (die.locked ? i : -1)).filter(val => val >= 0)
            postYahtzeeRoll(gid, user.uid, toKeep, () => {
                setShaking(false)
            })
        }, 820)
    }
    const rollButtonText = (): string => {
        if (game === null || user === null) {
            return 'Loading'
        } else if (!game.playersJoined) {
            return 'Waiting to Start'
        } else if (getPlayerIndex(game, user.uid) === game.turn.playerIndex) {
            switch (game.turn.roll) {
                case 0:
                    return 'First Roll'
                case 1:
                    return 'Roll Again'
                case 2:
                    return 'Last Roll'
                default:
                    return 'Out of Rolls'
            }
        } else {
            switch (game.turn.roll) {
                case 0:
                    return 'Roll 1'
                case 1:
                    return 'Roll 2'
                case 2:
                    return 'Roll 3'
                default:
                    return 'Out of Rolls'
            }
        }
    }

    return (
        <>
            <div className='w-full py-2 px-5 flex justify-center items-center flex-wrap gap-5'>
                {dice.map((die, index) => (
                    <button
                        key={crypto.randomUUID()}
                        data-locked={die.locked}
                        data-shaking={shaking && !die.locked}
                        disabled={game === null || game.turn.roll === 0 || game.turn.roll >= 3}
                        onClick={() => updateLockedDice(index)}
                        className='relative w-16 h-16 min-w-[4rem] min-h-[4rem] flex justify-center items-center border rounded border-black data-[locked=true]:ring data-[locked=true]:ring-red-500 data-[shaking=true]:animate-shake'
                    >
                        <Die value={die.value} />
                    </button>
                ))}
            </div>
            <Button
                disabled={
                    game === null ||
                    user === null ||
                    !game.playersJoined ||
                    game.turn.playerIndex !== getPlayerIndex(game, user.uid) ||
                    game.turn.roll >= 3
                }
                onClick={doDiceRoll}
                className='w-full bg-sky-500 text-white'
            >
                {rollButtonText()}
            </Button>
        </>
    )
}

interface DieProps {
    value: DieV
}

const Die: React.FC<DieProps> = ({ value }) => (
    <span className='absolute w-full h-full flex justify-center items-center'>
        {[1, 3, 5].includes(value) && <span className='w-2.5 h-2.5 bg-black rounded-full' />}
        {[4, 5, 6].includes(value) && <span className='absolute left-2.5 top-2.5 w-2.5 h-2.5 bg-black rounded-full' />}
        {value !== 1 && <span className='absolute right-2.5 top-2.5 w-2.5 h-2.5 bg-black rounded-full' />}
        {value !== 1 && <span className='absolute left-2.5 bottom-2.5 w-2.5 h-2.5 bg-black rounded-full' />}
        {[4, 5, 6].includes(value) && (
            <span className='absolute right-2.5 bottom-2.5 w-2.5 h-2.5 bg-black rounded-full' />
        )}
        {[6].includes(value) && <span className='absolute right-2.5 w-2.5 h-2.5 bg-black rounded-full' />}
        {[6].includes(value) && <span className='absolute left-2.5 w-2.5 h-2.5 bg-black rounded-full' />}
    </span>
)

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

interface ScorecardProps {
    game: YahtzeeGame | null
    playerIndex: number
}

const Scorecard: React.FC<ScorecardProps> = ({ game, playerIndex }) => {
    const { gid } = useParams()
    const { user } = React.useContext(UserContext)

    return (
        <div className='max-w-full flex overflow-clip'>
            {/* <h3 className='text-xl w-full -mb-3 text-left'>Scorecard</h3> */}
            <div className='flex min-w-fit flex-col'>
                {[
                    'Scorecard',
                    'Aces',
                    'Twos',
                    'Threes',
                    'Fours',
                    'Fives',
                    'Sixes',
                    'Total',
                    'Upper Bonus',
                    'Upper Total',
                    '',
                    '3 of a Kind',
                    '4 of a Kind',
                    'Full House',
                    'Small Straight',
                    'Large Straight',
                    'YAHTZEE',
                    'Chance',
                    'BONUS',
                    'Lower Total',
                    'Upper Total',
                    'Grand Total',
                ].map(s => (
                    <div
                        key={crypto.randomUUID()}
                        className='p-2 min-h-[40px] even:bg-gray-200 first:text-xl first:py-1.5 first:px-0 last:font-bold'
                    >
                        {s}
                    </div>
                ))}
            </div>
            <div className='flex overflow-x-scroll'>
                {gid !== undefined &&
                    user !== null &&
                    game !== null &&
                    game.players.map(({ name, card }, index) => (
                        <div key={crypto.randomUUID()} className='flex flex-col'>
                            <div className='p-2 min-h-[40px] min-w-[150px] text-center even:bg-gray-200'>{name}</div>
                            {[
                                {
                                    value: card.ones,
                                    valid: game.turn.dice.includes(1),
                                    accept: sum(game.turn.dice.filter(d => d === 1)),
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'ones', b),
                                },
                                {
                                    value: card.twos,
                                    valid: game.turn.dice.includes(2),
                                    accept: sum(game.turn.dice.filter(d => d === 2)),
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'twos', b),
                                },
                                {
                                    value: card.threes,
                                    valid: game.turn.dice.includes(3),
                                    accept: sum(game.turn.dice.filter(d => d === 3)),
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'threes', b),
                                },
                                {
                                    value: card.fours,
                                    valid: game.turn.dice.includes(4),
                                    accept: sum(game.turn.dice.filter(d => d === 4)),
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'fours', b),
                                },
                                {
                                    value: card.fives,
                                    valid: game.turn.dice.includes(5),
                                    accept: sum(game.turn.dice.filter(d => d === 5)),
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'fives', b),
                                },
                                {
                                    value: card.sixes,
                                    valid: game.turn.dice.includes(6),
                                    accept: sum(game.turn.dice.filter(d => d === 6)),
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'sixes', b),
                                },
                                {
                                    value: upperMinorTotal(card),
                                    valid: null,
                                    accept: 0,
                                    submit: () => {},
                                },
                                {
                                    value: upperMinorTotal(card) >= 63 ? 35 : null,
                                    valid: null,
                                    accept: 0,
                                    submit: () => {},
                                },
                                {
                                    value: upperTotal(card),
                                    valid: null,
                                    accept: 0,
                                    submit: () => {},
                                },
                                {
                                    value: '',
                                    valid: null,
                                    accept: 0,
                                    submit: () => {},
                                },
                                {
                                    value: card.triple,
                                    valid: isTriple(game.turn.dice),
                                    accept: sum(game.turn.dice),
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'triple', b),
                                },
                                {
                                    value: card.quadruple,
                                    valid: isQuadruple(game.turn.dice),
                                    accept: sum(game.turn.dice),
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'quadruple', b),
                                },
                                {
                                    value: card.fullHouse,
                                    valid: isFullHouse(game.turn.dice),
                                    accept: 25,
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'fullHouse', b),
                                },
                                {
                                    value: card.smallStraight,
                                    valid: isSmallStraight(game.turn.dice),
                                    accept: 30,
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'smallStraight', b),
                                },
                                {
                                    value: card.largeStraight,
                                    valid: isLargeStraight(game.turn.dice),
                                    accept: 40,
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'largeStraight', b),
                                },
                                {
                                    value: card.yahtzee,
                                    valid: equal(game.turn.dice),
                                    accept: 50,
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'yahtzee', b),
                                },
                                {
                                    value: card.chance,
                                    valid: true,
                                    accept: sum(game.turn.dice),
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'chance', b),
                                },
                                {
                                    value: card.extras,
                                    valid: (card.yahtzee && equal(game.turn.dice)) || null,
                                    accept: 100,
                                    submit: (b: boolean) => postYahtzeeMove(gid, user.uid, 'extras', b),
                                },
                                {
                                    value: lowerTotal(card),
                                    valid: null,
                                    accept: 0,
                                    submit: () => {},
                                },
                                {
                                    value: upperTotal(card),
                                    valid: null,
                                    accept: 0,
                                    submit: () => {},
                                },
                                {
                                    value: grandTotal(card),
                                    valid: null,
                                    accept: 0,
                                    submit: () => {},
                                },
                            ].map(({ value, valid, accept, submit }) => (
                                <div
                                    key={crypto.randomUUID()}
                                    className='p-2 min-h-[40px] justify-center even:bg-gray-200 flex gap-2'
                                >
                                    {value === null &&
                                        valid === true &&
                                        game.turn.playerIndex === playerIndex &&
                                        game.turn.roll !== 0 &&
                                        playerIndex === index && (
                                            <button
                                                onClick={() => submit(false)}
                                                className='text-xs text-white bg-lime-500 px-2 rounded'
                                            >
                                                Take: {accept}
                                            </button>
                                        )}
                                    {value === null &&
                                        valid === false &&
                                        game.turn.playerIndex === playerIndex &&
                                        game.turn.roll !== 0 &&
                                        playerIndex === index && (
                                            <button
                                                onClick={() => submit(true)}
                                                className='text-xs text-white bg-red-500 px-0.5 rounded'
                                            >
                                                <CancelIcon />
                                            </button>
                                        )}
                                    {value !== null && value}
                                </div>
                            ))}
                        </div>
                    ))}
            </div>
        </div>
    )
}

const sum = (numbers: number[]): number => numbers.reduce((s, v) => s + v, 0)
const equal = (numbers: number[]): boolean => numbers.map(v => v === numbers[0]).reduce((pv, v) => pv && v, true)
const isTriple = (dice: number[]): boolean => {
    const copy = [...dice].sort()
    return (
        (copy[0] === copy[1] && copy[1] === copy[2]) ||
        (copy[1] === copy[2] && copy[2] === copy[3]) ||
        (copy[2] === copy[3] && copy[3] === copy[4])
    )
}
const isQuadruple = (dice: number[]): boolean => {
    const copy = [...dice].sort()
    return (
        (copy[0] === copy[1] && copy[1] === copy[2] && copy[2] === copy[3]) ||
        (copy[1] === copy[2] && copy[2] === copy[3] && copy[3] === copy[4])
    )
}
const isFullHouse = (dice: number[]): boolean => {
    const copy = [...dice].sort()
    return (
        copy[0] !== copy[4] &&
        ((copy[0] === copy[1] && copy[1] === copy[2] && copy[3] === copy[4]) ||
            (copy[0] === copy[1] && copy[2] === copy[3] && copy[3] === copy[4]))
    )
}
const isSmallStraight = (dice: number[]): boolean => {
    const copy = [...dice].sort()
    const uniq = [...new Set(copy)]
    return (
        isLargeStraight(dice) ||
        uniq.toString().includes([1, 2, 3, 4].toString()) ||
        uniq.toString().includes([2, 3, 4, 5].toString()) ||
        uniq.toString().includes([3, 4, 5, 6].toString())
    )
}
const isLargeStraight = (dice: number[]): boolean => {
    const copy = [...dice].sort()
    const uniq = [...new Set(copy)]
    return uniq.toString() === [1, 2, 3, 4, 5].toString() || uniq.toString() === [2, 3, 4, 5, 6].toString()
}

const upperMinorTotal = (card: YahtzeeCard): number =>
    (card.ones || 0) + (card.twos || 0) + (card.threes || 0) + (card.fours || 0) + (card.fives || 0) + (card.sixes || 0)

const upperTotal = (card: YahtzeeCard): number => {
    const minorTotal = upperMinorTotal(card)
    if (minorTotal >= 63) {
        return minorTotal + 35
    }
    return minorTotal
}

const lowerTotal = (card: YahtzeeCard): number =>
    (card.triple || 0) +
    (card.quadruple || 0) +
    (card.fullHouse || 0) +
    (card.smallStraight || 0) +
    (card.largeStraight || 0) +
    (card.yahtzee || 0) +
    (card.chance || 0) +
    (card.bonus || 0)

const grandTotal = (card: YahtzeeCard): number => upperTotal(card) + lowerTotal(card)
