import { useState, useEffect } from 'react'
import { neon } from './lib/neon'
import AuthPage from './pages/AuthPage'
import MyForms from './pages/MyForms'
import CreateForm from './pages/CreateForm'
import ViewForm from './pages/ViewForm'
import Dashboard from './pages/Dashboard'
import SettingsPanel from './components/SettingsPanel'
import SeasonalBackground from './components/SeasonalBackground' // <-- Nouvel import
import './styles/themes.css'
import './styles/main.css'

function App() {
  const [user, setUser] = useState(null)
  const [appView, setAppView] = useState('list')
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedFormId, setSelectedFormId] = useState(null)
  const [selectedDashboardId, setSelectedDashboardId] = useState(null)
  const [publicFormId, setPublicFormId] = useState(null)
  
  // État pour la saison
  const [season, setSeason] = useState(localStorage.getItem('app-season') || 'none')

  useEffect(() => {
    localStorage.setItem('app-season', season)
  }, [season])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const formId = params.get('form')
    if (formId) setPublicFormId(formId)
  }, [])

  async function handleSignOut() {
    await neon.auth.signOut()
    setUser(null)
    setAppView('list')
  }

  // --- RENDU DES PAGES ---
  let content

  if (publicFormId) {
    content = (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem', position: 'relative', zIndex: 10 }}>
        <ViewForm formId={publicFormId} onBack={() => setPublicFormId(null)} isPublic={true} />
      </div>
    )
  } else if (user) {
    if (selectedFormId) {
      content = <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem', position: 'relative', zIndex: 10 }}><ViewForm formId={selectedFormId} onBack={() => setSelectedFormId(null)} /></div>
    } else if (selectedDashboardId) {
      content = <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem', position: 'relative', zIndex: 10 }}><Dashboard formId={selectedDashboardId} onBack={() => setSelectedDashboardId(null)} /></div>
    } else {
      content = (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem', position: 'relative', zIndex: 10 }}>
          <header className="app-header">
            <h1 className="app-title app-title-large">
              Peasant Form
            </h1>
            <button className="btn" onClick={handleSignOut}>Déconnexion</button>
          </header>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button className={`btn ${appView === 'list' ? 'btn-primary' : ''}`} onClick={() => setAppView('list')}>Mes formulaires</button>
            <button className={`btn ${appView === 'create' ? 'btn-primary' : ''}`} onClick={() => setAppView('create')}>Créer un formulaire</button>
          </div>

          {appView === 'list' && <MyForms key={reloadKey} onViewForm={setSelectedFormId} onViewDashboard={setSelectedDashboardId} />}
          {appView === 'create' && <CreateForm user={user} onCreated={() => { setReloadKey(k => k + 1); setAppView('list') }} />}
        </div>
      )
    }
  } else {
    // Page de connexion : on n'affiche pas l'arrière-plan saisonnier
    content = <AuthPage onSuccess={setUser} />
  }

  return (
    <>
      {/* On affiche l'arrière-plan saisonnier seulement si on n'est pas sur la page de connexion */}
      {(!(!user && !publicFormId)) && <SeasonalBackground season={season} />}
      
      {content}
      <SettingsPanel season={season} setSeason={setSeason} />
    </>
  )
}

export default App