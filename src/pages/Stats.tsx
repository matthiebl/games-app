import React from 'react'
import { Card, Page } from '../components'
import { UserContext } from '../context'
import { Game } from '../api'

interface StatsProps {}

export const Stats: React.FC<StatsProps> = ({}) => {
    const { user } = React.useContext(UserContext)

    const [connect, setConnect] = React.useState<Game[]>([])

    React.useEffect(() => {
        if (user === null) {
            return
        } else {
            setConnect(user.games.filter(game => game.game === 'connect'))
        }
    }, [user])

    return (
        <Page centered>
            <div className='w-full max-w-4xl h-full p-5 flex-col gap-5 flex'>
                <h1 className='text-3xl font-extrabold'>Stats</h1>
                <div>You've won {user === null ? '0' : user.wins} games!</div>
                <Card className='flex flex-col gap-3 text-gray-600'>
                    <h3 className='text-lg text-black'>Connect 4 Stats</h3>
                    <div>You've played {connect.length} game(s) of Connect 4.</div>
                </Card>
            </div>
        </Page>
    )
}
