'use client'
import { useMemo, useState } from 'react'
import { getInclusiveDaysDiff, getLastBusinessDayOfMonth } from '../common/utils/dateHelpers'
import { useI18n } from '../i18n/I18nProvider'

type DataViewerProps = {
    totalValue: number,
    startDay: Date,
    environment: string,
    initialTodayDate: string
}

export default function DataViewer({ totalValue, startDay, environment, initialTodayDate }: DataViewerProps) {
    const { t, dateLocale } = useI18n()

    const [today, setToday] = useState(new Date(`${initialTodayDate}T00:00:00`))

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
            <p>{t.dataViewer.today}: {new Intl.DateTimeFormat(dateLocale).format(today)}</p>
            <p>{t.dataViewer.lastBusinessDay}: {new Intl.DateTimeFormat(dateLocale).format(lastBusinessDay)}</p>
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