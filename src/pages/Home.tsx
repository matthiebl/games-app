import React from 'react'
import { Page } from '../components'

interface HomeProps {}

export const Home: React.FC<HomeProps> = ({}) => {
    return (
        <Page>
            <div className='w-full h-full p-5'>
                <h1 className='text-3xl text-center font-extrabold'>Home</h1>
            </div>
        </Page>
    )
}
