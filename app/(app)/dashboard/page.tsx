'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, FileText, TrendingUp } from 'lucide-react'
import MonthCard from '@/components/dashboard/MonthCard'
import { createClient } from '@/lib/supabase/client'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April',
  'Mei', 'Juni', 'Juli', 'Agustus',
  'September', 'Oktober', 'November', 'Desember',
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

export default function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [fullName, setFullName] = useState('')
  const [stats, setStats] = useState({ filled: 0, total: 0, thisMonth: 0 })
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load nama
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      if (profile) setFullName(profile.full_name)

      // Load stats timesheet tahun ini
      const { data: timesheets } = await supabase
        .from('timesheets')
        .select('date, activity')
        .eq('user_id', user.id)
        .gte('date', `${currentYear}-01-01`)
        .lte('date', `${currentYear}-12-31`)

      if (timesheets) {
        const filled = timesheets.filter(t => t.activity).length
        const thisMonth = timesheets.filter(t => {
          const m = new Date(t.date).getMonth() + 1
          return m === currentMonth && t.activity
        }).length
        setStats({ filled, total: timesheets.length, thisMonth })
      }
    }
    loadData()
  }, [])

  //const firstName = fullName.split(' ')[0]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Greeting section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1a8fd1] mb-1">{getGreeting()},</p>
            <h1 className="text-2xl font-bold text-[#0d3d5e]">
              {fullName || 'User'} 👋
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Pilih bulan untuk mengisi atau melihat timesheet
            </p>
          </div>

          {/* Kontrol ganti tahun */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <button
              onClick={() => setYear(y => y - 1)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={16} className="text-gray-500" />
            </button>
            <span className="text-base font-semibold text-[#0d3d5e] w-12 text-center">{year}</span>
            <button
              onClick={() => setYear(y => y + 1)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#e8f4fc' }}>
              <FileText size={16} style={{ color: '#1a8fd1' }} />
            </div>
            <div>
              <div className="text-lg font-bold text-[#0d3d5e]">{stats.filled}</div>
              <div className="text-xs text-gray-400">Hari terisi tahun ini</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#e8faf0' }}>
              <TrendingUp size={16} style={{ color: '#2ec866' }} />
            </div>
            <div>
              <div className="text-lg font-bold text-[#0d3d5e]">{stats.thisMonth}</div>
              <div className="text-xs text-gray-400">Hari terisi bulan ini</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#fff8e8' }}>
              <Clock size={16} style={{ color: '#f0a500' }} />
            </div>
            <div>
              <div className="text-lg font-bold text-[#0d3d5e]">
                {MONTHS[currentMonth - 1]}
              </div>
              <div className="text-xs text-gray-400">Bulan berjalan</div>
            </div>
          </div>
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