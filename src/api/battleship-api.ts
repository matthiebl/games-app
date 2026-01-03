import { addDoc, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { GameID, UserData, UserID, addGame, addGameWin, database } from '.'

export type BattleshipPlayerData = {
    uid: UserID
    name: string
    ships: Ship[]
    guesses: BattleshipGuesses
}

export type BattleshipGuesses = { [row: number]: BattleshipGuess[] }

export enum BattleshipGuess {
    Hit = 'HIT',
    Miss = 'MISS',
    None = 'NONE',
}

export enum ShipId {
    Two = 'TWO',
    ThreeA = 'THREE_A',
    ThreeB = 'THREE_B',
    Four = 'FOUR',
    Five = 'FIVE',
}

export type Ship = {
    id: ShipId
    row: number
    col: number
    dir: 'RIGHT' | 'DOWN'
}

export enum BattleshipPlayer {
    Player1 = 'PLAYER_1',
    Player2 = 'PLAYER_2',
}

export type BattleshipGame = {
    player1: BattleshipPlayerData
    player2: BattleshipPlayerData

    turn: BattleshipPlayer
    winner: BattleshipPlayer | ''
}

export const emptyGuesses: BattleshipGuesses = {
    ...new Array(10).fill(null).map(() => new Array(10).fill(BattleshipGuess.None)),
}

export const getBattleshipGame = (gid: GameID, callback: (game: BattleshipGame) => any) => {
    onSnapshot(doc(database, 'battleship', gid), doc => {
        if (doc.exists()) {
            const data = doc.data()
            callback({
                player1: data.player1,
                player2: data.player2,
                turn: data.turn,
                winner: data.winner,
            })
        } else {
            console.warn('[BATTLESHIP] No game of battleship with id', gid)
        }
    })
}

export const createBattleshipGame = (uid: UserID, name: string, callback: (id: GameID) => any) => {
    addDoc(collection(database, 'battleship'), {
        player1: {
            uid,
            name,
            ships: [],
            guesses: emptyGuesses,
        },
        player2: {
            uid: '',
            name: '',
            ships: [],
            guesses: emptyGuesses,
        },
        turn: BattleshipPlayer.Player1,
        winner: '',
    })
        .then(doc => {
            console.info('[BATTLESHIP] Battlehip game created with id', doc.id)
            addGame(uid, 'battleship', doc.id)
            callback(doc.id)
        })
        .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
            console.error('[BATTLESHIP] Creating game failed with code', errorCode, errorMessage)
        })
}

export const joinAsSecondPlayerToBattleshipGame = (gid: GameID, uid: UserID, name: string) => {
    updateDoc(doc(database, 'battleship', gid), {
        player2: uid,
        player2Name: name,
    })
        .then(() => addGame(uid, 'battleship', gid))
        .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
            console.error('[BATTLESHIP] Setting player 2 failed with code', errorCode, errorMessage)
        })
}

export const placeBattleshipShips = (gid: GameID, uid: UserID, game: BattleshipGame, ships: Ship[]) => {
    // const update = player ===
    updateDoc(doc(database, 'battleship', gid), {}).catch(error => {
        const errorCode = error.code
        const errorMessage = error.message
        console.error('[BATTLESHIP] Placing piece failed with code', errorCode, errorMessage)
    })
}

export const makeBattleshipGuess = () => {}

// const checkWinner = (board: ConnectBoard, player: ConnectPiece): boolean => {
//     // Check verticals
//     for (let i = 0; i < 7; i++) {
//         for (let j = 0; j < 3; j++) {
//             if (
//                 board[i][j] === player &&
//                 board[i][j + 1] === player &&
//                 board[i][j + 2] === player &&
//                 board[i][j + 3] === player
//             ) {
//                 return true
//             }
//         }
//     }
//     // Check horizontals
//     for (let i = 0; i < 4; i++) {
//         for (let j = 0; j < 6; j++) {
//             if (
//                 board[i][j] === player &&
//                 board[i + 1][j] === player &&
//                 board[i + 2][j] === player &&
//                 board[i + 3][j] === player
//             ) {
//                 return true
//             }
//         }
//     }
//     // Check diagonal up right
//     for (let i = 0; i < 4; i++) {
//         for (let j = 0; j < 3; j++) {
//             if (
//                 board[i][j] === player &&
//                 board[i + 1][j + 1] === player &&
//                 board[i + 2][j + 2] === player &&
//                 board[i + 3][j + 3] === player
//             ) {
//                 return true
//             }
//         }
//     }
//     // Check diagonal down right
//     for (let i = 3; i < 7; i++) {
//         for (let j = 0; j < 3; j++) {
//             if (
//                 board[i][j] === player &&
//                 board[i - 1][j + 1] === player &&
//                 board[i - 2][j + 2] === player &&
//                 board[i - 3][j + 3] === player
//             ) {
//                 return true
//             }
//         }
//     }
//     return false
// }

// export const connectGameMessage = (game: ConnectGame, player: ConnectPiece | ''): string => {
//     if (player === '') {
//         if (game.winner === '1') {
//             return 'PLAYER 1 WON'
//         } else if (game.winner === '2') {
//             return 'PLAYER 2 WON'
//         } else if (game.winner === 'T') {
//             return 'TIE'
//         }
//         return 'SPECTATING'
//     } else if (game.winner === 'T') {
//         return 'TIE'
//     } else if (game.winner !== '' && player === game.winner) {
//         return `YOU WON`
//     } else if (game.winner !== '' && player !== game.winner) {
//         return `YOU LOST`
//     } else if (game.player2 === '') {
//         return 'WAITING FOR OPPONENT'
//     } else if (game.turn === player) {
//         return 'YOUR TURN'
//     } else {
//         return `OPPONENT'S TURN`
//     }
// }
