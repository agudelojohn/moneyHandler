type SheetValue = string | number | boolean | null

type SheetsApiResponse = {
  values?: SheetValue[][]
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? ''
const API_KEY = process.env.API_KEY_GOOGLE ?? ''
const RANGE = 'Data!A1:B5'

const params = new URLSearchParams({
  key: API_KEY,
  valueRenderOption: 'UNFORMATTED_VALUE',
})

export async function fetchSheetData(): Promise<SheetsApiResponse> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?${params.toString()}`
  const res = await fetch(url, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Error al consultar la API')
  }

  return res.json()
}

export const excelDateToJSDate = (serial: number) => {
  const utcDays = Math.floor(serial - 25569)
  const utcValue = utcDays * 86400
  const dateInfo = new Date(utcValue * 1000)

  const fractionalDay = serial - Math.floor(serial) + 0.0000001

  let totalSeconds = Math.floor(86400 * fractionalDay)
  const seconds = totalSeconds % 60
  totalSeconds -= seconds

  const hours = Math.floor(totalSeconds / (60 * 60))
  const minutes = Math.floor(totalSeconds / 60) % 60

  return new Date(
    dateInfo.getFullYear(),
    dateInfo.getMonth(),
    dateInfo.getDate(),
    hours,
    minutes,
    seconds,
  )
}
