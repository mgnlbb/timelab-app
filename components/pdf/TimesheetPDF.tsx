import {
  Document, Page, Text, View, StyleSheet, Image
} from '@react-pdf/renderer'
import { format, getDaysInMonth } from 'date-fns'

type Profile = {
  full_name: string
  department: string
  project: string
  role: string
  location: string
  acknowledger_name: string
  approval_name: string
  signature_url: string | null
} | null

type TimesheetEntry = {
  date: string
  start_time: string | null
  end_time: string | null
  activity: string | null
  remarks: string | null
}

type Props = {
  profile: Profile
  timesheets: TimesheetEntry[]
  year: string
  month: string
  logoBase64: string | null
}

const B = '0.5px solid #333'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 18,
    color: '#111',
  },

  // Wrapper terluar — border atas & kiri
  outerBox: {
    borderTop: B,
    borderLeft: B,
    marginBottom: 0,
  },

  row: { flexDirection: 'row' },

  // Setiap cell hanya border kanan & bawah
  cell: {
    borderRight: B,
    borderBottom: B,
    padding: 3,
    justifyContent: 'center',
  },

  headerLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  headerValue: { fontSize: 9 },

  // Kolom header tabel (Day, Date, dst)
  th: {
    borderRight: B,
    borderBottom: B,
    padding: 2,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
  },

  // Cell data biasa
  td: {
    borderRight: B,
    borderBottom: B,
    padding: 2,
    fontSize: 8,
    textAlign: 'center',
  },

  tdGray:   { backgroundColor: '#b3b3b3',  fontStyle: 'italic',},
  tdCenter: { textAlign: 'center' },
  tdLeft:   { textAlign: 'left' },
  tdBold:   { fontFamily: 'Helvetica-Bold' },
  tdRight:  { textAlign: 'right' },

  // Lebar kolom tabel timesheet
  colDay:       { width: '9%' },
  colDate:      { width: '10%' },
  colTimeStart: { width: '7%' },
  colTimeLunch: { width: '7%' },
  colTimeEnd:   { width: '7%' },
  colTotal:     { width: '7%' },
  colRemarks:   { width: '53%' },

  // Scoring section
  scoreLabel: { width: '19%' },
  scoreMid:   { width: '41%' },
  scoreDis:   { width: '18%' },
  scoreSumL:  { width: '15%' },
  scoreSumV:  { width: '7%' },

  // Signature
  sigApprove: {
   borderRight: B,
   padding: 2,
   fontSize: 9,
  },

  sigBox: {
    borderRight: B,
    padding: 4,
    width: '33.33%',
    height: 80,
    justifyContent: 'flex-end',
  },
  sigDate: {
    borderRight: B,
    borderBottom: B,
    padding: 3,
    width: '33.33%',
    fontSize: 9,
  },
  sigName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textDecoration: 'underline',
  },
  sigImage: {
    width: 70,
    height: 35,
    marginBottom: 4,
  },
})

function isWeekend(dateStr: string) {
  const day = new Date(dateStr).getDay()
  return day === 0 || day === 6
}

function formatTime(t: string | null) {
  if (!t) return '-'
  return t.slice(0, 5)
}

function formatDateLabel(dateStr: string) {
  return format(new Date(dateStr), 'dd MMM yyyy')
}

function getDayName(dateStr: string) {
  return format(new Date(dateStr), 'EEEE')
}

function calculateHours(start: string | null, end: string | null): string {
  if (!start || !end) return '-'
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const totalMinutes = (eh * 60 + em) - (sh * 60 + sm) - 60
  if (totalMinutes <= 0) return '-'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const GRAY_ACTIVITIES = ['Holiday', 'Sick', 'Leave']

export function TimesheetPDF({ profile, timesheets, year, month, logoBase64 }: Props) {
  const daysInMonth = getDaysInMonth(new Date(+year, +month - 1))
  const monthPadded = month.padStart(2, '0')

  const allRows = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, '0')
    const date = `${year}-${monthPadded}-${day}`
    const saved = timesheets.find(t => t.date === date)
    return {
      date,
      start_time: saved?.start_time ?? null,
      end_time:   saved?.end_time ?? null,
      activity:   saved?.activity ?? null,
      remarks:    saved?.remarks ?? null,
    }
  })

  const workdays         = allRows.filter(r => !isWeekend(r.date))
  const totalWorkingDays = workdays.filter(r => r.activity === 'Weekday').length
  const totalHolidays    = workdays.filter(r => r.activity === 'Holiday').length
  const totalLeaves      = workdays.filter(r => r.activity === 'Leave').length
  const totalSick        = workdays.filter(r => r.activity === 'Sick').length
  const totalAbsences    = workdays.filter(r => !r.activity).length

  const lastDate = formatDateLabel(allRows[allRows.length - 1].date)
  const period   = `${formatDateLabel(allRows[0].date)} - ${lastDate}`

  const scoreRows: [string, string, string, string, number][] = [
    ['(4) Very Satisfactory',   '(4) Very Satisfactory',   '(4) Very Satisfactory',   'Total Working Days:', totalWorkingDays],
    ['(3) Satisfactory',        '(3) Satisfactory',        '(3) Satisfactory',        'Total Holidays:',    totalHolidays],
    ['(2) Not Satisfactory',    '(2) Not Satisfactory',    '(2) Not Satisfactory',    'Total Leaves:',      totalLeaves],
    ['(1) Very Unsatisfactory', '(1) Very Unsatisfactory', '(1) Very Unsatisfactory', 'Total Sick:',        totalSick],
    ['Score:',                  'Score:',                  'Score:',                  'Total Absences:',    totalAbsences],
  ]

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={s.page}>

        {/* ── INFO HEADER ── */}
        {/* Wrapper: border atas & kiri, semua cell hanya border kanan & bawah */}
        <View style={s.outerBox}>
          <View style={s.row}>

            {/* Kolom kiri: 3 baris info */}
            <View style={{ flex: 1 }}>

              {/* Baris 1: Name + Role */}
              <View style={s.row}>
                <View style={[s.cell, { width: '23.7%' }]}>
                  <Text style={s.headerLabel}>Name</Text>
                </View>
                <View style={[s.cell, { flex: 1 }]}>
                  <Text style={s.headerValue}>{profile?.full_name || '-'}</Text>
                </View>
                <View style={[s.cell, { width: '18%' }]}>
                  <Text style={s.headerLabel}>Role</Text>
                </View>
                <View style={[s.cell, { flex: 1 }]}>
                  <Text style={s.headerValue}>{profile?.role || '-'}</Text>
                </View>
              </View>

              {/* Baris 2: Department + Location */}
              <View style={s.row}>
                <View style={[s.cell, { width: '23.7%' }]}>
                  <Text style={s.headerLabel}>Department</Text>
                </View>
                <View style={[s.cell, { flex: 1 }]}>
                  <Text style={s.headerValue}>{profile?.department || '-'}</Text>
                </View>
                <View style={[s.cell, { width: '18%' }]}>
                  <Text style={s.headerLabel}>Location</Text>
                </View>
                <View style={[s.cell, { flex: 1 }]}>
                  <Text style={s.headerValue}>{profile?.location || '-'}</Text>
                </View>
              </View>

              {/* Baris 3: Project + Period */}
              <View style={s.row}>
                <View style={[s.cell, { width: '23.7%' }]}>
                  <Text style={s.headerLabel}>Project</Text>
                </View>
                <View style={[s.cell, { flex: 1 }]}>
                  <Text style={s.headerValue}>{profile?.project || '-'}</Text>
                </View>
                <View style={[s.cell, { width: '18%' }]}>
                  <Text style={s.headerLabel}>Period</Text>
                </View>
                <View style={[s.cell, { flex: 1 }]}>
                  <Text style={s.headerValue}>{period}</Text>
                </View>
              </View>

            </View>

            {/* Kolom kanan: Logo span 3 baris */}
            <View style={[s.cell, { width: '20%', alignItems: 'center', justifyContent: 'center', padding: 3 }]}>
              {logoBase64
                ? <Image src={logoBase64} style={{ width: 75, objectFit: 'contain' }} />
                : <Text style={[s.headerLabel, { fontSize: 11 }]}>TimeLab</Text>
              }
            </View>

          </View>
        </View>

        {/* ── TABEL HEADER ── */}
        <View style={[s.row, { borderLeft: B }]}>
          <Text style={[s.th, s.colDay]}>Day</Text>
          <Text style={[s.th, s.colDate]}>Date</Text>
          <Text style={[s.th, s.colTimeStart]}>Start</Text>
          <Text style={[s.th, s.colTimeLunch]}>Lunch</Text>
          <Text style={[s.th, s.colTimeEnd]}>End</Text>
          <Text style={[s.th, s.colTotal]}>Total</Text>
          <Text style={[s.th, s.colRemarks]}>Activity / Remarks</Text>
        </View>

        {/* ── DATA ROWS ── */}
        {allRows.map((row) => {
          const weekend = isWeekend(row.date)
          const gray    = GRAY_ACTIVITIES.includes(row.activity ?? '') || weekend
          const displayRemarks = weekend ? 'Hari Libur' : (row.remarks || '-')

          return (
            <View key={row.date} style={[s.row, { borderLeft: B }]}>
              <Text style={[s.td, s.colDay,       gray ? s.tdGray : {}]}>{getDayName(row.date)}</Text>
              <Text style={[s.td, s.colDate,       gray ? s.tdGray : {}]}>{formatDateLabel(row.date)}</Text>
              <Text style={[s.td, s.colTimeStart,  gray ? s.tdGray : {}]}>{weekend ? '-' : formatTime(row.start_time)}</Text>
              <Text style={[s.td, s.colTimeLunch,  gray ? s.tdGray : {}]}>{weekend ? '-' : '12:00'}</Text>
              <Text style={[s.td, s.colTimeEnd,    gray ? s.tdGray : {}]}>{weekend ? '-' : formatTime(row.end_time)}</Text>
              <Text style={[s.td, s.colTotal,      gray ? s.tdGray : {}]}>{weekend ? '-' : calculateHours(row.start_time, row.end_time)}</Text>
              <Text style={[s.td, s.colRemarks,    gray ? s.tdGray : {}, s.tdCenter]}>{displayRemarks}</Text>
            </View>
          )
        })}

        {/* ── SCORING HEADER ── */}
        <View style={[s.row, { borderLeft: B }]}>
          <Text style={[s.td, s.scoreLabel, s.tdBold]}>Objective of Work:</Text>
          <Text style={[s.td, s.scoreMid,   s.tdBold]}>Supporting Competencies:</Text>
          <Text style={[s.td, s.scoreDis,   s.tdBold]}>Discipline:</Text>
          <Text style={[s.td, s.scoreSumL,  s.tdBold]}>Total Working Days:</Text>
          <Text style={[s.td, s.scoreSumV,  s.tdRight]}>{totalWorkingDays}</Text>
        </View>

        {/* ── SCORE ROWS ── */}
        {scoreRows.map((row, i) => (
          <View key={i} style={[s.row, { borderLeft: B }]}>
            <Text style={[s.td, s.scoreLabel]}>{row[0]}</Text>
            <Text style={[s.td, s.scoreMid]}>{row[1]}</Text>
            <Text style={[s.td, s.scoreDis]}>{row[2]}</Text>
            <Text style={[s.td, s.scoreSumL]}>{row[3]}</Text>
            <Text style={[s.td, s.scoreSumV, s.tdRight]}>{String(row[4])}</Text>
          </View>
        ))}

        {/* ── SIGNATURE HEADER ── */}
        <View style={[s.row, { borderLeft: B }]}>
          <Text style={[ s.sigApprove, s.tdLeft, s.tdBold, { width: '33.33%' }]}>Submitted by:</Text>
          <Text style={[ s.sigApprove, s.tdLeft, s.tdBold, { width: '33.33%' }]}>Acknowledged by Team Leader:</Text>
          <Text style={[ s.sigApprove, s.tdLeft, s.tdBold, { width: '33.33%' }]}>Approved by:</Text>
        </View>

        {/* ── SIGNATURE BOXES ── */}
        <View style={[s.row, { borderLeft: B }]}>
          <View style={s.sigBox}>
            {profile?.signature_url
              ? <Image src={profile.signature_url} style={s.sigImage} />
              : null
            }
            <Text style={s.sigName}>{profile?.full_name || ''}</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigName}>{profile?.acknowledger_name || '-'}</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigName}>{profile?.approval_name || '-'}</Text>
          </View>
        </View>

        {/* ── SIGNATURE DATES ── */}
        <View style={[s.row, { borderLeft: B }]}>
          <Text style={s.sigDate}>{lastDate}</Text>
          <Text style={s.sigDate}>{lastDate}</Text>
          <Text style={s.sigDate}>{lastDate}</Text>
        </View>

      </Page>
    </Document>
  )
}