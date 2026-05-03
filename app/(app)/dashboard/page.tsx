'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MonthCard from '@/components/dashboard/MonthCard'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April',
  'Mei', 'Juni', 'Juli', 'Agustus',
  'September', 'Oktober', 'November', 'Desember',
]

export default function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header dashboard */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pilih bulan untuk mengisi atau melihat timesheet</p>
        </div>

        {/* Kontrol ganti tahun */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <button
            onClick={() => setYear(y => y - 1)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <span className="text-base font-semibold text-gray-800 w-12 text-center">{year}</span>
          <button
            onClick={() => setYear(y => y + 1)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Grid 12 kartu */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {MONTHS.map((monthName, i) => {
          const monthNum = i + 1
          return (
            <MonthCard
              key={monthNum}
              monthName={monthName}
              monthNum={monthNum}
              year={year}
              isCurrentMonth={monthNum === currentMonth && year === currentYear}
              isFuture={year > currentYear || (year === currentYear && monthNum > currentMonth)}
            />
          )
        })}
      </div>
    </div>
  )
}