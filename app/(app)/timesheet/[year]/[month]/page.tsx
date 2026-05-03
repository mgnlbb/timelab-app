import { format } from 'date-fns'
import TimesheetTable from '@/components/timesheet/TimesheetTable'

export default async function TimesheetPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>
}) {
  const { year, month } = await params
  const monthName = format(new Date(+year, +month - 1), 'MMMM yyyy')

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Timesheet {monthName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Perubahan tersimpan otomatis</p>
        </div>
        
        <a  href={`/api/pdf?year=${year}&month=${month}`}
          target="_blank"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Export PDF
        </a>
      </div>

      <TimesheetTable year={year} month={month} />
    </div>
  )
}