import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { onAuthStateChanged } from 'firebase/auth'
import { UserData, anonLogin, auth, getUserDetails } from './api'

import { TestPage } from './pages/TestPage'
import { Home } from './pages/Home'
import { ConnectHome } from './pages/ConnectHome'
import { ConnectPlay } from './pages/ConnectPlay'
import { UserContext } from './context'
import { Profile } from './pages/Profile'

const App = () => {
    const [userState, setUser] = React.useState<UserData | null>(null)

    React.useEffect(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                const uid = user.uid
                console.info('[AUTH] User is logged in with id', uid)
                getUserDetails(uid, data => setUser(data))
            } else {
                console.info('[AUTH] No user logged in - creating anonymous user')
                anonLogin()
            }
        })
    }, [])

    return (
        <UserContext.Provider value={{ user: userState, setUser }}>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/profile' element={<Profile />} />
                    <Route path='/play/connect' element={<ConnectHome />} />
                    <Route path='/play/connect/:gid' element={<ConnectPlay />} />
                    <Route path='/test' element={<TestPage />} />
                </Routes>
            </BrowserRouter>
        </UserContext.Provider>
    )
}

export default App
