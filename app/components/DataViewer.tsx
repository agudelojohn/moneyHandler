'use client'
import { useMemo, useState } from 'react'
import { getInclusiveDaysDiff, getLastBusinessDayOfMonth } from './utils/dateHelpers'

type DataViewerProps = {
    totalValue: number,
    startDay: Date,
    environment: string,
    initialTodayISO: string
}

export default function DataViewer({ totalValue, startDay, environment, initialTodayISO }: DataViewerProps) {

    const [today, setToday] = useState(new Date(initialTodayISO))

    const lastBusinessDay = useMemo(() => getLastBusinessDayOfMonth(today), [today])
    const diffDays = useMemo(() => getInclusiveDaysDiff(startDay, lastBusinessDay), [startDay, lastBusinessDay])

    const addOneDay = () => {
        setToday((prevToday) => new Date(prevToday.getFullYear(), prevToday.getMonth(), prevToday.getDate() + 1))
    }

    const subtractOneDay = () => {
        setToday((prevToday) => new Date(prevToday.getFullYear(), prevToday.getMonth(), prevToday.getDate() - 1))
    }

    return (
        <><h1>Data Viewer</h1>
            <p>Total Value: {totalValue}</p>
            <p>Today: {new Intl.DateTimeFormat('es-ES', { timeZone: 'UTC' }).format(today)}</p>
            <p>Last Business Day: {new Intl.DateTimeFormat('es-ES', { timeZone: 'UTC' }).format(lastBusinessDay)}</p>
            <p>Diff Days: {diffDays}</p>

            {environment === 'development' && (
                <>
                    <button onClick={addOneDay}>+1 Day</button>
                    <button onClick={subtractOneDay}>-1 Day</button>
                </>
            )}
        </>
    )
}