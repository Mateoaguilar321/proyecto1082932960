interface TimeInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function TimeInput({
  value,
  onChange,
  placeholder = 'mm:ss.ms',
}: TimeInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-2 border border-gray-300 rounded-lg font-mono text-center"
    />
  )
}
