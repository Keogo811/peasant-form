import { useState } from 'react'
import { neon } from '../lib/neon'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data, error } = await neon.auth.signUp.email({
      email,
      password,
      name: email.split('@')[0] || 'Anonyme',
    })

    setLoading(false)

    if (error) {
      setMessage(`Erreur : ${error.message}`)
      return
    }

    setMessage(`Compte créé pour ${data.user.email}. Tu peux te connecter.`)
    setEmail('')
    setPassword('')
  }

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Créer un compte</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ padding: '0.5rem' }}>
          {loading ? 'Création…' : "S'inscrire"}
        </button>
      </form>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  )
}