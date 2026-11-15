import './styles/themes.css'
import { useState, useEffect } from 'react'
import { neon } from './lib/neon'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import MyForms from './pages/MyForms'
import CreateForm from './pages/CreateForm'
import ViewForm from './pages/ViewForm'
import Dashboard from './pages/Dashboard'

function App() {
  const [view, setView] = useState('signin')
  const [user, setUser] = useState(null)
  const [appView, setAppView] = useState('list')
  const [reloadKey, setReloadKey] = useState(0)
  
  const [selectedFormId, setSelectedFormId] = useState(null)
  const [selectedDashboardId, setSelectedDashboardId] = useState(null)

  // --- NOUVEAU : Lecture de l'URL pour le lien public ---
  const [publicFormId, setPublicFormId] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const formId = params.get('form')
    if (formId) setPublicFormId(formId)
  }, [])
  // -----------------------------------------------------

  async function handleSignOut() {
    await neon.auth.signOut()
    setUser(null)
    setView('signin')
    setAppView('list')
  }

  // Si c'est un visiteur public qui a cliqué sur un lien
  if (publicFormId) {
    return (
      <div style={{ maxWidth: 700, margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
        <ViewForm formId={publicFormId} onBack={() => setPublicFormId(null)} isPublic={true} />
      </div>
    )
  }

  if (user) {
    if (selectedFormId) {
      return (
        <div style={{ maxWidth: 700, margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
          <ViewForm formId={selectedFormId} onBack={() => setSelectedFormId(null)} />
        </div>
      )
    }

    if (selectedDashboardId) {
      return (
        <div style={{ maxWidth: 700, margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
          <Dashboard formId={selectedDashboardId} onBack={() => setSelectedDashboardId(null)} />
        </div>
      )
    }

    return (
      <div style={{ maxWidth: 700, margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Peasant Form</h1>
          <button onClick={handleSignOut} style={{ padding: '0.5rem 1rem' }}>Se déconnecter</button>
        </header>
        <p style={{ color: '#666' }}>Connecté : {user.email}</p>
        <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button onClick={() => setAppView('list')} disabled={appView === 'list'}>Mes formulaires</button>
          <button onClick={() => setAppView('create')} disabled={appView === 'create'}>Créer un formulaire</button>
        </nav>
        {appView === 'list' && <MyForms key={reloadKey} onViewForm={setSelectedFormId} onViewDashboard={setSelectedDashboardId} />}
        {appView === 'create' && (
          <CreateForm user={user} onCreated={() => { setReloadKey(k => k + 1); setAppView('list') }} />
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button onClick={() => setView('signin')} disabled={view === 'signin'}>Connexion</button>
        <button onClick={() => setView('signup')} disabled={view === 'signup'}>Inscription</button>
      </div>
      {view === 'signin' ? <SignIn onSuccess={setUser} /> : <SignUp />}
    </div>
  )
}

export default App