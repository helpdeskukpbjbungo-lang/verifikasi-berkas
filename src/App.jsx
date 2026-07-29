import TopNavBar from './components/TopNavBar'
import SideNavBar from './components/SideNavBar'
import PengajuanForm from './pages/PengajuanForm'

function App() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNavBar />
      <div className="flex min-h-[calc(100vh-64px)]">
        <SideNavBar />
        <main className="ml-64 flex-1 p-lg bg-background">
          <PengajuanForm />
        </main>
      </div>
    </div>
  )
}

export default App