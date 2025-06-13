import { DashboardProvider } from '@/lib/dashboard-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <div className="h-screen bg-gray-50">
        {children}
      </div>
    </DashboardProvider>
  )
} 