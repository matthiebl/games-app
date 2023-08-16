import React from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, signUserOut } from '../api'

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
        <div className='w-full h-full flex gap-2 flex-col justify-center items-center'>
            <button className='py-2 px-4 border rounded' disabled={loading} onClick={() => signUserOut()}>
                Log Out
            </button>
        </div>
    )
}
