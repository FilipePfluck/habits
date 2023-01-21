import { FastifyInstance } from "fastify"
import dayjs from 'dayjs'
import { z } from 'zod'
import { prisma } from "./lib/prisma"

export const appRoutes = async (app: FastifyInstance) => {
  app.post('/habits', async(req) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6))
    })

    const { title, weekDays } = createHabitBody.parse(req.body) 

    const today = dayjs(new Date()).startOf('day').toDate()

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map(day => {
            return {
              week_day: day
            }
          })
        }
      }
    })
  })

  app.get('/day', async (req) => {
    const getDayParams = z.object({
      date: z.coerce.date()
    })

    const { date } = getDayParams.parse(req.query) 
    
    const formattedDate = dayjs(date).startOf('day')

    const weekDay = dayjs(date).get('day')

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date
        },
        weekDays: {
          some: {
            week_day: weekDay
          }
        }
      }
    })

    const day = await prisma.day.findUnique({
      where: {
        date: formattedDate.toDate()
      },
      include: {
        dayHabits: true
      }
    })

    const completedHabits = day?.dayHabits.map(habit => {
      return habit.habit_id
    })

    return {
      possibleHabits,
      completedHabits
    }
  })

  app.patch('/habits/:id/toggle', async (req) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid()
    })

    const { id } = toggleHabitParams.parse(req.params)

    const today = dayjs().startOf('day').toDate()
    const todayWeekDay = dayjs(today).get('day')

    let day = await prisma.day.findUnique({
      where: {
        date: today
      }
    })

    if(!day) {
      day = await prisma.day.create({
        data: {
          date: today
        }
      })
    }

    const habit = await prisma.habit.findUnique({
      where: {
        id
      },
      include: {
        weekDays: true
      }
    })

    if(!habit?.weekDays.some(weekDay => weekDay.week_day === todayWeekDay)) {
      throw new Error("You can't toggle a habit that is not available today.")
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id
        },
      }
    })

    if(dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id
        }
      })

      return
    }

    await prisma.dayHabit.create({
      data: {
        day_id: day.id,
        habit_id: id
      }
    })
  })

  app.get('/summary', async (req) => {
    const summary = await prisma.$queryRaw`
      SELECT D.id, D.date,
        (
          SELECT cast(count(*) as float)
          FROM day_habits DH
          WHERE DH.day_id = D.id
        ) as completed,
        (
          SELECT cast(count(*) as float)
          FROM habit_week_days HWD
          JOIN habits H
            ON H.id = HWD.habit_id
          WHERE
            HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
            AND H.created_at <= D.date
        ) as amount
      FROM days D
    `

    return summary
  })
}