import { GameDB, auth, database } from '.'
import { signInAnonymously, signOut } from 'firebase/auth'
import { deleteDoc, doc, onSnapshot, runTransaction, setDoc, updateDoc } from 'firebase/firestore'

export type UserID = string
export type GameID = string

export type Game = {
    game: GameDB
    id: GameID
}

export type UserData = {
    uid: UserID
    name: string
    isAnonymous: boolean
    wins: number
    games: Game[]
    invites: Game[]
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

export const anonLogin = () => {
    signInAnonymously(auth)
        .then(cred => {
            const uid = cred.user.uid
            createUserDetails(uid, 'Anonymous', true, () => {})
        })
        .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
            console.error('[AUTH] Anon login failed with code', errorCode, errorMessage)
        })
}

export const createUserDetails = (uid: UserID, name: string, anon: boolean, callback: (user: UserData) => any) => {
    const user = {
        uid,
        name,
        isAnonymous: anon,
        wins: 0,
        games: [],
        invites: [],
    }
    setDoc(doc(database, 'users', uid), user)
        .then(() => {
            callback(user)
        })
        .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
            console.error('[DB] Creating user details failed with code', errorCode, errorMessage)
        })
}

export const getUserDetails = (uid: UserID, callback: (user: UserData) => any) => {
    onSnapshot(doc(database, 'users', uid), doc => {
        if (doc.exists()) {
            const data = doc.data()
            callback({
                uid,
                name: data.name,
                isAnonymous: data.isAnonymous,
                wins: data.wins,
                games: data.games,
                invites: data.invites,
            })
        } else {
            console.warn('[DB] Retrieving user details failed for', uid)
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

export const addGame = (uid: UserID, type: GameDB, gid: GameID) => {
    const userRef = doc(database, 'users', uid)
    const newGame: Game = {
        game: type,
        id: gid,
    }

    try {
        runTransaction(database, async transaction => {
            const doc = await transaction.get(userRef)
            if (doc.exists()) {
                const data = doc.data()
                transaction.update(userRef, { games: [...data.games, newGame] })
            }
        })
    } catch (e) {
        console.error('[DB] Adding game to user failed', e)
    }
}

export const addGameWin = (user: UserData) => {
    updateDoc(doc(database, 'users', user.uid), {
        wins: user.wins + 1,
    }).catch(error => {
        const errorCode = error.code
        const errorMessage = error.message
        console.error('[DB] Updating user wins failed with code', errorCode, errorMessage)
    })
}

export const updateUserName = (uid: UserID, name: string) => {
    updateDoc(doc(database, 'users', uid), {
        name,
    }).catch(error => {
        const errorCode = error.code
        const errorMessage = error.message
        console.error('[DB] Updating user name failed with code', errorCode, errorMessage)
    })
}

export const sendGameInvite = (uid: UserID, type: GameDB, gid: GameID) => {
    const userRef = doc(database, 'users', uid)
    const invite: Game = {
        game: type,
        id: gid,
    }

    try {
        runTransaction(database, async transaction => {
            const doc = await transaction.get(userRef)
            if (doc.exists()) {
                const data = doc.data()
                transaction.update(userRef, { invites: [...data.invites, invite] })
            }
        })
    } catch (e) {
        console.error('[DB] Inviting to user failed', e)
    }
}

export const acceptGameInvite = (uid: UserID, gid: GameID) => {
    const userRef = doc(database, 'users', uid)

    try {
        runTransaction(database, async transaction => {
            const doc = await transaction.get(userRef)
            if (doc.exists()) {
                const data = doc.data()
                transaction.update(userRef, { invites: data.invites.filter((g: Game) => g.id !== gid) })
            }
        })
    } catch (e) {
        console.error('[DB] Inviting to user failed', e)
    }
}
