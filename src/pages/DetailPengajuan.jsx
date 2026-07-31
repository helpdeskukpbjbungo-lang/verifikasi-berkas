import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function DetailPengajuan() {
  const { id } = useParams()
  const [formulir, setFormulir] = React.useState(null)
  const [dokumen, setDokumen] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!user) {
      navigate('/login/verifikator')
      return
    }
    loadData()
  }, [user, navigate, id])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pengajuan/${id}`)
      if (response.ok) {
        const data = await response.json()
        setFormulir(data.formulir || data)
        setDokumen(data.dokumen || [])
      } else {
        setFormulir(null)
        setDokumen([])
      }
    } catch (err) {
      setFormulir(null)
      setDokumen([])
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-secondary-container/10 text-on-secondary-container border border-secondary/20'
      case 'verified':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'rejected':
        return 'bg-error-container/10 text-on-error-container border border-error/20'
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

  return (
    <div className="bg-background text-on-background overflow-hidden">
      {/* TopNavBar Shell */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-md py-xs bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <span className="text-headline-sm font-headline-sm font-bold text-primary">LPSE Portal</span>
          <div className="hidden md:flex gap-sm ml-xl">
            <span className="font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-low transition-colors px-xs py-base cursor-pointer">Dashboard</span>
            <span className="font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-low transition-colors px-xs py-base cursor-pointer">Pengajuan</span>
            <span className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1 cursor-pointer">Verifikasi</span>
            <span className="font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-low transition-colors px-xs py-base cursor-pointer">Laporan</span>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="bg-surface-container-low border-none rounded-full pl-xl pr-md py-xs text-body-sm w-64 focus:ring-2 focus:ring-primary" placeholder="Cari dokumen..." type="text" />
          </div>
          <span className="material-symbols-outlined text-primary cursor-pointer active:opacity-80">notifications</span>
          <span className="material-symbols-outlined text-primary cursor-pointer active:opacity-80">help_outline</span>
          <div className="flex items-center gap-xs ml-sm border-l pl-md border-outline-variant">
            <img className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKgCs6c_Q_cVWIHlS_poay8p1j5_EUoAWmPCJqABAIsEVlXxi9rxCDghVuu7fBqlhPfD43lXHlSsOAxDcdNFgdWjbkjVoh5MNkonC4Zmzjd92dXfl5AnTFmiKpUndqTLfBlDN5yYQxevnbSvuAChOo7aLhXXnxJ5T5ux_DbbFJo6DpRlhIS_3Q6no2I0MIfzZHRyXNZ33ibLD1mveR8KxOoWc8mIi8M241NNDZSChTowFZ7LkHrbcS2gg0N-TDGk4nLa7PY1ENtxko" alt="avatar" />
            <button className="font-body-md text-body-md text-primary font-semibold">SSO Logout</button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* SideNavBar Shell */}
        <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col pt-24 pb-md z-40 bg-surface-container-low border-r border-outline-variant">
          <div className="px-md mb-xl">
            <div className="flex items-center gap-sm mb-xs">
              <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg text-white">
                <span className="material-symbols-outlined">shield</span>
              </div>
              <div>
                <h2 className="text-label-md font-black text-primary uppercase">LPSE Verifier</h2>
                <p className="text-xs text-on-surface-variant opacity-70">Official Portal</p>
              </div>
            </div>
            <button className="mt-md w-full bg-primary text-on-primary py-sm rounded-lg font-semibold flex items-center justify-center gap-xs hover:opacity-90 transition-all">
              <span className="material-symbols-outlined text-sm">add</span>
              <span>New Verification</span>
            </button>
          </div>
          <nav className="flex-1 px-sm space-y-xs">
            <div className="flex items-center gap-sm px-md py-sm cursor-pointer transition-all hover:bg-surface-variant text-on-surface-variant rounded-lg">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-label-md text-label-md">Dashboard</span>
            </div>
            <div className="flex items-center gap-sm px-md py-sm cursor-pointer transition-all hover:bg-surface-variant text-on-surface-variant rounded-lg">
              <span className="material-symbols-outlined">description</span>
              <span className="font-label-md text-label-md">Pengajuan</span>
            </div>
            <div className="flex items-center gap-sm px-md py-sm cursor-pointer transition-all hover:bg-surface-variant text-on-surface-variant rounded-lg">
              <span className="material-symbols-outlined">assessment</span>
              <span className="font-label-md text-label-md">Laporan</span>
            </div>
          </nav>
          <div className="px-sm mt-auto space-y-xs pt-md border-t border-outline-variant">
            <div className="flex items-center gap-sm px-md py-sm cursor-pointer transition-all hover:bg-surface-variant text-on-surface-variant rounded-lg">
              <span className="material-symbols-outlined">settings</span>
              <span className="font-label-md text-label-md">Settings</span>
            </div>
            <div className="flex items-center gap-sm px-md py-sm cursor-pointer transition-all hover:bg-surface-variant text-on-surface-variant rounded-lg">
              <span className="material-symbols-outlined">history</span>
              <span className="font-label-md text-label-md">Audit Trail</span>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 md:ml-64 flex flex-col h-full">
          {/* Breadcrumb & Header Panel */}
          <div className="bg-white px-md py-sm border-b border-outline-variant flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center gap-xs text-label-sm text-on-surface-variant mb-base">
                <span>Verifikasi</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span>Detail Dokumen</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-primary font-semibold">{formulir?.nama_lengkap || 'Loading...'}</span>
              </div>
              <div className="flex items-center gap-md">
                <h1 className="text-headline-md font-headline-md text-primary">{formulir?.nama_lengkap || 'Detail Pengajuan'}</h1>
                <span className={`px-sm py-base ${getStatusBadge(formulir?.status || 'submitted')} rounded-full text-xs font-semibold uppercase tracking-wider`}>
                  {getStatusLabel(formulir?.status || 'submitted')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <button className="p-xs hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined">fullscreen</span>
              </button>
              <button className="p-xs hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>

          {/* Content Area (Split Screen) */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Pane: Personal Data (Read-only) */}
            <section className="w-[40%] flex flex-col border-r border-outline-variant bg-white">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30">
                <h3 className="text-label-md font-bold text-primary flex items-center gap-xs">
                  <span className="material-symbols-outlined text-sm">badge</span>
                  DATA DIRI PEMOHON
                </h3>
                <span className="text-[10px] text-on-surface-variant italic">Data Terverifikasi Kependudukan</span>
              </div>
              <div className="flex-1 overflow-y-auto p-md space-y-md custom-scrollbar">
                {loading ? (
                  <div className="flex items-center justify-center py-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : formulir ? (
                  <div className="grid grid-cols-1 gap-md">
                    <div className="space-y-xs">
                      <label className="text-label-sm text-on-surface-variant">Nomor Induk Pegawai (NIP)</label>
                      <div className="px-sm py-sm bg-surface-container-lowest border border-outline-variant rounded text-body-md font-semibold text-primary">
                        {formulir.nip || '-'}
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <label className="text-label-sm text-on-surface-variant">Nama Lengkap</label>
                      <div className="px-sm py-sm bg-surface-container-lowest border border-outline-variant rounded text-body-md font-medium text-primary">
                        {formulir.nama_lengkap || '-'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-sm">
                      <div className="space-y-xs">
                        <label className="text-label-sm text-on-surface-variant">Jabatan</label>
                        <div className="px-sm py-sm bg-surface-container-lowest border border-outline-variant rounded text-body-md font-medium text-primary">
                          {formulir.jabatan || '-'}
                        </div>
                      </div>
                      <div className="space-y-xs">
                        <label className="text-label-sm text-on-surface-variant">Satuan Kerja</label>
                        <div className="px-sm py-sm bg-surface-container-lowest border border-outline-variant rounded text-body-md font-medium text-primary">
                          {formulir.satker || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <label className="text-label-sm text-on-surface-variant">Tanggal Pengajuan</label>
                      <div className="px-sm py-sm bg-surface-container-lowest border border-outline-variant rounded text-body-md font-medium text-primary">
                        {formatDateTime(formulir.created_at)}
                      </div>
                    </div>

                    <div className="space-y-sm mt-md">
                      <label className="text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Pratinjau Dokumen</label>
                      <div className="space-y-xs">
                        {dokumen.length > 0 ? (
                          dokumen.map((doc, idx) => {
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
              </div>
            </section>

            {/* Right Pane: Document Preview */}
            <section className="w-[60%] flex flex-col bg-surface-dim">
              <div className="p-sm flex justify-between items-center bg-white border-b border-outline-variant">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-error">picture_as_pdf</span>
                  <span className="text-label-md font-bold text-primary">
                    {dokumen.length > 0 ? dokumen[0].filename : 'Dokumen.pdf'}
                  </span>
                </div>
                <div className="flex items-center gap-xs bg-surface-container-low rounded p-1">
                  <button className="p-xs hover:bg-white rounded transition-all"><span className="material-symbols-outlined text-sm">zoom_out</span></button>
                  <span className="text-xs font-semibold px-xs">100%</span>
                  <button className="p-xs hover:bg-white rounded transition-all"><span className="material-symbols-outlined text-sm">zoom_in</span></button>
                  <div className="w-px h-4 bg-outline-variant mx-xs"></div>
                  <button className="p-xs hover:bg-white rounded transition-all"><span className="material-symbols-outlined text-sm">download</span></button>
                  <button className="p-xs hover:bg-white rounded transition-all"><span className="material-symbols-outlined text-sm">print</span></button>
                </div>
              </div>
              <div className="flex-1 p-xl overflow-y-auto custom-scrollbar flex justify-center">
                {dokumen.length > 0 ? (
                  <div className="w-full max-w-2xl">
                    <iframe
                      src={dokumen[0].filepath}
                      className="w-full h-[600px] rounded-lg border border-outline-variant shadow-lg"
                      title="Document Preview"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-body-sm text-on-surface-variant">Tidak ada dokumen untuk ditampilkan.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Footer Action Panel */}
          <footer className="bg-white border-t border-outline-variant p-md flex items-center justify-center">
            {formulir?.status === 'verified' ? (
              <span className="text-label-md font-bold text-green-700 flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Pengajuan sudah disetujui — {formatDateTime(formulir.updated_at || formulir.created_at)}
              </span>
            ) : (
              <span className="text-label-md font-bold text-on-surface-variant flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">pending_actions</span>
                {getStatusLabel(formulir?.status || 'submitted')}
              </span>
            )}
          </footer>
        </main>
      </div>
    </div>
  )
}
