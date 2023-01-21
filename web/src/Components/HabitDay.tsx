import clsx from 'clsx'
import * as Popover from '@radix-ui/react-popover'
import { ProgressBar } from './ProgressBar'
import { Checkbox } from './Checkbox'
import dayjs from 'dayjs'
import { useState } from 'react'
import { api } from '../lib/axios'

interface HabitDayProps {
  amount?: number
  completed?: number
  date: Date
}

interface Habit {
  id: string
  title: string
}

export const HabitDay = ({
  amount = 0,
  completed = 0,
  date,
}: HabitDayProps) => {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completedHabitsIds, setCompletedHabitsIds] = useState<string[]>([])
  const [allHabitsHaveBeenUnChecked, setAllHabitsHaveBeenUnchecked] =
    useState(false)

  const completedAmount =
    completedHabitsIds.length > 0 ? completedHabitsIds.length : completed
  const totalAmount = habits.length > 0 ? habits.length : amount

  const completedPercentage =
    amount > 0 && !allHabitsHaveBeenUnChecked
      ? Math.round((completedAmount / totalAmount) * 100)
      : 0

  const dayAndMonth = dayjs(date).format('DD/MM')
  const dayOfWeek = dayjs(date).format('dddd')

  const getHabitsInDay = async () => {
    const { data } = await api.get(`/day?date=${date.toISOString()}`)

    if (data.completedHabits) {
      setCompletedHabitsIds(data.completedHabits)
    }

    setHabits(data.possibleHabits)
  }

  const toggleHabit = async (id: string, checked: boolean) => {
    await api.patch(`/habits/${id}/toggle`)

    if (checked) {
      if (completedHabitsIds.length === 0) setAllHabitsHaveBeenUnchecked(false)

      setCompletedHabitsIds((state) => [...state, id])
    } else {
      if (completedHabitsIds.length === 1) setAllHabitsHaveBeenUnchecked(true)

      setCompletedHabitsIds((state) =>
        state.filter((completedHabitId) => completedHabitId !== id),
      )
    }
  }

  return (
    <Popover.Root>
      <Popover.Trigger
        onClick={getHabitsInDay}
        className={clsx('w-10 h-10  border-2 rounded-lg', {
          'bg-zinc-900 border-zinc-800': completedPercentage === 0,
          'bg-violet-900 border-violet-600':
            completedPercentage > 0 && completedPercentage < 20,
          'bg-violet-800 border-violet-600':
            completedPercentage >= 20 && completedPercentage < 40,
          'bg-violet-700 border-violet-500':
            completedPercentage >= 40 && completedPercentage < 60,
          'bg-violet-600 border-violet-500':
            completedPercentage >= 60 && completedPercentage < 80,
          'bg-violet-500 border-violet-400': completedPercentage >= 80,
        })}
      />

      <Popover.Portal>
        <Popover.Content className="min-w-[320px] p-6 rounded-2xl bg-zinc-900 flex flex-col">
          <span className="font-semibold text-zinc-400">{dayOfWeek}</span>
          <span className="mt-1 font-extrabold leading-tight text-3xl">
            {dayAndMonth}
          </span>

          <ProgressBar progress={completedPercentage} />

          <div className="mt-6 flex flex-col gap-3">
            {habits.map((habit) => (
              <Checkbox
                key={habit.id}
                text={habit.title}
                onCheckedChange={(checked) =>
                  toggleHabit(habit.id, checked === true)
                }
                checked={completedHabitsIds.includes(habit.id)}
                disabled={!dayjs(date).isSame(dayjs(), 'day')}
                lineTrough
              />
            ))}
          </div>

          <Popover.Arrow className="fill-zinc-900" height={8} width={8} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
