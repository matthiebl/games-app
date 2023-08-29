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

export type YahtzeeCard = CardValue[]
// {
//     ones: CardValue
//     twos: CardValue
//     threes: CardValue
//     fours: CardValue
//     fives: CardValue
//     sixes: CardValue
//     bonus: CardValue
//     triple: CardValue
//     quadruple: CardValue
//     fullHouse: CardValue
//     smallStraight: CardValue
//     largeStraight: CardValue
//     yahtzee: CardValue
//     extras: CardValue
//     chance: CardValue
// }

const newPlayer = (uid: UserID, name: string): YahtzeePlayer => {
    return {
        uid,
        name,
        card: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        // {
        //     ones: null,
        //     twos: null,
        //     threes: null,
        //     fours: null,
        //     fives: null,
        //     sixes: null,
        //     bonus: null,
        //     triple: null,
        //     quadruple: null,
        //     fullHouse: null,
        //     smallStraight: null,
        //     largeStraight: null,
        //     yahtzee: null,
        //     extras: null,
        //     chance: null,
        // },
    }
}

export const createYahtzeeGame = (uid: UserID, name: string, callback: (id: GameID) => any) => {
    const newGame: YahtzeeGame = {
        players: [newPlayer(uid, name)],
        playersJoined: false,
        turn: {
            playerIndex: -1,
            roll: 0,
            dice: [1, 1, 1, 1, 1],
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
