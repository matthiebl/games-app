import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { onAuthStateChanged } from 'firebase/auth'
import { anonLogin, auth } from './api'

import { TestPage } from './pages/TestPage'

const App = () => {
    React.useEffect(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                const uid = user.uid
                console.info('[AUTH] User is logged in with id', uid, user)
                // getUserDetails(uid)
            } else {
                console.info('[AUTH] No user logged in - creating anonymous user')
                anonLogin()
            }
        })
    }, [])

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<TestPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
