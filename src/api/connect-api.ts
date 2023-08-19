import { addDoc, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { GameID, UserID, database } from '.'

export type ConnectGame = {
    player1: UserID
    player1Name: string
    player2: UserID
    player2Name: string
    board: ConnectBoard
    turn: ConnectPiece
    winner: ConnectPiece | '' | 'T'
}

type Opaque<K, T> = T & { __TYPE__: K }
type ConnectColumn = Opaque<string, 'ConnectColumn'>

const parseConnectColumn = (str: string): ConnectColumn => {
    const col = str.substring(0, 7)
    if (!/^[1|2]{0,7}$/.test(col)) {
        console.error(`[GAME] Connect column was malformed: "${str}". Emptying column`)
        return '' as ConnectColumn
    }
    return col.toString() as ConnectColumn // casting is needed.
}

export type ConnectPiece = '1' | '2'
export type ConnectBoard = ConnectColumn[]

export const getConnectGame = (gid: GameID, callback: (game: ConnectGame) => any) => {
    onSnapshot(doc(database, 'connect', gid), doc => {
        if (doc.exists()) {
            const data = doc.data()
            const board: string[] = data.board
            callback({
                player1: data.player1,
                player1Name: data.player1Name,
                player2: data.player2,
                player2Name: data.player2Name,
                board: board.map((s: string) => parseConnectColumn(s)),
                turn: data.turn,
                winner: data.winner,
            })
        } else {
            console.warn('[CONNECT] No game of connect with id', gid)
        }
    })
}

export const createConnectGame = (uid: UserID, name: string, callback: (id: GameID) => any) => {
    addDoc(collection(database, 'connect'), {
        player1: uid,
        player1Name: name,
        player2: '',
        player2Name: '',
        board: ['', '', '', '', '', '', ''],
        turn: '1',
        winner: '',
    })
        .then(doc => {
            console.info('[CONNECT] Connect game created with id', doc.id)
            callback(doc.id)
        })
        .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
            console.error('[CONNECT] Creating game failed with code', errorCode, errorMessage)
        })
}

export const joinAsSecondPlayerToConnectGame = (gid: GameID, uid: UserID, name: string) => {
    updateDoc(doc(database, 'connect', gid), {
        player2: uid,
        player2Name: name,
    })
        .then(() => console.log('Added as 2nd player', uid))
        .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
            console.error('[CONNECT] Setting player 2 failed with code', errorCode, errorMessage)
        })
}

export const placeConnectPiece = (gid: GameID, board: ConnectBoard, player: ConnectPiece, column: number) => {
    const newBoard = board
    newBoard[column] = parseConnectColumn(board[column] + player)
    const winner = checkWinner(newBoard, player) ? player : checkTie(newBoard) ? 'T' : ''

    updateDoc(doc(database, 'connect', gid), {
        board: newBoard,
        turn: player === '1' ? '2' : '1',
        winner,
    }).catch(error => {
        const errorCode = error.code
        const errorMessage = error.message
        console.error('[CONNECT] Placing piece failed with code', errorCode, errorMessage)
    })
}

const checkWinner = (board: ConnectBoard, player: ConnectPiece): boolean => {
    // Check verticals
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 4; j++) {
            if (
                board[i][j] === player &&
                board[i][j + 1] === player &&
                board[i][j + 2] === player &&
                board[i][j + 3] === player
            ) {
                return true
            }
        }
    }
    // Check horizontals
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 7; j++) {
            if (
                board[i][j] === player &&
                board[i + 1][j] === player &&
                board[i + 2][j] === player &&
                board[i + 3][j] === player
            ) {
                return true
            }
        }
    }
    // Check diagonal up right
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (
                board[i][j] === player &&
                board[i + 1][j + 1] === player &&
                board[i + 2][j + 2] === player &&
                board[i + 3][j + 3] === player
            ) {
                return true
            }
        }
    }
    // Check diagonal down right
    for (let i = 3; i < 7; i++) {
        for (let j = 0; j < 4; j++) {
            if (
                board[i][j] === player &&
                board[i - 1][j + 1] === player &&
                board[i - 2][j + 2] === player &&
                board[i - 3][j + 3] === player
            ) {
                return true
            }
        }
    }
    return false
}

const checkTie = (board: ConnectBoard): boolean => {
    return board.map(c => c.length).reduce((sum, i) => sum + i, 0) === 49
}

export const connectGameMessage = (game: ConnectGame, player: ConnectPiece | ''): string => {
    if (player === '') {
        return 'SPECTATING'
    } else if (game.winner === 'T') {
        return 'TIE'
    } else if (game.winner !== '' && player === game.winner) {
        return `YOU WIN`
    } else if (game.winner !== '' && player !== game.winner) {
        return `YOU LOST`
    } else if (game.player2 === '') {
        return 'WAITING FOR OPPONENT'
    } else if (game.turn === player) {
        return 'YOUR TURN'
    } else {
        return `OPPONENT'S TURN`
    }
}
