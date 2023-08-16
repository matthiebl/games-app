import React from 'react'
import { UserID } from './api'

export type ContextT = {
    currentUser: UserID | null
}

const defaultUserContext: ContextT = {
    currentUser: null,
}

export const UserContext = React.createContext<ContextT>(defaultUserContext)
