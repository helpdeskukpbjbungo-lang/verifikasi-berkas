import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function CekStatus() {
  const [nip, setNip] = React.useState('')
  const [result, setResult] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const navigate = useNavigate()

  const [checked, setChecked] = React.useState(false)

  const handleCheck = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setChecked(false)

    try {
      const response = await fetch('/api/pengajuan')
      const data = await response.json()
      const found = data.find((item) => item.nip === nip)
      setResult(found || null)
      setChecked(true)
    } catch {
      setResult('error')
      setChecked(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-lg">
        <h1 className="font-headline-lg text-headline-lg text-primary">Cek Status Pengajuan</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Masukkan NIP untuk melihat status pengajuan Anda.</p>
      </div>

      <form onSubmit={handleCheck} className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm mb-lg">
        <div className="flex flex-col sm:flex-row gap-md">
          <input
            className="flex-1 bg-white border border-outline-variant rounded px-md py-sm font-body-md text-body-md"
            placeholder="Masukkan NIP"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            required
          />
          <button type="submit" className="px-xl py-3 bg-primary text-white font-label-md rounded-lg shadow-lg hover:bg-primary-container transition-all">
            Cek Status
          </button>
        </div>
      </form>

      {loading && <p className="text-center text-on-surface-variant">Mencari data...</p>}

      {checked && result === null && !loading && nip && (
        <div className="p-md rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800">
          <p className="font-body-sm text-body-sm">Data pengajuan dengan NIP tersebut tidak ditemukan.</p>
        </div>
      )}

      {result === 'error' && (
        <div className="p-md rounded-lg border bg-red-50 border-red-200 text-red-800">
          <p className="font-body-sm text-body-sm">Gagal memuat data. Coba lagi nanti.</p>
        </div>
      )}

      {result && result !== 'error' && (
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm">
          <h3 className="font-headline-sm text-headline-sm text-primary mb-md">Hasil Pencarian</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <p className="text-xs text-on-surface-variant">Nama Lengkap</p>
              <p className="font-body-md text-body-md text-on-surface">{result.nama_lengkap}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">NIP</p>
              <p className="font-body-md text-body-md text-on-surface">{result.nip}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Satker</p>
              <p className="font-body-md text-body-md text-on-surface">{result.satker || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Status</p>
              <p className={`font-body-md text-body-md font-semibold ${result.status === 'verified' ? 'text-green-700' : result.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'}`}>
                {result.status}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-lg mb-xl">
        <button onClick={() => navigate('/')} className="px-xl py-3 border border-outline text-on-surface-variant font-label-md rounded-lg hover:bg-surface-container-low transition-all">
          Kembali ke Formulir
        </button>
      </div>
    </div>
  )
}

