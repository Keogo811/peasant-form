import { useState } from 'react'
import { neon } from './lib/neon'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'

function App() {
  const [view, setView] = useState('signin') // 'signin' | 'signup'
  const [user, setUser] = useState(null)

  async function handleSignOut() {
    await neon.auth.signOut()
    setUser(null)
    setView('signin')
  }

  if (user) {
    return (
      <div style={{ maxWidth: 600, margin: '4rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
        <h1>Peasant Form</h1>
        <p>Connecté en tant que <strong>{user.email}</strong></p>
        <button onClick={handleSignOut} style={{ padding: '0.5rem 1rem' }}>
          Se déconnecter
        </button>
        <p style={{ marginTop: '2rem', color: '#666' }}>
          La liste de tes formulaires arrivera à l'étape suivante.
        </p>
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