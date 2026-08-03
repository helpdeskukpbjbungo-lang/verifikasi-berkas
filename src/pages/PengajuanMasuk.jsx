import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function PengajuanMasuk() {
  const [pengajuanList, setPengajuanList] = React.useState([])
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [selectedItem, setSelectedItem] = React.useState(null)
  const [detailData, setDetailData] = React.useState(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [loadingDetail, setLoadingDetail] = React.useState(false)
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
    baru: pengajuanList.filter(i => i.status === 'submitted').length,
    verified: pengajuanList.filter(i => i.status === 'verified').length,
    rejected: pengajuanList.filter(i => i.status === 'rejected').length,
  }

  const filtered = statusFilter === 'all'
    ? pengajuanList
    : pengajuanList.filter(item => item.status === statusFilter)

  const openDetail = async (item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
    setLoadingDetail(true)
    try {
      const response = await fetch(`/api/pengajuan/${item.id}`)
      if (response.ok) {
        const data = await response.json()
        setDetailData(data)
      } else {
        setDetailData(null)
      }
    } catch (err) {
      setDetailData(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
    setDetailData(null)
    setShowRejectForm(false)
    setRejectReason('')
    setShowRevisionForm(false)
    setRevisionNote('')
  }

  const [loadingAction, setLoadingAction] = React.useState(false)
  const [showRejectForm, setShowRejectForm] = React.useState(false)
  const [rejectReason, setRejectReason] = React.useState('')
  const [showRevisionForm, setShowRevisionForm] = React.useState(false)
  const [revisionNote, setRevisionNote] = React.useState('')

  const updateStatus = async (status, alasanDitolak = null, alasanRevisi = null) => {
    if (!selectedItem) return
    setLoadingAction(true)
    try {
      const response = await fetch(`/api/pengajuan/${selectedItem.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, alasan_ditolak: alasanDitolak, alasan_revisi: alasanRevisi }),
      })
      if (response.ok) {
        closeModal()
        loadData()
        setShowRejectForm(false)
        setRejectReason('')
        setShowRevisionForm(false)
        setRevisionNote('')
      } else {
        const result = await response.json()
        alert(`Gagal: ${result.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Failed to update status:', err)
      alert(`Gagal memperbarui status: ${err.message}`)
    } finally {
      setLoadingAction(false)
    }
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

  const getInitials = (nama) => {
    if (!nama) return '??'
    return nama
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isRevisionRequested = (item) => item.status === 'submitted' && !!item.alasan_revisi

  const getStatusBadge = (item) => {
    if (isRevisionRequested(item)) {
      return 'bg-orange-50 text-orange-700 border border-orange-200'
    }
    switch (item.status) {
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

  const getStatusLabel = (item) => {
    if (isRevisionRequested(item)) {
      return 'Minta Revisi'
    }
    switch (item.status) {
      case 'submitted':
        return 'Menunggu Verifikasi'
      case 'verified':
        return 'Terverifikasi'
      case 'rejected':
        return 'Ditolak'
      case 'draft':
        return 'Draft'
      default:
        return item.status
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-xs">Pengajuan Masuk</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Pantau dan kelola antrean pengajuan berkas yang masuk secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-xs px-sm py-base bg-surface-container-high rounded-full border border-outline-variant">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
          </span>
          <span className="text-label-sm text-secondary font-semibold">Real-time Update</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
        {/* Total Card */}
        <div className="bg-surface-container-lowest p-md border border-outline-variant rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <span className="p-xs bg-surface-container rounded-lg text-primary">
              <span className="material-symbols-outlined">all_inbox</span>
            </span>
            <span className="text-label-sm text-on-surface-variant">+12% vs Kemarin</span>
          </div>
          <p className="text-label-md font-label-md text-on-surface-variant">Total Pengajuan</p>
          <h3 className="text-headline-md font-headline-md text-primary">{stats.total.toLocaleString('id-ID')}</h3>
        </div>

        {/* Perlu Verifikasi (Highlighted) */}
        <div className="bg-primary-container p-md border border-primary rounded-lg shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-lg opacity-10">
            <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
          </div>
          <div className="flex justify-between items-start mb-sm">
            <span className="p-xs bg-white/10 rounded-lg text-white">
              <span className="material-symbols-outlined">pending_actions</span>
            </span>
            <span className="text-label-sm text-primary-fixed">High Priority</span>
          </div>
          <p className="text-label-md font-label-md text-primary-fixed">Pengajuan Baru</p>
          <h3 className="text-headline-md font-headline-md text-white">{stats.baru}</h3>
        </div>

        {/* Sedang Diproses */}
        <div className="bg-surface-container-lowest p-md border border-outline-variant rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-sm">
            <span className="p-xs bg-secondary-container/20 rounded-lg text-secondary">
              <span className="material-symbols-outlined">sync</span>
            </span>
          </div>
          <p className="text-label-md font-label-md text-on-surface-variant">Sudah Diverifikasi</p>
          <h3 className="text-headline-md font-headline-md text-primary">{stats.verified}</h3>
        </div>

        {/* Selesai Hari Ini */}
        <div className="bg-surface-container-lowest p-md border border-outline-variant rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-sm">
            <span className="p-xs bg-green-100 rounded-lg text-green-700">
              <span className="material-symbols-outlined">check_circle</span>
            </span>
          </div>
          <p className="text-label-md font-label-md text-on-surface-variant">Selesai Hari Ini</p>
          <h3 className="text-headline-md font-headline-md text-primary">{stats.rejected}</h3>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        {/* Table Header & Filters */}
        <div className="p-md md:p-lg border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-md bg-surface-container-lowest">
          <div>
            <h3 className="text-headline-sm font-headline-sm text-primary">Antrean Verifikasi</h3>
            <p className="text-body-sm text-on-surface-variant">Daftar permohonan sertifikat digital yang menunggu validasi data.</p>
          </div>
          <div className="flex flex-wrap items-center gap-xs">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-outline-variant rounded-md pl-sm pr-lg py-xs text-label-sm text-on-surface-variant focus:ring-primary focus:border-primary cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="submitted">Menunggu Verifikasi</option>
                <option value="verified">Terverifikasi</option>
                <option value="rejected">Ditolak</option>
              </select>
              <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-sm">expand_more</span>
            </div>
            <button className="flex items-center gap-xs px-sm py-xs bg-surface border border-outline-variant rounded-md font-label-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter Lanjutan
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-label-md text-primary font-bold uppercase tracking-wider sticky top-0">
              <tr>
                <th className="px-sm py-sm border-b border-outline-variant">Nama Pemohon</th>
                <th className="px-sm py-sm border-b border-outline-variant">Instansi/Satuan Kerja</th>
                <th className="px-sm py-sm border-b border-outline-variant">Jabatan</th>
                <th className="px-sm py-sm border-b border-outline-variant">Tanggal Pengajuan</th>
                <th className="px-sm py-sm border-b border-outline-variant text-center">Status</th>
                <th className="px-sm py-sm border-b border-outline-variant text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-body-sm text-on-surface divide-y divide-outline-variant">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-sm py-sm text-center text-on-surface-variant">
                    Tidak ada data untuk filter ini.
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-sm py-sm">
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
                    <td className="px-sm py-sm">{item.satker || '-'}</td>
                    <td className="px-sm py-sm">{item.jabatan || '-'}</td>
                    <td className="px-sm py-sm">{formatDateTime(item.created_at)}</td>
                    <td className="px-sm py-sm text-center">
                      <span
                        className={`inline-flex items-center gap-xs px-sm py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(item)}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isRevisionRequested(item)
                              ? 'bg-orange-500'
                              : item.status === 'verified'
                                ? 'bg-green-500'
                                : item.status === 'rejected'
                                  ? 'bg-error'
                                  : 'bg-secondary'
                          }`}
                        ></span>
                        {getStatusLabel(item)}
                      </span>
                    </td>
                    <td className="px-sm py-sm text-center">
                      <button
                        onClick={() => openDetail(item)}
                        className={
                          item.status === 'verified' || item.status === 'rejected' || isRevisionRequested(item)
                            ? 'inline-flex items-center gap-xs px-md py-1.5 rounded font-label-sm hover:bg-surface-container-low transition-all'
                            : 'inline-block bg-primary text-on-primary px-md py-1.5 rounded font-label-sm hover:bg-primary-container shadow-sm active:scale-95 transition-all'
                        }
                      >
                        {item.status === 'verified' || item.status === 'rejected' || isRevisionRequested(item) ? (
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        ) : (
                          'Periksa'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-md bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
          <p className="text-label-sm text-on-surface-variant">Menampilkan {filtered.length} dari {pengajuanList.length} permohonan</p>
          <div className="flex items-center gap-base">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary text-label-sm font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant text-label-sm hover:bg-surface-container transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant text-label-sm hover:bg-surface-container transition-colors">3</button>
            <span className="px-xs text-on-surface-variant">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Information Footer */}
      <div className="mt-lg p-md bg-surface-container-low rounded-lg border border-outline-variant flex items-center gap-md">
        <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
        <p className="text-body-sm text-on-surface-variant">
          Sistem akan otomatis melakukan pencatatan pada pengajuan yang masuk untuk memudahkan proses distribusi tugas antar verifikator.
        </p>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeModal}>
          <div className="w-[50vw] max-h-[90vh] flex flex-col bg-surface-container-lowest rounded-lg shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-md border-b border-outline-variant">
                <div className="flex items-center gap-sm">
                  <h3 className="text-headline-sm font-headline-sm text-primary">Detail Pengajuan</h3>
                  <span className={`px-sm py-base text-xs font-semibold rounded-full ${getStatusBadge(selectedItem)}`}>
                    {getStatusLabel(selectedItem)}
                  </span>
                </div>
              <button onClick={closeModal} className="p-xs hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto flex" style={{ minHeight: '0' }}>
              {/* Left Pane: Personal Data */}
              <section className="w-full flex flex-col">
                <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30">
                  <h3 className="text-label-md font-bold text-primary flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm">badge</span>
                    DATA DIRI PEMOHON
                  </h3>
                  
                </div>
                <div className="flex-1 overflow-y-auto p-md space-y-md custom-scrollbar">
                  {loadingDetail ? (
                    <div className="flex items-center justify-center py-xl">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : detailData && detailData.formulir ? (
                    <div className="grid grid-cols-1 gap-sm">
                      <div className="space-y-xs">
                        <label className="text-label-sm text-on-surface-variant">Nomor Induk Pegawai (NIP)</label>
                        <div className="px-xs py-xs bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-semibold text-primary">
                          {detailData.formulir.nip || '-'}
                        </div>
                      </div>
                      <div className="space-y-xs">
                        <label className="text-label-sm text-on-surface-variant">Nama Lengkap</label>
                        <div className="px-xs py-xs bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-medium text-primary">
                          {detailData.formulir.nama_lengkap || '-'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-sm">
                        <div className="space-y-xs">
                          <label className="text-label-sm text-on-surface-variant">Jabatan</label>
                          <div className="px-xs py-xs bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-medium text-primary">
                            {detailData.formulir.jabatan || '-'}
                          </div>
                        </div>
                        <div className="space-y-xs">
                          <label className="text-label-sm text-on-surface-variant">Satuan Kerja</label>
                          <div className="px-xs py-xs bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-medium text-primary">
                            {detailData.formulir.satker || '-'}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-xs">
                        <label className="text-label-sm text-on-surface-variant">Tanggal Pengajuan</label>
                        <div className="px-xs py-xs bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-medium text-primary">
                          {formatDateTime(detailData.formulir.created_at)}
                        </div>
                      </div>
                      <div className="space-y-sm mt-md">
                        <label className="text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Pratinjau Dokumen</label>
                        <div className="space-y-xs">
                          {detailData.dokumen && detailData.dokumen.length > 0 ? (
                            detailData.dokumen.map((doc, idx) => {
                              const docInfo = {
                                surat_permohonan: { label: 'Surat Permohonan Verifikasi', icon: 'description' },
                                pakta_integritas: { label: 'Pakta Integritas', icon: 'verified' },
                                sk_terbaru: { label: 'SK Jabatan Terakhir', icon: 'assignment_ind' },
                              }[doc.jenis_dokumen] || { label: doc.jenis_dokumen.replace(/_/g, ' '), icon: 'description' }
                              return (
                                <div key={idx} className="flex items-center justify-between p-sm bg-surface-container-lowest border border-outline-variant rounded hover:bg-surface-container-low transition-colors cursor-pointer">
                                  <div className="flex items-center gap-sm">
                                    <span className="material-symbols-outlined text-primary text-sm">{docInfo.icon}</span>
                                    <span className="text-body-sm font-medium text-primary">{docInfo.label}</span>
                                  </div>
                                  <a href={doc.filepath} target="_blank" rel="noopener noreferrer">
                                    <span className="material-symbols-outlined text-sm text-on-surface-variant">visibility</span>
                                  </a>
                                </div>
                              )
                            })
                          ) : (
                            <p className="text-body-sm text-on-surface-variant">Tidak ada dokumen terlampir.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-xl">
                      <p className="text-body-sm text-on-surface-variant">Gagal memuat data pengajuan.</p>
                    </div>
                  )}
                  <div className="mt-xl p-sm bg-surface-container-low rounded-lg border border-primary/10">
                    <h4 className="text-xs font-bold text-primary mb-xs uppercase">Catatan Keamanan</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Seluruh data telah melalui tahap validasi awal sistem. Harap periksa kesesuaian antara dokumen fisik yang diunggah dengan data input di atas.
                    </p>
                  </div>

                  {selectedItem?.status === 'verified' ? (
                    <div className="flex items-center justify-center py-md">
                      <span className="text-label-md font-bold text-green-700 flex items-center gap-xs">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Pengajuan sudah disetujui — {formatDateTime(selectedItem.updated_at || selectedItem.created_at)}
                      </span>
                    </div>
                  ) : selectedItem?.status === 'rejected' ? (
                    <div className="flex flex-col items-center gap-sm">
                      <span className="text-label-md font-bold text-red-700 flex items-center gap-xs">
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        Pengajuan sudah ditolak — {formatDateTime(selectedItem.updated_at || selectedItem.created_at)}
                      </span>
                      {selectedItem.alasan_ditolak && (
                        <p className="text-body-sm text-on-surface-variant text-center max-w-2xl">
                          <span className="font-semibold">Alasan:</span> {selectedItem.alasan_ditolak}
                        </p>
                      )}
                    </div>
                  ) : isRevisionRequested(selectedItem) ? (
                    <div className="flex flex-col items-center gap-sm">
                      <span className="text-label-md font-bold text-orange-700 flex items-center gap-xs">
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Permintaan Revisi — {formatDateTime(selectedItem.updated_at || selectedItem.created_at)}
                      </span>
                      {selectedItem.alasan_revisi && (
                        <p className="text-body-sm text-on-surface-variant text-center max-w-2xl">
                          <span className="font-semibold">Catatan Revisi:</span> {selectedItem.alasan_revisi}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-sm">
                      <div className="flex gap-sm w-full">
                        <button
                          type="button"
                          onClick={() => setShowRejectForm((prev) => !prev)}
                          disabled={loadingAction}
                          className="flex-1 md:flex-none px-md py-xs border border-error text-error font-bold rounded-md hover:bg-error-container/10 transition-colors uppercase text-xs tracking-wide disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm align-middle mr-xs">close</span>
                          Tolak
                        </button>
                         <button
                           type="button"
                           onClick={() => setShowRevisionForm((prev) => !prev)}
                           disabled={loadingAction}
                           className="flex-1 md:flex-none px-md py-xs border border-secondary text-secondary font-bold rounded-md hover:bg-surface-container-low transition-colors uppercase text-xs tracking-wide disabled:opacity-50"
                         >
                           <span className="material-symbols-outlined text-sm align-middle mr-xs">edit</span>
                           Minta Revisi
                         </button>
                        <button onClick={() => updateStatus('verified')} disabled={loadingAction} className="flex-1 md:flex-none px-md py-xs bg-primary text-white font-bold rounded-md hover:opacity-90 transition-all flex items-center justify-center gap-xs uppercase text-xs tracking-wide disabled:opacity-50 disabled:cursor-not-allowed">
                          <span className="material-symbols-outlined text-sm">verified</span>
                          Setujui
                        </button>
                      </div>
                      {showRejectForm && (
                        <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
                          <label className="block text-label-sm text-on-surface-variant font-semibold mb-xs">
                            Alasan Penolakan
                          </label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                            className="w-full px-md py-sm bg-white border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                            placeholder="Masukkan alasan penolakan..."
                          />
                          <div className="flex items-center justify-end gap-sm mt-sm">
                            <button
                              type="button"
                              onClick={() => { setShowRejectForm(false); setRejectReason('') }}
                              disabled={loadingAction}
                              className="px-md py-xs rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors disabled:opacity-50"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus('rejected', rejectReason)}
                              disabled={loadingAction || !rejectReason.trim()}
                              className="px-md py-xs rounded-lg bg-error text-on-error font-label-md text-label-md hover:opacity-90 transition-colors disabled:opacity-50"
                            >
                              {loadingAction ? 'Menyimpan...' : 'Kirim Penolakan'}
                            </button>
                          </div>
                        </div>
                      )}
                      {showRevisionForm && (
                        <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
                          <label className="block text-label-sm text-on-surface-variant font-semibold mb-xs">
                            Catatan Revisi
                          </label>
                          <textarea
                            value={revisionNote}
                            onChange={(e) => setRevisionNote(e.target.value)}
                            rows={3}
                            className="w-full px-md py-sm bg-white border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                            placeholder="Masukkan catatan revisi untuk pemohon..."
                          />
                          <div className="flex items-center justify-end gap-sm mt-sm">
                            <button
                              type="button"
                              onClick={() => { setShowRevisionForm(false); setRevisionNote('') }}
                              disabled={loadingAction}
                              className="px-md py-xs rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors disabled:opacity-50"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus('submitted', null, revisionNote)}
                              disabled={loadingAction || !revisionNote.trim()}
                              className="px-md py-xs rounded-lg bg-secondary text-white font-label-md text-label-md hover:opacity-90 transition-colors disabled:opacity-50"
                            >
                              {loadingAction ? 'Menyimpan...' : 'Kirim Revisi'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
