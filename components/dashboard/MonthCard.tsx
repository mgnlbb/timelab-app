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

const QUARTER_STYLES = [
  { bg: '#dbeeff', text: '#0d3d5e', badge: '#1a8fd1', badgeText: '#fff' },
  { bg: '#d4f5e4', text: '#0d5e30', badge: '#2ec866', badgeText: '#fff' },
  { bg: '#cceeff', text: '#0a4a6e', badge: '#4db8f0', badgeText: '#fff' },
  { bg: '#d0e8f5', text: '#0d3d5e', badge: '#0d3d5e', badgeText: '#fff' },
]

export default function MonthCard({
  monthName, monthNum, year, isCurrentMonth, isFuture,
}: MonthCardProps) {
  const router = useRouter()
  const quarter = Math.floor((monthNum - 1) / 3)
  const style = QUARTER_STYLES[quarter]

  return (
    <button
      onClick={() => !isFuture && router.push(`/timesheet/${year}/${monthNum}`)}
      disabled={isFuture}
      className={`
        relative rounded-2xl p-5 text-left w-full
        transition-all duration-150 group
        ${isFuture
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
        }
        ${isCurrentMonth ? 'ring-2 ring-offset-2 ring-[#1a8fd1]' : ''}
      `}
      style={{ backgroundColor: style.bg }}
    >
      {/* Badge kuartal */}
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: style.badge, color: style.badgeText }}
      >
        Q{quarter + 1}
      </span>

      {/* Nama bulan */}
      <div className="mt-3 text-base font-bold" style={{ color: style.text }}>
        {monthName}
      </div>
      <div className="text-xs mt-0.5" style={{ color: style.text, opacity: 0.6 }}>
        {year}
      </div>

      {/* Badge bulan ini */}
      {isCurrentMonth && (
        <span className="absolute top-3 right-3 text-[10px] text-white px-2 py-0.5 rounded-full font-semibold"
          style={{ backgroundColor: '#1a8fd1' }}>
          Bulan Ini
        </span>
      )}

      {/* Icon pojok kanan bawah */}
      <FileText
        size={15}
        className="absolute bottom-4 right-4 transition-opacity"
        style={{ color: style.text, opacity: isFuture ? 0.2 : 0.25 }}
      />
    </button>
  )
}