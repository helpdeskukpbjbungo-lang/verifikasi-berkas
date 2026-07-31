import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function CekStatus() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nip = searchParams.get('nip') || ''
  const [pegawai, setPegawai] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    if (!nip) return
    setLoading(true)
    setError(false)
    fetch('/api/pengajuan')
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((item) => item.nip === nip)
        if (found) {
          setPegawai(found)
        } else {
          setPegawai(null)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [nip])

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

  const getProgressInfo = (status) => {
    switch (status) {
      case 'submitted':
        return { title: 'Dokumen Sedang Diverifikasi', desc: 'Dokumen Anda sedang dalam antrean verifikasi oleh tim LPSE. Estimasi waktu penyelesaian adalah 1-3 hari kerja.', color: 'bg-primary' }
      case 'verified':
        return { title: 'Pengajuan Telah Disetujui', desc: 'Pengajuan Anda telah diverifikasi dan disetujui oleh tim LPSE.', color: 'bg-green-500' }
      case 'rejected':
        return { title: 'Pengajuan Ditolak', desc: 'Pengajuan Anda ditolak. Silakan perbaiki dokumen dan ajukan kembali.', color: 'bg-error' }
      default:
        return { title: 'Menunggu Verifikasi', desc: 'Status pengajuan Anda sedang dalam proses.', color: 'bg-primary' }
    }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const addHours = (dateStr, hours) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    date.setHours(date.getHours() + hours)
    return formatDateTime(date.toISOString())
  }

  const buildHistory = (item) => {
    if (!item) return []
    const created = item.created_at ? formatDateTime(item.created_at) : null
    const updated = item.updated_at ? formatDateTime(item.updated_at) : null

    const base = [
      {
        tanggal: created || '-',
        aktivitas: 'Submit Pengajuan',
        status: 'Berhasil',
        statusWarna: 'green-600',
        keterangan: 'Dokumen lengkap telah diterima sistem',
      },
    ]

    if (item.status === 'submitted') {
      base.push({
        tanggal: updated || addHours(item.created_at, 4) || '-',
        aktivitas: 'Verifikasi Dokumen',
        status: 'Sedang Diproses',
        statusWarna: 'secondary',
        keterangan: 'Menunggu antrean verifikator LPSE',
      })
    } else if (item.status === 'verified') {
      base.push({
        tanggal: updated || addHours(item.created_at, 8) || '-',
        aktivitas: 'Verifikasi Dokumen',
        status: 'Terverifikasi',
        statusWarna: 'green-600',
        keterangan: 'Pengajuan telah diverifikasi dan disetujui',
      })
    } else if (item.status === 'rejected') {
      base.push({
        tanggal: updated || addHours(item.created_at, 6) || '-',
        aktivitas: 'Verifikasi Dokumen',
        status: 'Ditolak',
        statusWarna: 'red-600',
        keterangan: 'Pengajuan ditolak — dokumen tidak lengkap',
      })
    }

    return base.reverse()
  }

  const history = buildHistory(pegawai)
  const isRejected = pegawai?.status === 'rejected'
  return (
    <div className="bg-background min-h-screen">
      <nav className="sticky top-0 z-50 flex justify-between items-center w-full px-md py-xs bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <span className="text-headline-sm font-headline-sm font-bold text-primary">LPSE Portal</span>
          <div className="hidden md:flex items-center gap-lg ml-lg">
            <a className="text-on-surface-variant hover:bg-surface-container-low px-xs py-base transition-colors font-body-md text-body-md cursor-pointer" onClick={() => navigate('/')}>Formulir Pengajuan</a>
            <a className="text-on-surface-variant hover:bg-surface-container-low px-xs py-base transition-colors font-body-md text-body-md cursor-pointer" onClick={() => navigate('/kolom-cek-status')}>Cek Status Pengajuan</a>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-sm"></div>
        </div>
      </nav>

      <main className="max-w-[1000px] mx-auto px-md py-xl">
        <header className="mb-xl text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Detail Status Pengajuan</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Pantau perkembangan verifikasi berkas Anda secara real-time dan tinjau riwayat aktivitas pengajuan.</p>
        </header>

        <div className="w-full max-w-[800px] mx-auto mb-xl px-md">
          <div className="flex items-center justify-between relative h-3">
            <div className="absolute top-1/2 left-0 w-full h-px bg-outline-variant -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-primary -translate-y-1/2 z-0"></div>
          </div>
        </div>

        <form className="space-y-lg" id="submissionForm" onSubmit={(e) => e.preventDefault()}>
          {nip && (
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
              <div className="flex items-center gap-sm mb-md">
                <span className="material-symbols-outlined text-secondary">badge</span>
                <h2 className="font-headline-sm text-headline-sm text-primary">Detail Pegawai</h2>
              </div>
              {loading && <p className="font-body-sm text-body-sm text-on-surface-variant">Memuat data pegawai...</p>}
              {error && <p className="font-body-sm text-body-sm text-red-600">Gagal memuat data pegawai.</p>}
              {!loading && !error && pegawai && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">NIP</p>
                    <p className="font-body-md text-body-md text-on-surface">{pegawai.nip}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Nama Lengkap</p>
                    <p className="font-body-md text-body-md text-on-surface">{pegawai.nama_lengkap}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Satuan Kerja</p>
                    <p className="font-body-md text-body-md text-on-surface">{pegawai.satker || '-'}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Jabatan</p>
                    <p className="font-body-md text-body-md text-on-surface">{pegawai.jabatan || '-'}</p>
                  </div>
                </div>
              )}
              {!loading && !error && !pegawai && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">Data pegawai dengan NIP tersebut tidak ditemukan.</p>
              )}
            </section>
          )}
          <section className="bg-surface-container border border-primary rounded-xl p-lg mb-lg">
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">info</span>
                <h2 className="font-headline-sm text-headline-sm text-primary">Status Pengajuan Terakhir</h2>
              </div>
              {pegawai?.status && (
                <span className={`px-sm py-xs rounded-full text-label-md font-label-md ${getStatusBadge(pegawai.status)}`}>
                  {getStatusLabel(pegawai.status)}
                </span>
              )}
            </div>
            <div className="space-y-sm">
              <div className="flex items-start gap-md">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${pegawai?.status ? getProgressInfo(pegawai.status).color : 'bg-primary'}`}></div>
                  <div className="w-px h-12 bg-outline-variant"></div>
                  <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
                </div>
                <div className="space-y-xs">
                  <p className="font-body-md text-body-md text-primary font-bold">
                    {pegawai?.status ? getProgressInfo(pegawai.status).title : 'Dokumen Sedang Diverifikasi'}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {pegawai?.status ? getProgressInfo(pegawai.status).desc : 'Dokumen Anda sedang dalam antrean verifikasi oleh tim LPSE. Estimasi waktu penyelesaian adalah 1-3 hari kerja.'}
                  </p>
                  <p className="font-label-sm text-label-sm text-outline mt-xs">Terakhir diperbarui pada {history[0]?.tanggal || '-'}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg mt-lg">
            <div className="flex items-center gap-sm mb-lg border-b border-outline-variant pb-md">
              <span className="material-symbols-outlined text-secondary">history</span>
              <h2 className="font-headline-sm text-headline-sm text-primary">Riwayat Aktivitas Pengajuan</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low">
                  <tr className="text-label-md text-on-surface-variant">
                    <th className="p-md border-b border-outline-variant">Tanggal &amp; Waktu</th>
                    <th className="p-md border-b border-outline-variant">Aktivitas</th>
                    <th className="p-md border-b border-outline-variant">Status</th>
                    <th className="p-md border-b border-outline-variant">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm">
                  {history.map((item, index) => (
                    <tr key={index} className="border-b border-outline-variant">
                      <td className="p-md">{item.tanggal}</td>
                      <td className="p-md font-bold">{item.aktivitas}</td>
                      <td className="p-md">{item.statusWarna ? <span className={`text-${item.statusWarna}`}>{item.status}</span> : item.status}</td>
                      <td className="p-md">{item.keterangan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </form>

        {isRejected && (
          <div className="flex flex-col sm:flex-row items-center justify-end gap-md pt-md">
            <button onClick={() => navigate('/')} className="w-full sm:w-auto px-xl py-sm font-label-md text-label-md bg-primary text-on-primary rounded-lg hover:bg-primary-container shadow-sm active:opacity-80 transition-all flex items-center justify-center gap-xs">
              <span>Perbaiki</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        )}

        <footer className="mt-xl border-t border-outline-variant pt-lg flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="flex items-center gap-md">
            <div className="flex items-center gap-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
              <span className="text-body-sm font-body-sm">Estimasi verifikasi: 2-3 hari kerja</span>
            </div>
          </div>
          <div className="text-on-surface-variant text-body-sm font-body-sm">
            © 2024 LPSE Portal. Seluruh Hak Cipta Dilindungi | Designed & Developed by Junaidi
          </div>
        </footer>
      </main>
    </div>
  )
}
