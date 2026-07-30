import React from 'react'
import FileUploadCard from '../components/FileUploadCard'
import InfoCard from '../components/InfoCard'

export default function PengajuanForm() {
  const [formData, setFormData] = React.useState({
    nama_lengkap: '',
    nip: '',
    jabatan: '',
    satker: '',
  })
  const [files, setFiles] = React.useState({})
  const [submitting, setSubmitting] = React.useState(false)
  const [submitMessage, setSubmitMessage] = React.useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (jenis, file) => {
    setFiles((prev) => ({ ...prev, [jenis]: file }))
  }

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
        setSubmitMessage(data.message || 'Pengajuan berhasil dikirim')
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-lg">
        <h1 className="font-headline-lg text-headline-lg text-primary">Formulir Pengajuan Pemohon</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Lengkapi data diri dan unggah dokumen pendukung untuk memproses verifikasi akun LPSE Anda.</p>
      </div>
      <form className="space-y-lg" onSubmit={handleSubmit}>
        <section className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm">
          <div className="flex items-center gap-xs mb-md pb-xs border-b border-outline-variant">
            <span className="material-symbols-outlined text-primary">person_outline</span>
            <h3 className="font-headline-sm text-headline-sm text-primary">Data Diri Pemohon</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="block font-label-md text-label-md text-on-surface">Nama Lengkap</label>
              <input className="w-full bg-white border border-outline-variant rounded px-md py-sm font-body-md text-body-md" placeholder="Masukkan nama lengkap" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} />
            </div>
            <div className="space-y-xs">
              <label className="block font-label-md text-label-md text-on-surface">NIP</label>
              <input className="w-full bg-white border border-outline-variant rounded px-md py-sm font-body-md text-body-md" placeholder="Masukkan NIP" name="nip" value={formData.nip} onChange={handleChange} />
            </div>
            <div className="space-y-xs">
              <label className="block font-label-md text-label-md text-on-surface">Jabatan</label>
              <select className="w-full bg-white border border-outline-variant rounded px-md py-sm font-body-md text-body-md" name="jabatan" value={formData.jabatan} onChange={handleChange}>
                <option value="">Pilih Jabatan</option>
                <option>Staf Pengelola Pengadaan</option>
                <option>Pejabat Pembuat Komitmen</option>
                <option>Anggota Pokja Pemilihan</option>
              </select>
            </div>
            <div className="space-y-xs">
              <label className="block font-label-md text-label-md text-on-surface">Satuan Kerja (Satker)</label>
              <input className="w-full bg-white border border-outline-variant rounded px-md py-sm font-body-md text-body-md" placeholder="Masukkan nama Satuan Kerja" type="text" name="satker" value={formData.satker} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm">
          <div className="flex items-center gap-xs mb-md pb-xs border-b border-outline-variant">
            <span className="material-symbols-outlined text-primary">cloud_upload</span>
            <h3 className="font-headline-sm text-headline-sm text-primary">Pusat Unggah Dokumen</h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-md italic">Pastikan dokumen dalam format PDF dengan ukuran maksimal 2MB per file.</p>
          <div className="space-y-sm">
            <FileUploadCard title="Surat Permohonan" description="Wajib diunggah dengan tanda tangan basah dan cap basah." onFileChange={(file) => handleFileChange('surat_permohonan', file)} />
            <FileUploadCard title="Pakta Integritas" description="Dokumen pernyataan integritas sesuai standar LPSE terbaru." onFileChange={(file) => handleFileChange('pakta_integritas', file)} />
            <FileUploadCard title="SK PPK/PP/PA Terbaru" description="Surat Keputusan pengangkatan sebagai PA/PPK/PP dalam format PDF." onFileChange={(file) => handleFileChange('sk_terbaru', file)} />
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-md pt-md">
          <button onClick={handleSaveDraft} className="w-full sm:w-auto px-xl py-3 border border-outline text-on-surface-variant font-label-md rounded-lg hover:bg-surface-container-low transition-all" type="button">
            Simpan Draft
          </button>
          <button className="w-full sm:w-auto px-xl py-3 bg-primary text-white font-label-md rounded-lg shadow-lg hover:bg-primary-container transition-all flex items-center justify-center gap-2" type="submit" disabled={submitting}>
            <span className="material-symbols-outlined text-sm">send</span>
            {submitting ? 'Mengirim...' : 'Kirim Permohonan'}
          </button>
        </div>
      </form>

      {submitMessage && (
        <div className={`mt-md p-md rounded-lg border ${submitMessage.includes('berhasil') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <p className="font-body-sm text-body-sm">{submitMessage}</p>
        </div>
      )}

      <InfoCard />
    </div>
  )
}