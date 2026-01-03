import React from 'react'
import { classNames } from '..'
import { emptyGuesses } from '../../api'

interface BattleshipBoardProps {
    boat: (cellRow: number, cellCol: number) => React.ReactNode
}

export const BattleshipBoard: React.FC<BattleshipBoardProps> = ({ boat }) => {
    return (
        <div id='board' className='w-full aspect-square grid grid-cols-10 border-2 border-gray-400'>
            {Object.entries(emptyGuesses).map(([columnIndex, column]) => (
                <div key={`col-${columnIndex}`} className='h-full w-full flex flex-col'>
                    {column.map((_, cellIndex) => (
                        <div
                            key={`col-${columnIndex},row-${cellIndex}`}
                            className={classNames('relative w-full aspect-square outline outline-1 outline-gray-400')}
                        >
                            {boat(cellIndex, parseInt(columnIndex))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
