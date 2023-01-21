import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { api } from '../lib/axios'
import { getAllDaysSinceBeginningOfYear } from '../utils/generate-all-dates-on-year'
import { HabitDay } from './HabitDay'

const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const summaryDates = getAllDaysSinceBeginningOfYear()

const minimumSummaryDatesSize = 18 * 7 // 18 weeks
const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length

const fillerArray =
  amountOfDaysToFill > 0 ? Array.from({ length: amountOfDaysToFill }) : []

type Summary = {
  id: string
  date: string
  amount: number
  completed: number
}[]

export const SummaryTable = () => {
  const [summary, setSummary] = useState<Summary>([])

  useEffect(() => {
    api.get('/summary').then((response) => {
      setSummary(response.data)
    })
  }, [])

  return (
    <div className="w-full flex">
      <div className="grid grid-rows-7 grid-flow-row gap-3">
        {weekdays.map((day, index) => (
          <div
            key={index}
            className="text-zinc-400 text-xl h-10 w-10 flex font-bold items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-rows-7 grid-flow-col gap-3">
        {summaryDates.map((date) => {
          const dayInSummary = summary.find((day) => {
            return dayjs(date).isSame(day.date, 'day')
          })

          return (
            <HabitDay
              key={date.toString()}
              date={date}
              amount={dayInSummary?.amount}
              completed={dayInSummary?.completed}
            />
          )
        })}

        {fillerArray.length > 0 &&
          fillerArray.map((date, index) => (
            <div
              className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-50 cursor-not-allowed"
              key={index}
            />
          ))}
      </div>
    </div>
  )
}
