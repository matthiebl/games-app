import React from 'react'
import steveImg from '../assets/steve.jpg'
import { classNames, Page } from '../components'

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

type Coordinate = {
    x: number
    y: number
}

const SIZE = 33
const MID = (SIZE + 1) / 2
const MIN_RENDER = 2
const MAX_RENDER = 32
const COORD_RANGE = [
    -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    14, 15, 16,
]

const CONTROLS = [
    { name: 'Move', key: 'WASD' },
    { name: 'Open/Close Pie Chart', key: 'Shift + 3' },
    { name: 'Increase Render', key: 'F' },
    { name: 'Decrease Render', key: 'Shift + F' },
]

const renderDistTo = (player: Coordinate, pos: Coordinate) =>
    Math.max(Math.abs(player.x - pos.x), Math.abs(player.y - pos.y))

interface PieRayPlayProps {}

export const PieRayPlay: React.FC<PieRayPlayProps> = ({}) => {
    const [player, setPlayer] = React.useState({ x: 0, y: 0 })
    const [fortress, setFortress] = React.useState({ x: 0, y: 0 })
    const [render, setRender] = React.useState(MIN_RENDER)
    const [pie, setPie] = React.useState(false)
    const [pieFortress, setPieFortress] = React.useState(false)

    React.useEffect(() => {
        document.title = 'Games | Pie Ray'
        let x, y, dist
        do {
            x = MID - Math.floor(SIZE * Math.random())
            y = MID - Math.floor(SIZE * Math.random())
            dist = renderDistTo({ x: 0, y: 0 }, { x, y })
        } while (dist < 8 || dist > 12)
        setFortress({ x, y })

        document.addEventListener('keypress', onKeyPress)
        return () => document.removeEventListener('keypress', onKeyPress)
    }, [])

    const distToFortress = React.useMemo(() => renderDistTo(player, fortress), [player, fortress])

    // Handle pie chart updates
    React.useEffect(() => {
        if (pie) {
            if (distToFortress <= render) {
                setPieFortress(true)
            }
        } else if (distToFortress - render >= 4) {
            setPieFortress(false)
        }
    }, [pie, distToFortress, render])

    // Handle keyboard controls
    const onKeyPress = React.useCallback((event: KeyboardEvent) => {
        const key = event.key.toLowerCase()
        setPlayer(prev => {
            if (key === 'w' && prev.y < MID - 1) return { ...prev, y: prev.y + 1 }
            if (key === 'a' && prev.x > -(MID - 1)) return { ...prev, x: prev.x - 1 }
            if (key === 's' && prev.y > -(MID - 1)) return { ...prev, y: prev.y - 1 }
            if (key === 'd' && prev.x < MID - 1) return { ...prev, x: prev.x + 1 }
            return { ...prev }
        })
        setRender(prev => {
            if (key === 'f' && !event.shiftKey && prev < MAX_RENDER) return prev + 1
            if (key === 'f' && event.shiftKey && prev > MIN_RENDER) return prev - 1
            return prev
        })
        if (key === '#' && event.shiftKey) setPie(prev => !prev)
    }, [])

    return (
        <Page centered>
            <div className='w-full max-w-7xl p-5 gap-5 flex flex-col items-center minecraft-text'>
                <h1 className='text-3xl font-extrabold text-center'>Fortress Pie Ray</h1>
                <div className='flex gap-5 items-center'>
                    <Board player={player} fortress={fortress} render={render} />
                    <div className='h-full flex flex-col justify-between'>
                        <div>
                            <h3 className='text-xl font-bold'>Controls</h3>
                            <table className='text-gray-700'>
                                <tbody>
                                    {CONTROLS.map(ctrl => (
                                        <tr key={ctrl.name}>
                                            <td className='pr-3'>{ctrl.name}</td>
                                            <td>{ctrl.key}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className='flex flex-col items-center text-gray-700'>
                            <p className='mb-5'>Render distance: {render}</p>
                            <PieChart visible={pie} fortress={pieFortress} />
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    )
}

interface PieChartProps {
    visible: boolean
    fortress: boolean
}

const PieChart: React.FC<PieChartProps> = ({ visible, fortress }) => {
    const data = {
        datasets: [
            {
                data: visible ? [70, 30, fortress ? 4 : 0] : [],
                backgroundColor: ['#6DDA61', '#F193F1', '#91FFF2'],
                borderWidth: 0,
            },
        ],
    }

    return (
        <div className='w-[200px]'>
            <Pie data={data} options={{ plugins: { tooltip: { enabled: false } } }} />
        </div>
    )
}

interface BoardProps {
    player: Coordinate
    fortress: Coordinate
    render: number
}

const Board: React.FC<BoardProps> = ({ player, fortress, render }) => {
    return (
        <div className='max-w-3xl border border-gray-200 w-full aspect-square grid grid-cols-[repeat(33,_minmax(0,_1fr))]'>
            {COORD_RANGE.map(x => (
                <div key={`x-${x}`} className='h-full w-full flex flex-col-reverse'>
                    {COORD_RANGE.map(y => (
                        <BoardCell
                            key={`x-${x},y-${y}`}
                            x={x}
                            y={y}
                            player={player}
                            fortress={fortress}
                            render={render}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

interface BoardCellProps {
    x: number
    y: number
    player: Coordinate
    fortress: Coordinate
    render: number
}

const BoardCell: React.FC<BoardCellProps> = ({ x, y, player, fortress, render }) => {
    const isPlayer = x == player.x && y == player.y
    const isFortress = x == fortress.x && y == fortress.y
    const isInRender = renderDistTo(player, { x: x, y: y }) <= render
    return (
        <div
            className={classNames(
                'border h-full w-full aspect-square border-gray-200',
                isInRender && 'bg-green-100',
                isFortress && 'bg-red-500',
            )}
        >
            {isPlayer ? <img src={steveImg} /> : null}
        </div>
    )
}
