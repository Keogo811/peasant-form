import { useState } from 'react'
import { neon } from './lib/neon'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import MyForms from './pages/MyForms'

function App() {
  const [view, setView] = useState('signin')
  const [user, setUser] = useState(null)

  async function handleSignOut() {
    await neon.auth.signOut()
    setUser(null)
    setView('signin')
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
        <MyForms />
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