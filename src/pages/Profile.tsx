import React from 'react'
import { ALinkButton, CancelIcon, Card, CheckIcon, Page, PencilIcon } from '../components'
import { UserContext } from '../context'
import { updateUserName } from '../api'

interface ProfileProps {}

export const Profile: React.FC<ProfileProps> = ({}) => {
    const { user } = React.useContext(UserContext)

    const [name, setName] = React.useState<string>('?')
    const [editName, setEditName] = React.useState<boolean>(false)

    React.useEffect(() => {
        if (user === null) {
            setName('?')
        } else {
            setName(user.name)
        }
    }, [user])

    const updateName = () => {
        if (user === null || name === user.name || name.length < 3) {
            return
        }
        updateUserName(user.uid, name)
        setEditName(false)
    }

    return (
        <Page centered>
            <div className='w-full max-w-4xl h-full p-5 flex-col gap-5 flex'>
                <h1 className='text-3xl font-extrabold'>Profile</h1>
                <Card className='flex flex-col gap-3'>
                    <h3 className='text-lg'>Your Details</h3>
                    <div className='flex gap-3 items-center'>
                        <label className='sm:min-w-[72px]'>Name:</label>
                        <input
                            type='text'
                            value={name}
                            onChange={e => setName(e.target.value)}
                            readOnly={user === null || !editName}
                            aria-invalid={editName && (user === null || name === user.name || name.length < 3)}
                            className='min-w-[48px] px-2 border-0 py-1 rounded flex-1 aria-[invalid=true]:border aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500'
                        />
                        {editName ? (
                            <>
                                <button
                                    onClick={() => updateName()}
                                    disabled={user === null || name === user.name || name.length < 3}
                                    className='rounded-full border border-transparent text-gray-600 hover:border-gray-600 p-1.5 -mr-2 disabled:border-transparent disabled:text-gray-500'
                                >
                                    <CheckIcon />
                                </button>
                                <button
                                    onClick={() => {
                                        if (user === null) {
                                            return
                                        }
                                        setEditName(false)
                                        setName(user.name)
                                    }}
                                    className='rounded-full border border-transparent text-gray-600 hover:border-gray-600 p-1.5'
                                >
                                    <CancelIcon />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditName(true)}
                                disabled={user === null}
                                className='rounded-full border border-transparent text-gray-600 hover:border-gray-600 p-1.5 disabled:border-transparent disabled:text-gray-500'
                            >
                                <PencilIcon />
                            </button>
                        )}
                    </div>
                </Card>
                <ALinkButton href='/profile/stats' className='bg-sky-500 text-white text-center'>
                    Your Stats
                </ALinkButton>
                {user !== null && (
                    <span className='absolute bottom-5 text-xs text-gray-500'>Unique ID: {user.uid}</span>
                )}
            </div>
        </Page>
    )
}
