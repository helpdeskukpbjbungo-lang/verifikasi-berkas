import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function DashboardVerifikator() {
  const [pengajuanList, setPengajuanList] = React.useState([])
  const [statusFilter, setStatusFilter] = React.useState('all')
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login/verifikator')
      return
    }
    loadData()
  }, [user, loading, navigate])

  const loadData = async () => {
    const response = await fetch('/api/pengajuan')
    if (response.ok) {
      const data = await response.json()
      setPengajuanList(data || [])
    }
  }

  const stats = {
    total: pengajuanList.length,
    pending: pengajuanList.filter(i => i.status === 'submitted').length,
    verified: pengajuanList.filter(i => i.status === 'verified').length,
    rejected: pengajuanList.filter(i => i.status === 'rejected').length,
  }

  const filtered = statusFilter === 'all'
    ? pengajuanList
    : pengajuanList.filter(item => item.status === statusFilter)

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const getInitials = (nama) => {
    if (!nama) return '??'
    return nama
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-secondary-container/10 text-on-secondary-container border border-secondary-container/30'
      case 'verified':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'rejected':
        return 'bg-error-container/10 text-on-error-container border border-error-container/30'
      default:
        return 'bg-surface-container-low text-on-surface-variant border border-outline-variant'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'submitted':
        return 'Menunggu Verifikasi'
      case 'verified':
        return 'Terverifikasi'
      case 'rejected':
        return 'Ditolak'
      case 'draft':
        return 'Draft'
      default:
        return status
    }
  }

  const recentActivities = pengajuanList
    .filter(i => i.status !== 'submitted' && i.status !== 'draft')
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5)

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-xs">Ringkasan Verifikator</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Selamat datang kembali, Ahmad. Pantau dan kelola antrean verifikasi Anda di sini.
          </p>
        </div>
        <div className="flex items-center gap-sm text-label-sm text-on-surface-variant bg-surface-container-low px-sm py-xs rounded border border-outline-variant">
          <span className="material-symbols-outlined text-sm">calendar_today</span>
          <span>{formatDate(new Date().toISOString())}</span>
        </div>
      </div>

      {/* Stats Grid (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
        {/* Stat 1 */}
        <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[64px]">pending_actions</span>
          </div>
          <p className="text-label-md font-bold text-on-surface-variant mb-xs">Total Antrean</p>
          <div className="flex items-baseline gap-sm">
            <span className="text-headline-lg font-black text-primary">{String(stats.total).padStart(2, '0')}</span>
            <span className="text-label-sm text-secondary">+3 berkas baru hari ini</span>
          </div>
          <div className="mt-md h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-500"
              style={{ width: `${stats.total ? ((stats.pending / stats.total) * 100) : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[64px] text-error">assignment_return</span>
          </div>
          <p className="text-label-md font-bold text-on-surface-variant mb-xs">Perlu Revisi</p>
          <div className="flex items-baseline gap-sm">
            <span className="text-headline-lg font-black text-error">{String(stats.rejected).padStart(2, '0')}</span>
            <span className="text-label-sm text-on-surface-variant">Membutuhkan perhatian segera</span>
          </div>
          <div className="mt-md h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-error transition-all duration-500"
              style={{ width: `${stats.total ? ((stats.rejected / stats.total) * 100) : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[64px] text-green-600">task_alt</span>
          </div>
          <p className="text-label-md font-bold text-on-surface-variant mb-xs">Selesai Hari Ini</p>
          <div className="flex items-baseline gap-sm">
            <span className="text-headline-lg font-black text-green-700">{String(stats.verified).padStart(2, '0')}</span>
            <span className="text-label-sm text-green-600">85% dari target harian</span>
          </div>
          <div className="mt-md h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${stats.total ? ((stats.verified / stats.total) * 100) : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-xl">
        {/* Performa Verifikasi */}
        <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="text-headline-sm font-headline-sm text-primary mb-md">Performa Verifikasi</h3>
          <div className="space-y-md">
            <div>
              <div className="flex justify-between text-label-md mb-xs">
                <span className="text-on-surface-variant">Terverifikasi</span>
                <span className="font-bold text-primary">{stats.verified} dari {stats.total}</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${stats.total ? ((stats.verified / stats.total) * 100) : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-label-md mb-xs">
                <span className="text-on-surface-variant">Menunggu</span>
                <span className="font-bold text-primary">{stats.pending} dari {stats.total}</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${stats.total ? ((stats.pending / stats.total) * 100) : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-label-md mb-xs">
                <span className="text-on-surface-variant">Ditolak</span>
                <span className="font-bold text-primary">{stats.rejected} dari {stats.total}</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-error transition-all duration-500" style={{ width: `${stats.total ? ((stats.rejected / stats.total) * 100) : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Laporan Verifikasi Bulanan */}
        <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="text-headline-sm font-headline-sm text-primary mb-md">Laporan Verifikasi Bulanan</h3>
          <div className="flex items-end justify-between gap-sm h-48">
            {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((month, idx) => {
              const monthData = pengajuanList.filter(item => {
                if (!item.created_at) return false
                const date = new Date(item.created_at)
                return date.getMonth() === idx
              })
              const verified = monthData.filter(i => i.status === 'verified').length
              const rejected = monthData.filter(i => i.status === 'rejected').length
              const total = monthData.length
              const maxVal = Math.max(total, 1)
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-xs">
                  <div className="w-full flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-on-surface-variant">{total}</span>
                    <div className="w-full rounded-t-md relative" style={{ height: `${Math.max(8, (total / maxVal) * 100)}%`, minHeight: '8px' }}>
                      <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md" style={{ height: `${total ? (verified / total) * 100 : 0}%` }}></div>
                      <div className="absolute bottom-0 left-0 right-0 bg-error rounded-b-md" style={{ height: `${total ? (rejected / total) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium">{month}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-center gap-md mt-md">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-primary"></span>
              <span className="text-[10px] text-on-surface-variant">Terverifikasi</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-error"></span>
              <span className="text-[10px] text-on-surface-variant">Ditolak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="mt-xl mb-xl">
        <div className="bg-white border border-outline-variant p-lg rounded-xl shadow-sm">
          <h4 className="text-headline-sm font-bold text-primary mb-md">Aktivitas Terbaru</h4>
          <div className="space-y-md">
            {recentActivities.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">Belum ada aktivitas verifikasi.</p>
            ) : (
              recentActivities.map(item => (
                <div key={item.id} className="flex gap-sm items-start">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                      item.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {item.status === 'verified' ? 'check_circle' : 'cancel'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-body-sm font-bold">
                      {item.status === 'verified' ? 'Verifikasi Berhasil' : 'Pengajuan Ditolak'}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Permohonan {item.nama_lengkap} ({item.id.slice(0, 8).toUpperCase()})
                    </p>
                    <p className="text-[10px] text-outline mt-1">{formatDateTime(item.updated_at)}</p>
                  </div>
                  <button className="px-md py-xs bg-primary text-on-primary text-label-sm rounded-lg hover:bg-primary-container transition-all flex-shrink-0">
                    Lihat
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant flex justify-around items-center py-xs z-50">
        <a className="flex flex-col items-center gap-1 text-primary" href="#">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold">Beranda</span>
        </a>
        <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
          <span className="material-symbols-outlined">description</span>
          <span className="text-[10px]">Berkas</span>
        </a>
        <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
          <span className="material-symbols-outlined">history</span>
          <span className="text-[10px]">Riwayat</span>
        </a>
        <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px]">Profil</span>
        </a>
      </nav>
    </div>
  )
}