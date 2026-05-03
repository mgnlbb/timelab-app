type StatsProps = {
  rows: { date: string; remarks: string; activity: string }[]
}

function isWeekend(dateStr: string) {
  const day = new Date(dateStr).getDay()
  return day === 0 || day === 6
}

export default function TimesheetStats({ rows }: StatsProps) {
  const workdays = rows.filter(r => !isWeekend(r.date))

  const totalWorkingDays = workdays.filter(r => r.activity === 'Weekday').length
  const totalAbsence     = workdays.filter(r => !r.activity).length
  const totalHolidays    = workdays.filter(r => r.activity === 'Holiday').length
  const totalLeave       = workdays.filter(r => r.activity === 'Leave').length
  const totalSick        = workdays.filter(r => r.activity === 'Sick').length

  const stats = [
    { label: 'Working Days', value: totalWorkingDays, color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Absence',      value: totalAbsence,     color: 'text-red-500',    bg: 'bg-red-50' },
    { label: 'Holidays',     value: totalHolidays,    color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Leave',        value: totalLeave,       color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Sick',         value: totalSick,        color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {stats.map(stat => (
        <div key={stat.label} className={`${stat.bg} border border-gray-200 rounded-xl p-4`}>
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className="text-xs text-gray-500 mt-1">Total {stat.label}</div>
        </div>
      ))}
    </div>
  )
}