import { addDoc, collection, doc, onSnapshot, runTransaction, updateDoc } from 'firebase/firestore'
import { GameID, UserID, addGame, database } from '.'

export type YahtzeeGame = {
    players: YahtzeePlayer[]
    playersJoined: boolean
    turn: {
        playerIndex: number
        roll: number
        dice: number[]
    }
    winner: number
}

export type YahtzeePlayer = {
    uid: UserID
    name: string
    card: YahtzeeCard
}

export type CardValue = number | null

export type YahtzeeMove =
    | 'ones'
    | 'twos'
    | 'threes'
    | 'fours'
    | 'fives'
    | 'sixes'
    | 'triple'
    | 'quadruple'
    | 'fullHouse'
    | 'smallStraight'
    | 'largeStraight'
    | 'yahtzee'
    | 'extras'
    | 'chance'

export type YahtzeeCard = {
    ones: CardValue
    twos: CardValue
    threes: CardValue
    fours: CardValue
    fives: CardValue
    sixes: CardValue
    bonus: CardValue
    triple: CardValue
    quadruple: CardValue
    fullHouse: CardValue
    smallStraight: CardValue
    largeStraight: CardValue
    yahtzee: CardValue
    extras: CardValue
    chance: CardValue
}

const newPlayer = (uid: UserID, name: string): YahtzeePlayer => {
    return {
        uid,
        name,
        card: {
            ones: null,
            twos: null,
            threes: null,
            fours: null,
            fives: null,
            sixes: null,
            bonus: null,
            triple: null,
            quadruple: null,
            fullHouse: null,
            smallStraight: null,
            largeStraight: null,
            yahtzee: null,
            extras: null,
            chance: null,
        },
    }
}

export const createYahtzeeGame = (uid: UserID, name: string, callback: (id: GameID) => any) => {
    const newGame: YahtzeeGame = {
        players: [newPlayer(uid, name)],
        playersJoined: false,
        turn: {
            playerIndex: 0,
            roll: 0,
            dice: randomDice([1, 1, 1, 1, 1], []),
        },
        winner: -1,
    }

    addDoc(collection(database, 'yahtzee'), newGame)
        .then(doc => {
            console.info('[YAHTZEE] Game created with id', doc.id)
            addGame(uid, 'yahtzee', doc.id)
            callback(doc.id)
        })
        .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
            console.error('[YAHTZEE] Creating game failed with code', errorCode, errorMessage)
        })
}

export const getYahtzeeGame = (gid: GameID, callback: (game: YahtzeeGame) => any) => {
    onSnapshot(doc(database, 'yahtzee', gid), doc => {
        if (doc.exists()) {
            const data = doc.data()
            callback({
                players: data.players,
                playersJoined: data.playersJoined,
                turn: data.turn,
                winner: data.winner,
            })
        } else {
            console.warn('[YAHTZEE] No game of yahtzee with id', gid)
        }
    })
}

export const putYahtzeePlayer = (gid: GameID, uid: UserID, name: string) => {
    const gameRef = doc(database, 'yahtzee', gid)

    try {
        runTransaction(database, async transaction => {
            const doc = await transaction.get(gameRef)
            if (doc.exists()) {
                const data = doc.data()
                const find = data.players.filter((player: YahtzeePlayer) => player.uid === uid)
                if (!data.playersJoined && find.length === 0) {
                    transaction.update(gameRef, { players: [...data.players, newPlayer(uid, name)] })
                    addGame(uid, 'yahtzee', gid)
                }
            }
        })
    } catch (e) {
        console.error('[YAHTZEE] Adding player to game failed', e)
    }
}

export const putYahtzeeAllPlayersJoined = (gid: GameID) => {
    updateDoc(doc(database, 'yahtzee', gid), {
        playersJoined: true,
    }).catch(error => {
        const errorCode = error.code
        const errorMessage = error.message
        console.error('[YAHTZEE] Setting playersJoined failed with code', errorCode, errorMessage)
    })
}

const getPlayerIndex = (game: YahtzeeGame, uid: UserID): number => {
    for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].uid === uid) {
            return i
        }
    }
    return -1
}

const randomDice = (dice: number[], keepIndex: number[]): number[] => {
    for (let i = 0; i < 5; i++) {
        if (!keepIndex.includes(i)) {
            dice[i] = Math.floor(Math.random() * 6) + 1
        }
    }
    return dice
}

export const postYahtzeeRoll = (gid: GameID, uid: UserID, keepIndex: number[], callback: () => any) => {
    const gameRef = doc(database, 'yahtzee', gid)

    try {
        runTransaction(database, async transaction => {
            const doc = await transaction.get(gameRef)
            if (doc.exists()) {
                const data = doc.data()
                const game: YahtzeeGame = {
                    players: data.players,
                    playersJoined: data.playersJoined,
                    turn: data.turn,
                    winner: data.winner,
                }
                const playerIndex = getPlayerIndex(game, uid)
                if (
                    !game.playersJoined ||
                    playerIndex === -1 ||
                    playerIndex !== game.turn.playerIndex ||
                    game.turn.roll >= 3 ||
                    game.winner !== -1
                ) {
                    return
                }
                if (game.turn.roll === 0) {
                    keepIndex = []
                }
                transaction.update(gameRef, {
                    turn: {
                        playerIndex,
                        roll: game.turn.roll + 1,
                        dice: randomDice(game.turn.dice, keepIndex),
                    },
                })
            }
        })
    } catch (e) {
        console.error('[YAHTZEE] Rolling dice failed', e)
    } finally {
        callback()
    }
}

const sum = (numbers: number[]): number => numbers.reduce((s, v) => s + v, 0)
const moveMap = (move: YahtzeeMove, card: YahtzeeCard, dice: number[]): { existing: CardValue; worth: number } => {
    switch (move) {
        case 'ones':
            return { existing: card.ones, worth: sum(dice.filter(v => v === 1)) }
        case 'twos':
            return { existing: card.twos, worth: sum(dice.filter(v => v === 2)) }
        case 'threes':
            return { existing: card.threes, worth: sum(dice.filter(v => v === 3)) }
        case 'fours':
            return { existing: card.fours, worth: sum(dice.filter(v => v === 4)) }
        case 'fives':
            return { existing: card.fives, worth: sum(dice.filter(v => v === 5)) }
        case 'sixes':
            return { existing: card.sixes, worth: sum(dice.filter(v => v === 6)) }
        case 'triple':
            return { existing: card.triple, worth: sum(dice) }
        case 'quadruple':
            return { existing: card.quadruple, worth: sum(dice) }
        case 'fullHouse':
            return { existing: card.fullHouse, worth: 25 }
        case 'smallStraight':
            return { existing: card.smallStraight, worth: 30 }
        case 'largeStraight':
            return { existing: card.largeStraight, worth: 40 }
        case 'yahtzee':
            return { existing: card.yahtzee, worth: 50 }
        case 'extras':
            return { existing: card.extras, worth: 100 }
        case 'chance':
            return { existing: card.chance, worth: sum(dice) }
    }
}

export const postYahtzeeMove = (gid: GameID, uid: UserID, option: YahtzeeMove, scratch: boolean) => {
    const gameRef = doc(database, 'yahtzee', gid)

    try {
        runTransaction(database, async transaction => {
            const doc = await transaction.get(gameRef)
            if (doc.exists()) {
                const data = doc.data()
                const game: YahtzeeGame = {
                    players: data.players,
                    playersJoined: data.playersJoined,
                    turn: data.turn,
                    winner: data.winner,
                }
                const playerIndex = getPlayerIndex(game, uid)
                if (
                    !game.playersJoined ||
                    playerIndex === -1 ||
                    playerIndex !== game.turn.playerIndex ||
                    game.turn.roll === 0 ||
                    game.turn.roll > 3
                ) {
                    return
                }
                const { existing, worth } = moveMap(option, game.players[playerIndex].card, game.turn.dice)
                if (option === 'extras') {
                    game.players[playerIndex].card.extras = (game.players[playerIndex].card.extras || 0) + worth
                    if (game.players[playerIndex].card.ones === null && game.turn.dice[0] === 1) {
                        game.players[playerIndex].card.ones = 5
                    } else if (game.players[playerIndex].card.twos === null && game.turn.dice[0] === 2) {
                        game.players[playerIndex].card.twos = 10
                    } else if (game.players[playerIndex].card.threes === null && game.turn.dice[0] === 3) {
                        game.players[playerIndex].card.threes = 15
                    } else if (game.players[playerIndex].card.fours === null && game.turn.dice[0] === 4) {
                        game.players[playerIndex].card.fours = 20
                    } else if (game.players[playerIndex].card.fives === null && game.turn.dice[0] === 5) {
                        game.players[playerIndex].card.fives = 25
                    } else if (game.players[playerIndex].card.sixes === null && game.turn.dice[0] === 6) {
                        game.players[playerIndex].card.sixes = 30
                    } else if (game.players[playerIndex].card.triple === null) {
                        game.players[playerIndex].card.triple = sum(game.turn.dice)
                    } else if (game.players[playerIndex].card.quadruple === null) {
                        game.players[playerIndex].card.quadruple = sum(game.turn.dice)
                    } else if (game.players[playerIndex].card.fullHouse === null) {
                        game.players[playerIndex].card.fullHouse = 25
                    } else if (game.players[playerIndex].card.smallStraight === null) {
                        game.players[playerIndex].card.smallStraight = 30
                    } else if (game.players[playerIndex].card.largeStraight === null) {
                        game.players[playerIndex].card.largeStraight = 40
                    } else if (game.players[playerIndex].card.chance === null) {
                        game.players[playerIndex].card.chance = sum(game.turn.dice)
                    }
                } else if (existing !== null) {
                    return
                } else if (option === 'ones') {
                    game.players[playerIndex].card.ones = scratch ? 0 : worth
                } else if (option === 'twos') {
                    game.players[playerIndex].card.twos = scratch ? 0 : worth
                } else if (option === 'threes') {
                    game.players[playerIndex].card.threes = scratch ? 0 : worth
                } else if (option === 'fours') {
                    game.players[playerIndex].card.fours = scratch ? 0 : worth
                } else if (option === 'fives') {
                    game.players[playerIndex].card.fives = scratch ? 0 : worth
                } else if (option === 'sixes') {
                    game.players[playerIndex].card.sixes = scratch ? 0 : worth
                } else if (option === 'triple') {
                    game.players[playerIndex].card.triple = scratch ? 0 : worth
                } else if (option === 'quadruple') {
                    game.players[playerIndex].card.quadruple = scratch ? 0 : worth
                } else if (option === 'fullHouse') {
                    game.players[playerIndex].card.fullHouse = scratch ? 0 : worth
                } else if (option === 'smallStraight') {
                    game.players[playerIndex].card.smallStraight = scratch ? 0 : worth
                } else if (option === 'largeStraight') {
                    game.players[playerIndex].card.largeStraight = scratch ? 0 : worth
                } else if (option === 'yahtzee') {
                    game.players[playerIndex].card.yahtzee = scratch ? 0 : worth
                } else if (option === 'chance') {
                    game.players[playerIndex].card.chance = scratch ? 0 : worth
                }

                let winner = -1
                if (
                    game.players[playerIndex].card.ones !== null &&
                    game.players[playerIndex].card.twos !== null &&
                    game.players[playerIndex].card.threes !== null &&
                    game.players[playerIndex].card.fours !== null &&
                    game.players[playerIndex].card.fives !== null &&
                    game.players[playerIndex].card.sixes !== null &&
                    game.players[playerIndex].card.triple !== null &&
                    game.players[playerIndex].card.quadruple !== null &&
                    game.players[playerIndex].card.fullHouse !== null &&
                    game.players[playerIndex].card.smallStraight !== null &&
                    game.players[playerIndex].card.largeStraight !== null &&
                    game.players[playerIndex].card.yahtzee !== null &&
                    game.players[playerIndex].card.chance !== null &&
                    playerIndex === game.players.length - 1
                ) {
                    const scores = game.players.map(player => grandTotal(player.card))
                    winner = scores.indexOf(Math.max(...scores))
                }
                console.log('[YAHTZEE] Updating card to', game.players[playerIndex].card)
                transaction.update(gameRef, {
                    players: game.players,
                    turn: {
                        playerIndex: (playerIndex + 1) % game.players.length,
                        roll: 0,
                        dice: game.turn.dice,
                    },
                    winner,
                })
            }
        })
    } catch (e) {
        console.error('[YAHTZEE] Making move failed', e)
    }
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
