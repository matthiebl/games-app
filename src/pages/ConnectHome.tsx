import React from 'react'
import { Button, LoadingIcon, Page } from '../components'
import { createConnectGame } from '../api'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context'

interface ConnectHomeProps {}

export const ConnectHome: React.FC<ConnectHomeProps> = ({}) => {
    const navigate = useNavigate()
    const { user } = React.useContext(UserContext)

    const [code, setCode] = React.useState<string>('')
    const [host, setHost] = React.useState<boolean>(false)

    const onHost = () => {
        if (user === null) {
            return
        }
        setHost(true)
        createConnectGame(user.uid, user.name, gid => navigate(`/play/connect/${gid}`))
    }

    const onJoin = () => {
        navigate(`/play/connect/${code}`)
    }

    return (
        <Page centered>
            <div className='w-full max-w-4xl h-full p-5 flex-col gap-5 flex'>
                <h1 className='text-3xl font-extrabold'>Play Connect 4</h1>

                <div className='border bg-white shadow-lg rounded-lg p-5 gap-5'>
                    <h2 className='text-xl mb-2'>Join a friend's game!</h2>
                    <form className='grid-cols-4 grid gap-4 items-center' onSubmit={e => e.preventDefault()}>
                        <input
                            type='text'
                            placeholder='Join code'
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            autoFocus
                            required
                            className='col-span-4 sm:col-span-3 px-2 py-1 rounded'
                        />
                        <Button
                            onClick={onJoin}
                            disabled={user === null || code === ''}
                            className='col-span-4 sm:col-span-1 bg-lime-500 text-white'
                        >
                            JOIN
                        </Button>
                    </form>
                </div>

                <span className='text-center'>or</span>

                <Button
                    onClick={onHost}
                    disabled={user === null}
                    className='col-span-3 flex justify-center bg-sky-500 text-white'
                >
                    {host ? <LoadingIcon /> : 'HOST GAME'}
                </Button>
            </div>
        </Page>
    )
}
