import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { onAuthStateChanged } from 'firebase/auth'
import { UserData, anonLogin, auth, getUserDetails } from './api'

import { TestPage } from './pages/TestPage'
import { Home } from './pages/Home'
import { ConnectHome } from './pages/ConnectHome'
import { ConnectPlay } from './pages/ConnectPlay'

const App = () => {
    const [user, setUser] = React.useState<UserData | null>(null)

    React.useEffect(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                const uid = user.uid
                console.info('[AUTH] User is logged in with id', uid)
                if (user.isAnonymous) {
                    setUser({
                        uid,
                        name: 'Anonymous',
                        isAnonymous: true,
                        wins: 0,
                        games: [],
                    })
                } else {
                    getUserDetails(uid, data => setUser(data))
                }
            } else {
                console.info('[AUTH] No user logged in - creating anonymous user')
                anonLogin()
            }
        })
    }, [])

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/play/connect' element={<ConnectHome user={user} />} />
                <Route path='/play/connect/:gid' element={<ConnectPlay user={user} />} />
                <Route path='/test' element={<TestPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
