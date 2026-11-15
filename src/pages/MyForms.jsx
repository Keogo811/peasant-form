import { useEffect, useState } from 'react'
import { neon } from '../lib/neon'

export default function MyForms() {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const { data, error } = await neon
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setError('')
    setForms(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Mes formulaires</h2>
      {loading && <p>Chargement…</p>}
      {error && <p style={{ color: 'crimson' }}>Erreur : {error}</p>}
      {!loading && !error && forms.length === 0 && (
        <p style={{ color: '#666' }}>Aucun formulaire pour l'instant.</p>
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {forms.map((f) => (
          <li
            key={f.id}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: 6,
              marginBottom: '0.5rem',
            }}
          >
            <strong>{f.title}</strong>{' '}
            <em style={{ color: '#888' }}>
              ({f.is_published ? 'publié' : 'brouillon'})
            </em>
          </li>
        ))}
      </ul>
    </div>
  )
}