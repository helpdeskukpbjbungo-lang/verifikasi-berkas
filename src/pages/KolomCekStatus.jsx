import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function KolomCekStatus() {
  const navigate = useNavigate()
  const [nip, setNip] = React.useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const handleSearch = (e) => {
    e.preventDefault()
    if (nip.trim()) {
      navigate('/cek-status?nip=' + nip)
    }
  }
  return (
    <div className="bg-background min-h-screen">
      <nav className="sticky top-0 z-50 flex justify-between items-center w-full px-md py-xs bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <span className="text-headline-sm font-headline-sm font-bold text-primary">LPSE Portal</span>
          <div className="hidden md:flex items-center gap-lg ml-lg">
            <a className="text-on-surface-variant hover:bg-surface-container-low px-xs py-base transition-colors font-body-md text-body-md cursor-pointer" onClick={() => navigate('/')}>Formulir Pengajuan</a>
            <a className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md" href="#">Cek Status Pengajuan</a>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-full hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-primary">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-surface border-b border-outline-variant md:hidden">
            <a className="block w-full text-left px-md py-sm text-on-surface-variant hover:bg-surface-container-low font-body-md text-body-md cursor-pointer" onClick={() => { setMobileMenuOpen(false); navigate('/') }}>Formulir Pengajuan</a>
            <a className="block w-full text-left px-md py-sm text-primary font-bold border-b border-outline-variant font-body-md text-body-md" href="#">Cek Status Pengajuan</a>
          </div>
        )}
      </nav>

      <main className="max-w-[1000px] mx-auto px-md py-xl">
        <header className="mb-xl text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Cek Status Pengajuan</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Pantau perkembangan verifikasi berkas Anda secara real-time dan tinjau riwayat aktivitas pengajuan.</p>
        </header>

        <div className="space-y-lg">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="max-w-[600px] mx-auto py-xl">
              <div className="text-center mb-lg">
                <h2 className="font-headline-sm text-headline-sm text-primary uppercase tracking-wider">MASUKKAN NIP ANDA</h2>
              </div>
              <form className="space-y-md" id="searchStatusForm" onSubmit={handleSearch}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">person</span>
                  </div>
                  <input className="block w-full pl-xl pr-md py-md border border-outline-variant rounded-xl bg-surface-bright focus:ring-primary focus:border-primary font-body-md" placeholder="Contoh: 198501012010011001" type="text" value={nip} onChange={(e) => setNip(e.target.value)}/>
                </div>
                <button className="w-full bg-primary text-on-primary py-md px-lg rounded-xl font-label-md flex items-center justify-center gap-sm hover:bg-primary-container transition-colors" type="submit">
                  <span className="material-symbols-outlined">search</span>
                  Cari Status
                </button>
              </form>
            </div>
          </section>

          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md flex items-start gap-sm">
            <span className="material-symbols-outlined text-secondary">info</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Pastikan NIP yang dimasukkan sudah benar dan sesuai dengan kartu identitas pegawai Anda.
            </p>
          </div>
        </div>

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