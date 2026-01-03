import React from 'react'
import { Button, Page } from '../components'
import { useNavigate } from 'react-router-dom'

interface HomeProps {}

export const Home: React.FC<HomeProps> = ({}) => {
    const navigate = useNavigate()

    return (
        <Page centered>
            <div className='w-full max-w-4xl h-full p-5 flex-col gap-5 flex'>
                <h1 className='text-3xl text-center font-extrabold'>Home</h1>
                <Button onClick={() => navigate('/play/connect')} className='bg-sky-500 text-white'>
                    Play Connect 4
                </Button>
                <Button onClick={() => navigate('/play/yahtzee')} className='bg-sky-500 text-white'>
                    Play Yahtzee
                </Button>
                <Button onClick={() => navigate('/play/battleship')} className='bg-sky-500 text-white'>
                    Play Battleship
                </Button>
            </div>
        </Page>
    )
}
