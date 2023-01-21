import * as RCheckbox from '@radix-ui/react-checkbox'
import clsx from 'clsx'
import { Check } from 'phosphor-react'

interface CheckboxProps extends RCheckbox.CheckboxProps {
  lineTrough?: boolean
  text: string
}

export const Checkbox = ({
  lineTrough = false,
  text,
  ...props
}: CheckboxProps) => {
  return (
    <RCheckbox.Root
      className=" flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed group"
      {...props}
    >
      <div className="h-8 w-8 rounded-lg flex items-center justify-center border-2 bg-zinc-900 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 ">
        <RCheckbox.Indicator>
          <Check size={20} className="text-white" />
        </RCheckbox.Indicator>
      </div>

      <span
        className={clsx(' text-white leading-tight ', {
          'font-semibold text-xl group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400':
            lineTrough,
        })}
      >
        {text}
      </span>
    </RCheckbox.Root>
  )
}
