import { DocumentData, doc, onSnapshot } from 'firebase/firestore'
import { GameID, database } from '.'

export const getConnectGame = (id: GameID, callback: (list: DocumentData) => any) => {
    onSnapshot(doc(database, 'connect', id), data => {
        if (data.exists()) {
            callback(data.data())
        } else {
            console.error('[DB] No game of connect with id', id)
        }
    })
}
