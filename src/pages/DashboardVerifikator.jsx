import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function DashboardVerifikator() {
  const [statistics, setStatistics] = React.useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  })
  const [pengajuanList, setPengajuanList] = React.useState([])
  const { user } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!user) {
      navigate('/login/verifikator')
      return
    }
    loadData()
  }, [user, navigate])

  const loadData = async () => {
    const response = await fetch('/api/pengajuan')
    if (response.ok) {
      const data = await response.json()
      setStatistics({
        total: data.length,
        pending: data.filter((item) => item.status === 'pending').length,
        verified: data.filter((item) => item.status === 'verified').length,
        rejected: data.filter((item) => item.status === 'rejected').length,
      })
      setPengajuanList(data)
    }
  }

  const updateStatus = async (id, status) => {
    await fetch(`/api/pengajuan/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    loadData()
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-8">Dashboard Verifikator</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-xl border border-outline-variant">
          <h3 className="text-sm font-medium text-on-surface-variant">Total Pengajuan</h3>
          <p className="text-3xl font-bold text-primary mt-2">{statistics.total}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-outline-variant">
          <h3 className="text-sm font-medium text-on-surface-variant">Menunggu</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{statistics.pending}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-outline-variant">
          <h3 className="text-sm font-medium text-on-surface-variant">Terverifikasi</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{statistics.verified}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-outline-variant">
          <h3 className="text-sm font-medium text-on-surface-variant">Ditolak</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{statistics.rejected}</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant">
          <h2 className="text-xl font-semibold text-primary">Daftar Pengajuan</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase">NIP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase">Satker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase">Aksi</th>
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
                  <td className="px-6 py-4 text-sm">
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      className="border border-outline-variant rounded px-2 py-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
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
