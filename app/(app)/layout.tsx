import Header from '@/components/layout/Header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f7ff' }}>
      <Header />
      <main>{children}</main>
    </div>
  )
}