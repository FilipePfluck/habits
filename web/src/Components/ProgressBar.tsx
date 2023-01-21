import * as Progress from '@radix-ui/react-progress'

interface ProgressBarProps {
  progress: number
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <Progress.Root
      className="h-3 rounded-xl bg-zinc-700 w-full mt-4"
      value={75}
    >
      <Progress.Indicator
        className={`h-3 rounded-xl bg-violet-600`}
        style={{ width: `${progress}%` }}
      />
    </Progress.Root>
  )
}
