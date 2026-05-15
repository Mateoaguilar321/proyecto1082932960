interface MetricsBadgeProps {
  label: string
  value: string | number
  suffix?: string
  variant?: 'default' | 'positive' | 'negative'
}

export default function MetricsBadge({
  label,
  value,
  suffix = '',
  variant = 'default',
}: MetricsBadgeProps) {
  const bgColor = {
    default: 'bg-gray-100',
    positive: 'bg-green-100',
    negative: 'bg-red-100',
  }[variant]

  const textColor = {
    default: 'text-gray-700',
    positive: 'text-green-700',
    negative: 'text-red-700',
  }[variant]

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${bgColor} ${textColor} text-sm font-medium`}>
      <span className="text-xs opacity-75">{label}</span>
      <span className="font-semibold">
        {value}
        {suffix}
      </span>
    </div>
  )
}
