import { DocumentData, addDoc, collection, doc, onSnapshot } from 'firebase/firestore'
import { GameID, UserID, database } from '.'

export type ConnectGame = {
    player1: UserID
    player2: UserID
    board: ConnectBoard
    turn: ConnectPiece
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

export const getConnectGame = (id: GameID, callback: (list: DocumentData) => any) => {
    onSnapshot(doc(database, 'connect', id), doc => {
        if (doc.exists()) {
            callback(doc.data())
        } else {
            console.error('[DB] No game of connect with id', id)
        }
    })
}

export const createConnectGame = (uid: UserID, callback: (id: GameID) => any) => {
    addDoc(collection(database, 'connect'), {
        player1: uid,
        player2: '',
        board: ['', '', '', '', '', '', ''],
        turn: '1',
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
