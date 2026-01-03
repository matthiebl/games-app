import React from 'react'
import { Button, Card, LoadingIcon, Page } from '../components'
import { createBattleshipGame } from '../api'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context'

interface BattleshipHomeProps {}

export const BattleshipHome: React.FC<BattleshipHomeProps> = ({}) => {
    const navigate = useNavigate()
    const { user } = React.useContext(UserContext)

    const [code, setCode] = React.useState<string>('')
    const [host, setHost] = React.useState<boolean>(false)

    const onHost = () => {
        if (user === null) {
            return
        }
        setHost(true)
        createBattleshipGame(user.uid, user.name, gid => navigate(`/play/battleship/${gid}`))
    }

    const onJoin = () => {
        navigate(`/play/battleship/${code}`)
    }

    return (
        <Page centered>
            <div className='w-full max-w-4xl h-full p-5 flex-col gap-5 flex'>
                <h1 className='text-3xl font-extrabold'>Play Battleship</h1>

                <Card className='gap-5'>
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
                </Card>

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
