'use client'
import { useMemo, useState } from 'react'
import { getInclusiveDaysDiff, getLastBusinessDayOfMonth } from './utils/dateHelpers'
import { useI18n } from '../i18n/I18nProvider'

type DataViewerProps = {
    totalValue: number,
    startDay: Date,
    environment: string,
    initialTodayISO: string
}

export default function DataViewer({ totalValue, startDay, environment, initialTodayISO }: DataViewerProps) {
    const { t, dateLocale } = useI18n()

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
        <><h1>{t.dataViewer.title}</h1>
            <p>{t.dataViewer.totalValue}: {totalValue}</p>
            <p>{t.dataViewer.today}: {new Intl.DateTimeFormat(dateLocale, { timeZone: 'UTC' }).format(today)}</p>
            <p>{t.dataViewer.lastBusinessDay}: {new Intl.DateTimeFormat(dateLocale, { timeZone: 'UTC' }).format(lastBusinessDay)}</p>
            <p>{t.dataViewer.diffDays}: {diffDays}</p>

            {environment === 'development' && (
                <>
                    <button onClick={addOneDay}>{t.dataViewer.plusOneDay}</button>
                    <button onClick={subtractOneDay}>{t.dataViewer.minusOneDay}</button>
                </>
            )}
        </>
    )
}