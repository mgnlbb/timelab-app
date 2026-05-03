import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { renderToBuffer } from '@react-pdf/renderer'
import { TimesheetPDF } from '@/components/pdf/TimesheetPDF'
import React from 'react'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')!
  const month = searchParams.get('month')!

  // Baca logo dari folder public, convert ke base64
  const logoPath = path.join(process.cwd(), 'public', 'IDstar_Logo.png')
  const logoBase64 = fs.existsSync(logoPath)
    ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
    : null

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const monthPadded = month.padStart(2, '0')
  const daysInMonth = new Date(+year, +month, 0).getDate()
  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, '0')
    return `${year}-${monthPadded}-${day}`
  })

  const [{ data: profile }, { data: timesheets }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('timesheets')
      .select('date, start_time, end_time, activity, remarks')
      .eq('user_id', user.id)
      .in('date', dates)
      .order('date'),
  ])

  const fullName = (profile?.full_name || 'timesheet')
  const filename = `1024963_${fullName}_TS${year}${monthPadded}.pdf`

const element = React.createElement(TimesheetPDF, {
    profile,
    timesheets: timesheets || [],
    year,
    month,
    logoBase64,
  }) as unknown as React.ReactElement<import('@react-pdf/renderer').DocumentProps>

  const buffer = await renderToBuffer(element)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}