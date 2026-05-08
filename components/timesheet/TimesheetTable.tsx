'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getDaysInMonth, format } from 'date-fns'
import TimesheetRow, { type RowData } from './TimesheetRow'
import TimesheetStats from './TimesheetStats'

type TimesheetTableProps = {
  year: string
  month: string
}

const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {}

export default function TimesheetTable({ year, month }: TimesheetTableProps) {
  
  const [rows, setRows] = useState<RowData[]>([])
  const [savingDate, setSavingDate] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      setLoading(true)

      const daysInMonth = getDaysInMonth(new Date(+year, +month - 1))
      const monthPadded = month.padStart(2, '0')

      // Buat semua baris kosong
      const emptyRows: RowData[] = Array.from({ length: daysInMonth }, (_, i) => {
        const dayPadded = String(i + 1).padStart(2, '0')
        return {
          date: `${year}-${monthPadded}-${dayPadded}`,
          start_time: '',
          end_time: '',
          activity: '',
          remarks: '',
        }
      })

      const { data, error } = await supabase
        .from('timesheets')
        .select('date, start_time, end_time, activity, remarks')
        .in('date', emptyRows.map(r => r.date))
        .order('date')

      if (error) {
        console.error('Error loading timesheets:', error)
        setRows(emptyRows)
        setLoading(false)
        return
      }

      // Merge data dari database ke baris kosong
      const merged = emptyRows.map(empty => {
        const saved = data?.find(d => d.date === empty.date)
        if (!saved) return empty
        return {
          date: saved.date,
          start_time: saved.start_time ?? '',
          end_time: saved.end_time ?? '',
          activity: saved.activity ?? '',
          remarks: saved.remarks ?? '',
        }
      })

      setRows(merged)
      setLoading(false)
    }

    loadData()
  }, [year, month])

  const [saveError, setSaveError] = useState<string | null>(null)

  const saveRow = useCallback(async (row: RowData) => {
    setSavingDate(row.date)
    setStatus('saving')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('timesheets').upsert(
      {
        user_id: user.id,
        date: row.date,
        start_time: row.start_time || null,
        end_time: row.end_time || null,
        activity: row.activity || null,
        remarks: row.remarks || null,
      },
      { onConflict: 'user_id,date' }
    )

    if (error) console.error('Error saving:', error)
    setSaveError('Gagal menyimpan, coba lagi')
    setSavingDate(null)
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 2000)
  }, [supabase])

  function handleChange(date: string, field: keyof RowData, value: string) {
    setRows(prev => prev.map(row => {
      if (row.date !== date) return row
      const updated = { ...row, [field]: value }
      clearTimeout(debounceTimers[date])
      debounceTimers[date] = setTimeout(() => saveRow(updated), 800)
      return updated
    }))
  }

  // Fungsi khusus untuk update banyak field sekaligus (dipakai saat ganti activity)
  function handleRowUpdate(date: string, updates: Partial<RowData>) {
    setRows(prev => prev.map(row => {
      if (row.date !== date) return row
      const updated = { ...row, ...updates }
      clearTimeout(debounceTimers[date])
      debounceTimers[date] = setTimeout(() => saveRow(updated), 800)
      return updated
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Memuat data timesheet...
      </div>
    )
  }


  return (
    <div>
      <TimesheetStats rows={rows} />

      <div className="mb-2 h-5 text-right">
        {status === 'saving' && (
          <span className="text-xs text-gray-400 animate-pulse">Menyimpan...</span>
        )}
        {status === 'saved' && (
          <span className="text-xs text-emerald-500">✓ Tersimpan</span>
        )}
        {/* {saveError && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white text-xs px-4 py-2 rounded-lg shadow-lg">
            {saveError}
          </div>
        )} */}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Day', 'Date', 'Activity', 'Start Time', 'End Time',  'Remarks'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <TimesheetRow
                  key={row.date}
                  row={row}
                  onChange={handleChange}
                  onRowUpdate={handleRowUpdate}
                  isSaving={savingDate === row.date}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}