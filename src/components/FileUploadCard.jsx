import React from 'react'

export default function FileUploadCard({ title, description, onFileChange }) {
  const [selectedFile, setSelectedFile] = React.useState(null)

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file.name)
      if (onFileChange) {
        onFileChange(file)
      }
    }
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-md border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors group">
      <div className="flex items-start gap-md">
        <div className="w-10 h-10 bg-error-container text-error rounded flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">picture_as_pdf</span>
        </div>
        <div>
          <p className="font-label-md text-label-md text-on-surface">{title}</p>
          <p className="text-[11px] text-on-surface-variant">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-sm mt-sm md:mt-0">
        <button className="px-md py-2 border border-primary text-primary font-label-md rounded flex items-center gap-2 hover:bg-primary/5 transition-colors" type="button">
          <span className="material-symbols-outlined text-sm">visibility</span>
          Lihat Pratinjau
        </button>
        <label className="px-md py-2 bg-secondary text-white font-label-md rounded cursor-pointer hover:bg-primary transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">upload_file</span>
          Pilih File
          <input accept=".pdf" className="hidden" type="file" onChange={handleChange} />
        </label>
      </div>
      {selectedFile && (
        <p className="text-[11px] text-secondary font-bold mt-sm md:mt-0">
          Terpilih: {selectedFile}
        </p>
      )}
    </div>
  )
}