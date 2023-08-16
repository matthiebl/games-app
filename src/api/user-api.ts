import { auth, database } from '.'
import { signInAnonymously, signOut } from 'firebase/auth'
import { deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'

export type UserID = string
export type GameID = string

export type Game = {}

export type UserData = {
    uid: UserID
    name: string
    anon: boolean
    wins: number
    games: Game[]
}

export const signUserOut = () => {
    const anon = auth.currentUser?.isAnonymous || false
    const uid = auth.currentUser?.uid
    signOut(auth)
        .then(() => {
            if (uid && anon) {
                deleteUserDetails(uid)
            }
        })
        .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
            console.error('[AUTH] Log out failed with code', errorCode, errorMessage)
        })
}

export const anonLogin = (callback: (user: UserData) => any) => {
    signInAnonymously(auth)
        .then(cred => {
            const uid = cred.user.uid
            createUserDetails(uid, 'Anon', true, callback)
        })
        .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
            console.error('[AUTH] Anon login failed with code', errorCode, errorMessage)
        })
}

export const createUserDetails = (uid: UserID, name: string, anon: boolean, callback: (user: UserData) => any) => {
    const game = {
        uid,
        name,
        anon,
        wins: 0,
        games: [],
    }
    setDoc(doc(database, 'users', uid), game)
        .then(() => {
            callback(game)
        })
        .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
            console.error('[DB] Creating user details failed with code', errorCode, errorMessage)
        })
}

export const getUserDetails = (uid: UserID) => {
    onSnapshot(doc(database, 'users', uid), data => {
        console.log('Data', data)
        if (data.exists()) {
            console.log(data.data())
        } else {
            console.error('[DB] No user data for user with id', uid)
        }
    })
}

export const deleteUserDetails = (uid: UserID) => {
    deleteDoc(doc(database, 'users', uid))
        .then(() => {
            console.info('[DB] Successfully deteled user data ')
        })
        .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
            console.error('[DB] Deleting user details failed with code', errorCode, errorMessage)
        })
}
