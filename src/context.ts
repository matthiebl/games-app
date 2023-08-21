import React from 'react'
import { UserData } from './api'

export type ContextT = {
    user: UserData | null
    setUser: React.Dispatch<React.SetStateAction<UserData | null>>
}

const defaultUserContext: ContextT = {
    user: null,
    setUser: () => {},
}

export const UserContext = React.createContext<ContextT>(defaultUserContext)
