import React from 'react'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const FILE_LIMITS = {
  surat_permohonan: 5 * 1024 * 1024,
  pakta_integritas: 2 * 1024 * 1024,
  sk_terbaru: 10 * 1024 * 1024,
  surat_rekomendasi_ukpbj: 2 * 1024 * 1024,
  sertifikat_level1: 2 * 1024 * 1024,
  sk_kpa_sertifikat_pbj: 2 * 1024 * 1024,
}

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
  const [satkerList, setSatkerList] = React.useState([])
  const [loadingSatker, setLoadingSatker] = React.useState(true)
  const [nipError, setNipError] = React.useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const loadSatker = async () => {
      try {
        const response = await fetch('/api/satker')
        if (response.ok) {
          const data = await response.json()
          setSatkerList(data || [])
        }
      } catch (error) {
        console.error('Error loading satker:', error)
      } finally {
        setLoadingSatker(false)
      }
    }

    loadSatker()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNipChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    const value = raw.slice(0, 18)

    setFormData((prev) => ({ ...prev, nip: value }))

    if (!value) {
      setNipError('')
      return
    }

    if (value.length !== 18) {
      setNipError('NIP harus terdiri dari 18 digit angka')
      return
    }

    setNipError('')
  }

  const handleSatkerChange = (selected) => {
    setFormData((prev) => ({ ...prev, satker: selected ? selected.value : '' }))
  }

  const handleFileChange = (jenis, file) => {
    setFileErrors((prev) => {
      const next = { ...prev }
      delete next[jenis]
      return next
    })

    const limit = FILE_LIMITS[jenis] || MAX_FILE_SIZE
    if (file && file.size > limit) {
      setFileErrors((prev) => ({ ...prev, [jenis]: `Ukuran file melebihi batas maksimal ${Math.round(limit / 1024 / 1024)}MB` }))
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
    files['sk_terbaru'] &&
    (formData.jabatan !== 'Pejabat Pengadaan (PP)' || (files['surat_rekomendasi_ukpbj'] && files['sertifikat_level1'])) &&
    (formData.jabatan !== 'Pejabat Pembuat Komitmen (PPK)' || /kecamatan/i.test(formData.satker || '') || files['sk_kpa_sertifikat_pbj']) &&
    !nipError
  )

  const handleBatal = () => {
    setFormData({
      nama_lengkap: '',
      nip: '',
      jabatan: '',
      satker: '',
    })
    setFiles({})
    setFileErrors({})
    setNipError('')
    localStorage.removeItem('pengajuan-draft')
    setSubmitMessage('')
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

      console.log('Submitting pengajuan...', {
        nama_lengkap: formData.nama_lengkap,
        nip: formData.nip,
        jabatan: formData.jabatan,
        satker: formData.satker,
        files: Object.keys(files).filter(k => files[k])
      })

      const response = await fetch('/api/pengajuan', {
        method: 'POST',
        body: formDataToSend,
      })

      console.log('Response status:', response.status)

      let data
      try {
        data = await response.json()
        console.log('Response data:', data)
      } catch (err) {
        console.error('Response parse error:', err)
        setSubmitMessage('Gagal memproses respons server')
        return
      }

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
        setSubmitMessage(data?.error || 'Gagal mengirim pengajuan')
      }
    } catch (error) {
      console.error('Error submitting pengajuan:', error)
      setSubmitMessage('Gagal terhubung ke server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-gradient-pengajuan">
      <nav className="sticky top-0 z-50 flex justify-between items-center w-full px-md py-xs glass-nav">
        <div className="flex items-center gap-md">
          <span className="text-headline-sm font-headline-sm font-bold text-primary">LPSE DocVerify</span>
          <div className="hidden md:flex items-center gap-lg ml-lg">
            <a className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md" href="#">Formulir Pengajuan</a>
            <a className="text-on-surface-variant hover:bg-surface-container-low px-xs py-base transition-colors font-body-md text-body-md cursor-pointer" onClick={() => navigate('/kolom-cek-status')}>Cek Status Pengajuan</a>
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
          <div className="absolute top-full left-0 right-0 bg-white/90 backdrop-blur-md border-b border-outline-variant shadow-lg md:hidden">
            <a className="block w-full text-left px-md py-sm text-primary font-bold border-b border-outline-variant font-body-md text-body-md" href="#">Formulir Pengajuan</a>
            <a className="block w-full text-left px-md py-sm text-on-surface-variant hover:bg-surface-container-low font-body-md text-body-md cursor-pointer" onClick={() => { setMobileMenuOpen(false); navigate('/kolom-cek-status') }}>Cek Status Pengajuan</a>
          </div>
        )}
      </nav>

      <main className="max-w-[1000px] mx-auto px-md py-xl">
      <div className="gradient-subtle rounded-2xl p-xl mb-xl text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Formulir Pengajuan Pemohon</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Lengkapi data diri dan unggah dokumen pendukung untuk proses verifikasi akun LPSE.</p>
      </div>

      <div className="flex flex-row justify-center items-center mb-xl gap-1 md:gap-xl">
        <div className="flex items-center gap-xs step-active">
          <span className="w-6 h-6 md:w-8 md:h-8 rounded-full gradient-step flex items-center justify-center font-bold text-label-sm md:text-label-md text-white shadow-sm">1</span>
          <span className="font-label-sm md:font-label-md text-label-sm md:text-label-md">Data Diri</span>
        </div>
        <div className="hidden md:block w-8 md:w-16 h-px bg-outline-variant"></div>
        <div className="flex items-center gap-xs step-inactive">
          <span className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center font-bold text-label-sm md:text-label-md">2</span>
          <span className="font-label-sm md:font-label-md text-label-sm md:text-label-md">Unggah Dokumen</span>
        </div>
        <div className="hidden md:block w-8 md:w-16 h-px bg-outline-variant"></div>
        <div className="flex items-center gap-xs step-inactive">
          <span className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center font-bold text-label-sm md:text-label-md">3</span>
          <span className="font-label-sm md:font-label-md text-label-sm md:text-label-md">Konfirmasi</span>
        </div>
      </div>

      <form className="space-y-lg" id="submissionForm" onSubmit={handleSubmit}>
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
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
                <input className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md" id="nip" name="nip" placeholder="Masukkan 18 digit NIP" type="text" value={formData.nip} onChange={handleNipChange} inputMode="numeric" maxLength={18} />
              </div>
              {nipError && (
                <p className="text-[11px] text-error mt-1">{nipError}</p>
              )}
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="jabatan">Jabatan</label>
              <div className="border border-outline-variant rounded-lg p-sm bg-white flex items-center gap-sm form-focus transition-all">
                <span className="material-symbols-outlined text-outline">work</span>
                <select className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md appearance-none" id="jabatan" name="jabatan" value={formData.jabatan} onChange={handleChange}>
                  <option value="">Pilih Jabatan</option>
                  <option value="Pejabat Pengadaan (PP)">Pejabat Pengadaan (PP)</option>
                  <option value="Pejabat Pembuat Komitmen (PPK)">Pejabat Pembuat Komitmen (PPK)</option>
                  <option value="Pengguna Anggaran (PA)">Pengguna Anggaran (PA)</option>
                </select>
              </div>
            </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="satuan_kerja">Satuan Kerja</label>
                  <div className="border border-outline-variant rounded-lg p-sm bg-white flex items-center gap-sm form-focus transition-all">
                    <span className="material-symbols-outlined text-outline">corporate_fare</span>
                    <Select
                      id="satuan_kerja"
                      name="satker"
                      value={formData.satker ? { value: formData.satker, label: formData.satker } : null}
                      onChange={handleSatkerChange}
                      options={satkerList.map(item => ({ value: item.nama, label: item.nama }))}
                      placeholder="Pilih Satuan Kerja"
                      isLoading={loadingSatker}
                      isClearable
                      styles={{
                        container: (base) => ({ ...base, flex: 1 }),
                        control: (base) => ({
                          ...base,
                          border: 'none',
                          boxShadow: 'none',
                          background: 'transparent',
                          minHeight: 'auto',
                          padding: '0',
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          padding: '0',
                          margin: '0',
                        }),
                        input: (base) => ({
                          ...base,
                          margin: '0',
                          padding: '0',
                          color: 'inherit',
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: '#9e9e9e',
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: 'inherit',
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 50,
                        }),
                        menuList: (base) => ({
                          ...base,
                          maxHeight: '200px',
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused ? '#f0f0f0' : state.isSelected ? '#e3f2fd' : 'transparent',
                          color: state.isSelected ? '#1976d2' : 'inherit',
                          ':active': {
                            backgroundColor: '#e3f2fd',
                          },
                        }),
                      }}
                    />
                  </div>
              </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <div className="flex items-center gap-sm mb-lg border-b border-outline-variant pb-md">
            <span className="material-symbols-outlined text-secondary">cloud_upload</span>
            <h2 className="font-headline-sm text-headline-sm text-primary">Pusat Unggah Dokumen</h2>
          </div>
           <div className="space-y-lg">
             {formData.jabatan === 'Pejabat Pengadaan (PP)' && (
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-md p-md border border-outline-variant border-dashed rounded-lg drop-zone transition-all">
                 <div className="flex items-start gap-md">
                   <div className="bg-secondary-container/20 p-sm rounded-lg">
                     <span className="material-symbols-outlined text-secondary">verified</span>
                   </div>
                   <div>
                     <p className="font-label-md text-label-md text-primary">Surat Rekomendasi UKPBJ</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Format .pdf, Maksimal 2MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  <label className="cursor-pointer gradient-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:opacity-90 transition-all inline-block text-center shadow-sm">
                    Pilih File
                    <input className="hidden" type="file" onChange={(e) => handleFileChange('surat_rekomendasi_ukpbj', e.target.files[0])} />
                  </label>
                  {files['surat_rekomendasi_ukpbj'] && (
                    <span className="font-body-sm text-body-sm text-green-600 flex items-center gap-xs">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {files['surat_rekomendasi_ukpbj'].name}
                    </span>
                  )}
                  <span className="material-symbols-outlined text-outline cursor-help" title="Surat rekomendasi dari UKPBJ setelah surat permohonan disetujui">info</span>
                </div>
                {fileErrors['surat_rekomendasi_ukpbj'] && (
                  <p className="text-[11px] text-error mt-1">{fileErrors['surat_rekomendasi_ukpbj']}</p>
                )}
               </div>
             )}

             {formData.jabatan === 'Pejabat Pembuat Komitmen (PPK)' && !/kecamatan/i.test(formData.satker || '') && (
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-md p-md border border-outline-variant border-dashed rounded-lg drop-zone transition-all">
                 <div className="flex items-start gap-md">
                   <div className="bg-secondary-container/20 p-sm rounded-lg">
                     <span className="material-symbols-outlined text-secondary">verified</span>
                   </div>
                   <div>
                     <p className="font-label-md text-label-md text-primary">SK KPA / Sertifikat PBJ Level-1</p>
                   <p className="font-body-sm text-body-sm text-on-surface-variant">Format .pdf, Maksimal 5MB</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-sm">
                   <label className="cursor-pointer gradient-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:opacity-90 transition-all inline-block text-center shadow-sm">
                     Pilih File
                     <input className="hidden" type="file" onChange={(e) => handleFileChange('sk_kpa_sertifikat_pbj', e.target.files[0])} />
                   </label>
                   {files['sk_kpa_sertifikat_pbj'] && (
                     <span className="font-body-sm text-body-sm text-green-600 flex items-center gap-xs">
                       <span className="material-symbols-outlined text-sm">check_circle</span>
                       {files['sk_kpa_sertifikat_pbj'].name}
                     </span>
                   )}
                   <span className="material-symbols-outlined text-outline cursor-help" title="SK KPA atau Sertifikat PBJ Level-1 yang dikeluarkan oleh LKPP">info</span>
                 </div>
                 {fileErrors['sk_kpa_sertifikat_pbj'] && (
                   <p className="text-[11px] text-error mt-1">{fileErrors['sk_kpa_sertifikat_pbj']}</p>
                 )}
               </div>
             )}

             <div className="flex flex-col md:flex-row md:items-center justify-between gap-md p-md border border-outline-variant border-dashed rounded-lg drop-zone transition-all">
              <div className="flex items-start gap-md">
                <div className="bg-secondary-container/20 p-sm rounded-lg">
                  <span className="material-symbols-outlined text-secondary">description</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-primary">Surat Permohonan Verifikasi</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Format .pdf, Maksimal 2MB</p>
                </div>
              </div>
              <div className="flex items-center gap-sm">
                <label className="cursor-pointer gradient-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:opacity-90 transition-all inline-block text-center shadow-sm">
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
                <label className="cursor-pointer gradient-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:opacity-90 transition-all inline-block text-center shadow-sm">
                  Pilih File
                  <input className="hidden" type="file" onChange={(e) => handleFileChange('pakta_integritas', e.target.files[0])} />
                </label>
                {files['pakta_integritas'] && (
                  <span className="font-body-sm text-body-sm text-green-600 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {files['pakta_integritas'].name}
                  </span>
                )}
                <span className="material-symbols-outlined text-outline cursor-help" title="Pakta Integritas yang sudah ditandatangani diatas Materai 10.000">info</span>
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
                  <p className="font-label-md text-label-md text-primary">SK PP/PPK/PA Terbaru</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Format .pdf, Maksimal 10MB</p>
                </div>
              </div>
              <div className="flex items-center gap-sm">
                <label className="cursor-pointer gradient-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:opacity-90 transition-all inline-block text-center shadow-sm">
                  Pilih File
                  <input className="hidden" type="file" onChange={(e) => handleFileChange('sk_terbaru', e.target.files[0])} />
                </label>
                {files['sk_terbaru'] && (
                  <span className="font-body-sm text-body-sm text-green-600 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {files['sk_terbaru'].name}
                  </span>
                )}
                <span className="material-symbols-outlined text-outline cursor-help" title="Scan Asli SK Pengangkatan sebagai PP/PPK/PA">info</span>
              </div>
              {fileErrors['sk_terbaru'] && (
                <p className="text-[11px] text-error mt-1">{fileErrors['sk_terbaru']}</p>
              )}
            </div>

             {formData.jabatan === 'Pejabat Pengadaan (PP)' && (
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-md p-md border border-outline-variant border-dashed rounded-lg drop-zone transition-all">
                 <div className="flex items-start gap-md">
                   <div className="bg-secondary-container/20 p-sm rounded-lg">
                     <span className="material-symbols-outlined text-secondary">verified</span>
                   </div>
                   <div>
                    <p className="font-label-md text-label-md text-primary">Sertifikat PBJ Level-1</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Format .pdf, Maksimal 2MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  <label className="cursor-pointer gradient-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:opacity-90 transition-all inline-block text-center shadow-sm">
                    Pilih File
                    <input className="hidden" type="file" onChange={(e) => handleFileChange('sertifikat_level1', e.target.files[0])} />
                  </label>
                  {files['sertifikat_level1'] && (
                    <span className="font-body-sm text-body-sm text-green-600 flex items-center gap-xs">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {files['sertifikat_level1'].name}
                    </span>
                  )}
                  <span className="material-symbols-outlined text-outline cursor-help" title="Sertifikat Level 1 yang dikeluarkan oleh LKPP">info</span>
                </div>
                {fileErrors['sertifikat_level1'] && (
                  <p className="text-[11px] text-error mt-1">{fileErrors['sertifikat_level1']}</p>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-md pt-md">
          <button onClick={handleBatal} disabled={submitting} className="order-2 sm:order-1 w-full sm:w-auto px-xl py-sm font-label-md text-label-md text-white border border-white rounded-lg hover:bg-white/10 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed" type="button">
            Batal
          </button>
          <button className="order-1 sm:order-2 w-full sm:w-auto px-xl py-sm font-label-md text-label-md gradient-primary text-on-primary rounded-lg hover:opacity-90 shadow-md active:opacity-80 transition-all flex items-center justify-center gap-xs" type="submit" disabled={submitting}>
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
          <div className="flex items-center gap-xs text-white">
            <span className="material-symbols-outlined text-[20px]">schedule</span>
            <span className="font-body-sm text-body-sm">Estimasi verifikasi: 2-3 hari kerja</span>
          </div>
        </div>
        <div className="text-white font-body-sm text-body-sm">
          © 2026 LPSE Portal. Seluruh Hak Cipta Dilindungi | Designed & Developed by Junaidi
        </div>
      </footer>
    </main>
    </div>
  )
}