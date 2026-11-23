import { useState } from 'react'
import { neon } from '../lib/neon'
import { useI18n } from '../lib/i18n'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { data, error } = await neon.auth.signUp.email({ email, password, name: email.split('@')[0] || 'Anonyme' })
    setLoading(false)
    if (error) { setMessage(`Erreur : ${error.message}`); return }
    setMessage(`Compte créé ! Tu peux te connecter.`)
    setEmail(''); setPassword('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text)' }}>{t('email')}</label>
      <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
      
      <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text)' }}>{t('password')}</label>
      <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', padding: '0.75rem' }}>
        {loading ? '...' : t('btn_signup')}
      </button>
      {message && <p style={{ marginTop: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>{message}</p>}
    </form>
  )
}