import { useEffect, useState } from 'react'
import { neon } from './neon'

function App() {
  const [status, setStatus] = useState('Test en cours…')

  useEffect(() => {
    async function test() {
      try {
        // On interroge la table "forms" qui n'existe pas encore.
        // Si la requête atteint Neon (même avec une erreur "table introuvable"),
        // c'est que la connexion est bonne : les tables seront créées à l'étape suivante.
        await neon.from('forms').select('id').limit(1)
        setStatus('Connexion à Neon réussie ✅')
      } catch (err) {
        setStatus(`Erreur réseau : ${err.message}`)
      }
    }
    test()
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Peasant Form</h1>
      <p>{status}</p>
    </div>
  )
}

export default App