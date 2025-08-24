// Layout amministrativo - sidebar, header e protezione con AdminGuard
'use client'

import { AdminGuard } from '@/lib/auth/adminGuard'
import { AdminSidebar } from './components/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard requiredPermission="admin_dashboard">
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  )
} 