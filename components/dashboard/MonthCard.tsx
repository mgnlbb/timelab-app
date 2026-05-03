'use client'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'

type MonthCardProps = {
  monthName: string
  monthNum: number
  year: number
  isCurrentMonth: boolean
  isFuture: boolean
}

const QUARTER_COLORS = [
  'border-blue-200 bg-blue-50 hover:border-blue-400',
  'border-emerald-200 bg-emerald-50 hover:border-emerald-400',
  'border-amber-200 bg-amber-50 hover:border-amber-400',
  'border-purple-200 bg-purple-50 hover:border-purple-400',
]

const QUARTER_BADGE = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700',
]

export default function MonthCard({
  monthName,
  monthNum,
  year,
  isCurrentMonth,
  isFuture,
}: MonthCardProps) {
  const router = useRouter()
  const quarter = Math.floor((monthNum - 1) / 3)

  return (
    <button
      onClick={() => router.push(`/timesheet/${year}/${monthNum}`)}
      className={`
        relative border-2 rounded-2xl p-5 text-left transition-all duration-150 group w-full
        ${QUARTER_COLORS[quarter]}
        ${isCurrentMonth ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
        ${isFuture ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:-translate-y-0.5'}
      `}
    >
      {/* Badge kuartal */}
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${QUARTER_BADGE[quarter]}`}>
        Q{quarter + 1}
      </span>

      {/* Nama bulan & tahun */}
      <div className="mt-2 text-base font-semibold text-gray-800">{monthName}</div>
      <div className="text-xs text-gray-400">{year}</div>

      {/* Badge bulan ini */}
      {isCurrentMonth && (
        <span className="absolute top-3 right-3 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">
          Bulan Ini
        </span>
      )}

      {/* Icon pojok kanan bawah */}
      <FileText
        size={16}
        className="absolute bottom-4 right-4 text-gray-300 group-hover:text-gray-400 transition-colors"
      />
    </button>
  )
}