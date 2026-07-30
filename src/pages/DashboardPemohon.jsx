import React from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function DashboardPemohon() {
  const [pengajuanList, setPengajuanList] = React.useState([])
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!user) {
      navigate('/login/pemohon')
      return
    }
    loadData()
  }, [user, navigate])

  const loadData = async () => {
    const response = await fetch('/api/pengajuan')
    if (response.ok) {
      setPengajuanList(await response.json())
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login/pemohon')
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Dashboard Pemohon</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant">
          <h2 className="text-xl font-semibold text-primary">Daftar Pengajuan Saya</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase">NIP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase">Satker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {pengajuanList.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm text-on-surface">{item.nama_lengkap}</td>
                  <td className="px-6 py-4 text-sm text-on-surface">{item.nip}</td>
                  <td className="px-6 py-4 text-sm text-on-surface">{item.satker || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'verified' ? 'bg-green-100 text-green-800' :
                      item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
