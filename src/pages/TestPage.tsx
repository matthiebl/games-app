import React from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../api'

interface TestPageProps {}

export const TestPage: React.FC<TestPageProps> = ({}) => {
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                setLoading(false)
            } else {
                setLoading(true)
            }
        })
    }, [])

    return (
        <div className='w-full h-full flex flex-col items-center'>
            <header className='flex items-center justify-center bg-green-500'>Header</header>
            <div className='w-[80vh] max-w-screen aspect-square max-h-[80vh] mx-0 my-auto flex-1 overflow-auto bg-red-500'>
                {loading}
            </div>
        </div>
    )
}
