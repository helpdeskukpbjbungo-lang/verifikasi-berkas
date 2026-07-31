import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LaporanVerifikator() {
  const [pengajuanList, setPengajuanList] = React.useState([])
  const [statusFilter, setStatusFilter] = React.useState('all')
  const { user } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!user) {
      navigate('/login/verifikator')
      return
    }
    loadData()
  }, [user, navigate])

  const loadData = async () => {
    const response = await fetch('/api/pengajuan')
    if (response.ok) {
      const data = await response.json()
      setPengajuanList(data || [])
    }
  }

  const filtered = statusFilter === 'all'
    ? pengajuanList
    : pengajuanList.filter(item => item.status === statusFilter)

  const stats = {
    total: pengajuanList.length,
    pending: pengajuanList.filter(i => i.status === 'submitted').length,
    verified: pengajuanList.filter(i => i.status === 'verified').length,
    rejected: pengajuanList.filter(i => i.status === 'rejected').length,
  }

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

  const getProcessingDays = (created, updated) => {
    if (!created || !updated) return '-'
    const c = new Date(created)
    const u = new Date(updated)
    const diff = Math.floor((u - c) / (1000 * 60 * 60 * 24))
    if (diff === 0) return '< 1 hari'
    return `${diff} hari`
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

  const getInitials = (nama) => {
    return nama
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const recentActivities = pengajuanList
    .filter(i => i.status !== 'submitted' && i.status !== 'draft')
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5)

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-xs">Ringkasan Laporan</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Pantau performa verifikasi dan ringkasan berkas pemohon yang telah diproses.
          </p>
        </div>
        <div className="flex items-center gap-sm text-label-sm text-on-surface-variant bg-surface-container-low px-sm py-xs rounded border border-outline-variant">
          <span className="material-symbols-outlined text-sm">calendar_today</span>
          <span>{formatDate(new Date().toISOString())}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-xl">
        <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <p className="text-label-md font-bold text-on-surface-variant mb-xs">Total Pengajuan</p>
          <div className="flex items-baseline gap-sm">
            <span className="text-headline-lg font-black text-primary">{String(stats.total).padStart(2, '0')}</span>
            <span className="text-label-sm text-on-surface-variant">Total berkas masuk</span>
          </div>
        </div>
        <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <p className="text-label-md font-bold text-on-surface-variant mb-xs">Menunggu Verifikasi</p>
          <div className="flex items-baseline gap-sm">
            <span className="text-headline-lg font-black text-secondary">{String(stats.pending).padStart(2, '0')}</span>
            <span className="text-label-sm text-on-surface-variant">Perlu ditindaklanjuti</span>
          </div>
          <div className="mt-md h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-500"
              style={{ width: `${stats.total ? ((stats.pending / stats.total) * 100) : 0}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <p className="text-label-md font-bold text-on-surface-variant mb-xs">Terverifikasi</p>
          <div className="flex items-baseline gap-sm">
            <span className="text-headline-lg font-black text-green-700">{String(stats.verified).padStart(2, '0')}</span>
            <span className="text-label-sm text-green-600">Berhasil diverifikasi</span>
          </div>
          <div className="mt-md h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${stats.total ? ((stats.verified / stats.total) * 100) : 0}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <p className="text-label-md font-bold text-on-surface-variant mb-xs">Ditolak</p>
          <div className="flex items-baseline gap-sm">
            <span className="text-headline-lg font-black text-error">{String(stats.rejected).padStart(2, '0')}</span>
            <span className="text-label-sm text-on-surface-variant">Membutuhkan perbaikan</span>
          </div>
          <div className="mt-md h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-error transition-all duration-500"
              style={{ width: `${stats.total ? ((stats.rejected / stats.total) * 100) : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-md md:p-lg border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-md bg-surface-container-lowest">
          <div>
            <h3 className="text-headline-sm font-headline-sm text-primary">Detail Laporan Verifikasi</h3>
            <p className="text-body-sm text-on-surface-variant">Data lengkap status verifikasi berkas pemohon.</p>
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-outline-variant rounded-lg pl-md pr-xl py-sm text-label-md text-on-surface-variant focus:ring-primary focus:border-primary cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="submitted">Menunggu Verifikasi</option>
              <option value="verified">Terverifikasi</option>
              <option value="rejected">Ditolak</option>
            </select>
            <button className="flex items-center gap-xs px-md py-sm bg-surface border border-outline-variant rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>
              Ekspor
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-label-md text-primary font-bold uppercase tracking-wider sticky top-0">
              <tr>
                <th className="px-md py-sm border-b border-outline-variant">Pemohon</th>
                <th className="px-md py-sm border-b border-outline-variant">Instansi</th>
                <th className="px-md py-sm border-b border-outline-variant">Jabatan</th>
                <th className="px-md py-sm border-b border-outline-variant">Tanggal Pengajuan</th>
                <th className="px-md py-sm border-b border-outline-variant">Tanggal Selesai</th>
                <th className="px-md py-sm border-b border-outline-variant text-center">Status</th>
                <th className="px-md py-sm border-b border-outline-variant text-right">Waktu Proses</th>
              </tr>
            </thead>
            <tbody className="text-body-sm text-on-surface divide-y divide-outline-variant">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-md py-md text-center text-on-surface-variant">
                    Tidak ada data laporan untuk filter ini.
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-md py-md">
                      <div className="flex items-center gap-sm">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            item.status === 'verified'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'rejected'
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-secondary-fixed text-secondary'
                          }`}
                        >
                          {getInitials(item.nama_lengkap)}
                        </div>
                        <div>
                          <p className="font-bold">{item.nama_lengkap}</p>
                          <p className="text-[10px] text-on-surface-variant">ID: {item.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-md py-md">{item.satker || '-'}</td>
                    <td className="px-md py-md">{item.jabatan || '-'}</td>
                    <td className="px-md py-md">{formatDateTime(item.created_at)}</td>
                    <td className="px-md py-md">
                      {item.status === 'submitted' || item.status === 'draft' ? '-' : formatDateTime(item.updated_at)}
                    </td>
                    <td className="px-md py-md text-center">
                      <span
                        className={`inline-flex items-center gap-xs px-sm py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(item.status)}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'verified'
                              ? 'bg-green-500'
                              : item.status === 'rejected'
                                ? 'bg-error'
                                : 'bg-secondary'
                          }`}
                        ></span>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-md py-md text-right text-label-sm text-on-surface-variant">
                      {item.status === 'verified' || item.status === 'rejected'
                        ? getProcessingDays(item.created_at, item.updated_at)
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-md bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
          <p className="text-label-sm text-on-surface-variant">Menampilkan {filtered.length} dari {pengajuanList.length} permohonan</p>
        </div>
      </div>

      <div className="mt-xl grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="bg-primary-container text-on-primary p-lg rounded-xl flex flex-col gap-lg items-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl"></div>
          <div className="flex-1 z-10">
            <h4 className="text-headline-sm font-bold mb-xs">Ringkasan Performa</h4>
            <p className="text-body-sm text-on-primary-container mb-md">
              Tingkat penyelesaian verifikasi mencapai {stats.total ? ((stats.verified / stats.total) * 100).toFixed(0) : 0}%. Pertahankan konsistensi kerja Anda.
            </p>
            <div className="flex gap-sm">
              <button
                onClick={() => setStatusFilter('all')}
                className="bg-white text-primary px-md py-sm rounded-lg font-label-md flex items-center gap-xs hover:bg-surface-container-lowest transition-all"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                Lihat Semua
              </button>
              <button
                onClick={() => setStatusFilter('verified')}
                className="bg-surface-container bg-opacity-20 text-on-primary px-md py-sm rounded-lg font-label-md flex items-center gap-xs hover:bg-opacity-30 transition-all"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Verifikasi Selesai
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white border border-outline-variant p-lg rounded-xl shadow-sm">
          <h4 className="text-headline-sm font-bold text-primary mb-md">Aktivitas Terbaru</h4>
          <div className="space-y-md">
            {recentActivities.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">Belum ada aktivitas verifikasi.</p>
            ) : (
              recentActivities.map(item => (
                <div key={item.id} className="flex gap-sm">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                      item.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {item.status === 'verified' ? 'check_circle' : 'cancel'}
                    </span>
                  </div>
                  <div>
                    <p className="text-body-sm font-bold">
                      {item.status === 'verified' ? 'Verifikasi Berhasil' : 'Pengajuan Ditolak'}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Permohonan {item.nama_lengkap} ({item.id.slice(0, 8).toUpperCase()})
                    </p>
                    <p className="text-[10px] text-outline mt-1">{formatDateTime(item.updated_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
