import { useState } from 'react'
import { neon } from './lib/neon'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import MyForms from './pages/MyForms'
import CreateForm from './pages/CreateForm'

function App() {
  const [view, setView] = useState('signin')
  const [user, setUser] = useState(null)
  const [appView, setAppView] = useState('list')
  const [reloadKey, setReloadKey] = useState(0)

  async function handleSignOut() {
    await neon.auth.signOut()
    setUser(null)
    setView('signin')
    setAppView('list')
  }

  if (user) {
    return (
      <div style={{ maxWidth: 700, margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Peasant Form</h1>
          <button onClick={handleSignOut} style={{ padding: '0.5rem 1rem' }}>
            Se déconnecter
          </button>
        </header>
        <p style={{ color: '#666' }}>Connecté : {user.email}</p>
        <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button onClick={() => setAppView('list')} disabled={appView === 'list'}>Mes formulaires</button>
          <button onClick={() => setAppView('create')} disabled={appView === 'create'}>Créer un formulaire</button>
        </nav>
        {appView === 'list' && <MyForms key={reloadKey} />}
        {appView === 'create' && (
          <CreateForm
            user={user}
            onCreated={() => { setReloadKey((k) => k + 1); setAppView('list') }}
          />
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