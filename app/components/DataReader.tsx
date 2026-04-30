import DataViewer from './DataViewer'
import { VALUE_KEYS, excelDateToJSDate, fetchSheetData } from './utils/index'
import { formatDateAsYyyyMmDd } from './utils/dateHelpers'

type SheetCellValue = string | number | boolean | null

export default async function DataReader() {
    const data = await fetchSheetData()
    const dataMap = new Map<string, SheetCellValue>()
    const headerRow = data.values?.[0] ?? []
    const valueRow = data.values?.[1] ?? []

    for (let i = 0; i < headerRow.length; i++) {
        const key = String(headerRow[i] ?? '').toLowerCase()
        dataMap.set(key, valueRow[i] ?? null)
    }

    const totalValue = Number(dataMap.get(VALUE_KEYS.MONTH_START) ?? 0)
    const startDay = excelDateToJSDate(Number(dataMap.get(VALUE_KEYS.START_DATE) ?? 0))
    const initialTodayDate = formatDateAsYyyyMmDd(new Date())

    return (
        <section>
            <DataViewer
                totalValue={totalValue}
                startDay={startDay}
                environment={process.env.ENVIRONMENT ?? ''}
                initialTodayDate={initialTodayDate}
            />
        </section>
    )
}