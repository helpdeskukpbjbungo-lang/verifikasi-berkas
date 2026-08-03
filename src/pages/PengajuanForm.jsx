import React from 'react'
import { useNavigate } from 'react-router-dom'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

export default function PengajuanForm() {
  const [formData, setFormData] = React.useState({
    nama_lengkap: '',
    nip: '',
    jabatan: '',
    satker: '',
  })
  const [files, setFiles] = React.useState({})
  const [fileErrors, setFileErrors] = React.useState({})
  const [submitting, setSubmitting] = React.useState(false)
  const [submitMessage, setSubmitMessage] = React.useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (jenis, file) => {
    setFileErrors((prev) => {
      const next = { ...prev }
      delete next[jenis]
      return next
    })
    if (file && file.size > MAX_FILE_SIZE) {
      setFileErrors((prev) => ({ ...prev, [jenis]: `Ukuran file melebihi batas maksimal 2MB` }))
      setFiles((prev) => ({ ...prev, [jenis]: null }))
      return
    }
    if (file && file.type !== 'application/pdf') {
      setFileErrors((prev) => ({ ...prev, [jenis]: `File harus berformat PDF` }))
      setFiles((prev) => ({ ...prev, [jenis]: null }))
      return
    }
    setFiles((prev) => ({ ...prev, [jenis]: file }))
  }

  const isFormComplete = Boolean(
    formData.nama_lengkap &&
    formData.nip &&
    formData.jabatan &&
    formData.satker &&
    files['surat_permohonan'] &&
    files['pakta_integritas'] &&
    files['sk_terbaru']
  )

  const handleSaveDraft = () => {
    const draft = {
      formData,
      files: Object.fromEntries(
        Object.entries(files).map(([key, file]) => [key, { name: file.name, size: file.size, type: file.type }])
      ),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem('pengajuan-draft', JSON.stringify(draft))
    setSubmitMessage('Draft berhasil disimpan')
    setTimeout(() => setSubmitMessage(''), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMessage('')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('nama_lengkap', formData.nama_lengkap)
      formDataToSend.append('nip', formData.nip)
      formDataToSend.append('jabatan', formData.jabatan)
      formDataToSend.append('satker', formData.satker)

      Object.entries(files).forEach(([jenis, file]) => {
        if (file) {
          formDataToSend.append(jenis, file)
        }
      })

      const response = await fetch('/api/pengajuan', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitMessage('Pengajuan berhasil dikirim. Silahkan Cek Status Pengajuan secara berkala untuk melihat status verifikasi.')
        setFormData({
          nama_lengkap: '',
          nip: '',
          jabatan: '',
          satker: '',
        })
        setFiles({})
      } else {
        setSubmitMessage(data.error || 'Gagal mengirim pengajuan')
      }
    } catch (error) {
      console.error('Error submitting pengajuan:', error)
      setSubmitMessage('Gagal terhubung ke server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <nav className="sticky top-0 z-50 flex justify-between items-center w-full px-md py-xs bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <span className="text-headline-sm font-headline-sm font-bold text-primary">LPSE Portal</span>
          <div className="hidden md:flex items-center gap-lg ml-lg">
            <a className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md" href="#">Formulir Pengajuan</a>
            <a className="text-on-surface-variant hover:bg-surface-container-low px-xs py-base transition-colors font-body-md text-body-md cursor-pointer" onClick={() => navigate('/kolom-cek-status')}>Cek Status Pengajuan</a>
          </div>
        </div>
      </nav>

      <main className="max-w-[1000px] mx-auto px-md py-xl">
      <header className="mb-xl text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Formulir Pengajuan Pemohon</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Lengkapi data diri dan unggah dokumen pendukung untuk proses verifikasi akun LPSE.</p>
      </header>

      <div className="flex justify-center items-center mb-xl gap-xl">
        <div className="flex items-center gap-xs step-active">
          <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-label-md">1</span>
          <span className="font-label-md text-label-md">Data Diri</span>
        </div>
        <div className="w-16 h-px bg-outline-variant"></div>
        <div className="flex items-center gap-xs step-inactive">
          <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-label-md">2</span>
          <span className="font-label-md text-label-md">Unggah Dokumen</span>
        </div>
        <div className="w-16 h-px bg-outline-variant"></div>
        <div className="flex items-center gap-xs step-inactive">
          <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-label-md">3</span>
          <span className="font-label-md text-label-md">Konfirmasi</span>
        </div>
      </div>

      <form className="space-y-lg" id="submissionForm" onSubmit={handleSubmit}>
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
          <div className="flex items-center gap-sm mb-lg border-b border-outline-variant pb-md">
            <span className="material-symbols-outlined text-secondary">person</span>
            <h2 className="font-headline-sm text-headline-sm text-primary">Data Pemohon</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="nama_lengkap">Nama Lengkap (Sesuai KTP)</label>
              <div className="border border-outline-variant rounded-lg p-sm bg-white flex items-center gap-sm form-focus transition-all">
                <span className="material-symbols-outlined text-outline">badge</span>
                <input className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md" id="nama_lengkap" name="nama_lengkap" placeholder="Masukkan nama lengkap" type="text" value={formData.nama_lengkap} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="nip">NIP (Nomor Induk Pegawai)</label>
              <div className="border border-outline-variant rounded-lg p-sm bg-white flex items-center gap-sm form-focus transition-all">
                <span className="material-symbols-outlined text-outline">fingerprint</span>
                <input className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md" id="nip" name="nip" placeholder="Masukkan 18 digit NIP" type="text" value={formData.nip} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="jabatan">Jabatan</label>
              <div className="border border-outline-variant rounded-lg p-sm bg-white flex items-center gap-sm form-focus transition-all">
                <span className="material-symbols-outlined text-outline">work</span>
                <select className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md appearance-none" id="jabatan" name="jabatan" value={formData.jabatan} onChange={handleChange}>
                  <option value="">Pilih Jabatan</option>
                  <option value="Staf Pengelola Pengadaan">Staf Pengelola Pengadaan</option>
                  <option value="Pejabat Pembuat Komitmen">Pejabat Pembuat Komitmen</option>
                  <option value="Anggota Pokja Pemilihan">Anggota Pokja Pemilihan</option>
                </select>
              </div>
            </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="satuan_kerja">Satuan Kerja</label>
                <div className="border border-outline-variant rounded-lg p-sm bg-white flex items-center gap-sm form-focus transition-all">
                  <span className="material-symbols-outlined text-outline">corporate_fare</span>
                  <select className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md appearance-none" id="satuan_kerja" name="satker" value={formData.satker} onChange={handleChange}>
                    <option value="">Pilih Satuan Kerja</option>
                    <option value="Kementerian Keuangan">Kementerian Keuangan</option>
                    <option value="Kementerian Pekerjaan Umum">Kementerian Pekerjaan Umum</option>
                    <option value="Dinas Pendidikan Provinsi">Dinas Pendidikan Provinsi</option>
                  </select>
                </div>
              </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
          <div className="flex items-center gap-sm mb-lg border-b border-outline-variant pb-md">
            <span className="material-symbols-outlined text-secondary">cloud_upload</span>
            <h2 className="font-headline-sm text-headline-sm text-primary">Pusat Unggah Dokumen</h2>
          </div>
          <div className="space-y-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md p-md border border-outline-variant border-dashed rounded-lg drop-zone transition-all">
              <div className="flex items-start gap-md">
                <div className="bg-secondary-container/20 p-sm rounded-lg">
                  <span className="material-symbols-outlined text-secondary">description</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-primary">Surat Permohonan Verifikasi</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Format .pdf, Maksimal 5MB</p>
                </div>
              </div>
              <div className="flex items-center gap-sm">
                <label className="cursor-pointer bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary-container transition-colors inline-block text-center">
                  Pilih File
                  <input className="hidden" type="file" onChange={(e) => handleFileChange('surat_permohonan', e.target.files[0])} />
                </label>
                {files['surat_permohonan'] && (
                  <span className="font-body-sm text-body-sm text-green-600 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {files['surat_permohonan'].name}
                  </span>
                )}
                <span className="material-symbols-outlined text-outline cursor-help" title="Wajib diunggah dengan tanda tangan basah dan stempel">info</span>
              </div>
              {fileErrors['surat_permohonan'] && (
                <p className="text-[11px] text-error mt-1">{fileErrors['surat_permohonan']}</p>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md p-md border border-outline-variant border-dashed rounded-lg drop-zone transition-all">
              <div className="flex items-start gap-md">
                <div className="bg-secondary-container/20 p-sm rounded-lg">
                  <span className="material-symbols-outlined text-secondary">verified</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-primary">Pakta Integritas</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Format .pdf, Maksimal 2MB</p>
                </div>
              </div>
              <div className="flex items-center gap-sm">
                <label className="cursor-pointer bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary-container transition-colors inline-block text-center">
                  Pilih File
                  <input className="hidden" type="file" onChange={(e) => handleFileChange('pakta_integritas', e.target.files[0])} />
                </label>
                {files['pakta_integritas'] && (
                  <span className="font-body-sm text-body-sm text-green-600 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {files['pakta_integritas'].name}
                  </span>
                )}
                <span className="material-symbols-outlined text-outline cursor-help" title="Sesuai format standar LPSE yang berlaku">info</span>
              </div>
              {fileErrors['pakta_integritas'] && (
                <p className="text-[11px] text-error mt-1">{fileErrors['pakta_integritas']}</p>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md p-md border border-outline-variant border-dashed rounded-lg drop-zone transition-all">
              <div className="flex items-start gap-md">
                <div className="bg-secondary-container/20 p-sm rounded-lg">
                  <span className="material-symbols-outlined text-secondary">assignment_ind</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-primary">SK Jabatan Terakhir</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Format .pdf, Maksimal 10MB</p>
                </div>
              </div>
              <div className="flex items-center gap-sm">
                <label className="cursor-pointer bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary-container transition-colors inline-block text-center">
                  Pilih File
                  <input className="hidden" type="file" onChange={(e) => handleFileChange('sk_terbaru', e.target.files[0])} />
                </label>
                {files['sk_terbaru'] && (
                  <span className="font-body-sm text-body-sm text-green-600 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {files['sk_terbaru'].name}
                  </span>
                )}
                <span className="material-symbols-outlined text-outline cursor-help" title="Salinan legalisir SK pengangkatan terakhir">info</span>
              </div>
              {fileErrors['sk_terbaru'] && (
                <p className="text-[11px] text-error mt-1">{fileErrors['sk_terbaru']}</p>
              )}
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-md pt-md">
          <button onClick={handleSaveDraft} disabled={!isFormComplete} className="w-full sm:w-auto px-xl py-sm font-label-md text-label-md text-secondary border border-secondary rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed" type="button">
            Simpan Draft
          </button>
          <button className="w-full sm:w-auto px-xl py-sm font-label-md text-label-md bg-primary text-on-primary rounded-lg hover:bg-primary-container shadow-sm active:opacity-80 transition-all flex items-center justify-center gap-xs" type="submit" disabled={submitting}>
            <span>{submitting ? 'Mengirim...' : 'Lanjutkan Pengajuan'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </form>

      {submitMessage && (
        <div className={`mt-md p-md rounded-lg border ${submitMessage.includes('berhasil') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <p className="font-body-sm text-body-sm">{submitMessage}</p>
        </div>
      )}

      <footer className="mt-xl border-t border-outline-variant pt-lg flex flex-col md:flex-row justify-between items-center gap-md">
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">schedule</span>
            <span className="font-body-sm text-body-sm">Estimasi verifikasi: 2-3 hari kerja</span>
          </div>
        </div>
        <div className="text-on-surface-variant font-body-sm text-body-sm">
          © 2024 LPSE Portal. Seluruh Hak Cipta Dilindungi | Designed & Developed by Junaidi
        </div>
      </footer>
    </main>
    </div>
  )
}