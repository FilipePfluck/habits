import { Check } from 'phosphor-react'
import { FormEvent, useState } from 'react'
import { api } from '../lib/axios'
import { Checkbox } from './Checkbox'

const weekDaysList = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

interface NewHabitsFormProps {
  afterSubmit: () => void
}

export const NewHabitsForm = ({ afterSubmit }: NewHabitsFormProps) => {
  const [title, setTitle] = useState('')
  const [weekDays, setWeekDays] = useState<number[]>([])

  console.log(weekDays)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!title || weekDays.length === 0) return

    await api.post('habits', {
      title,
      weekDays,
    })
    setTitle('')
    setWeekDays([])
    afterSubmit()
  }

  const toggleWeekDay = (weekDay: number) => {
    if (weekDays.includes(weekDay)) {
      const newWeekDays = weekDays.filter((day) => day !== weekDay)

      return setWeekDays(newWeekDays)
    }

    setWeekDays((state) => [...state, weekDay])
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col mt-6">
      <label htmlFor="title" className="font-semibold leading-tight">
        Qual seu comprometimento?
      </label>
      <input
        type="text"
        id="title"
        onChange={(e) => setTitle(e.target.value)}
        value={title}
        className="p-3 rounded-lg mt-3 bg-zinc-800 text-white placeholder:text-zinc-400"
        placeholder="ex: Exercícios, dormir bem, etc..."
        autoFocus
      />

      <label className="font-semibold leading-tight mt-4">
        Qual a recorrência?
      </label>

      <div className="flex flex-col gap-2 mt-3">
        {weekDaysList.map((weekDay, index) => (
          <Checkbox
            key={index}
            checked={weekDays.includes(index)}
            onCheckedChange={() => {
              toggleWeekDay(index)
            }}
            text={weekDay}
          />
        ))}
      </div>

      <button
        type="submit"
        className="mt-6 rounded-lg p-3 gap-3 flex items-center font-semibold bg-green-600 justify-center hover:bg-green-500"
      >
        <Check size={20} weight="bold" />
        Confirmar
      </button>
    </form>
  )
}
