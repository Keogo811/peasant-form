import { useEffect, useState } from 'react'
import { neon } from '../lib/neon'

export default function MyForms({ onViewForm, onViewDashboard }) {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await neon.from('forms').select('*').order('created_at', { ascending: false })
      setForms(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p>Chargement…</p>

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Mes formulaires</h2>
      {forms.length === 0 && <p>Aucun formulaire pour l'instant.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {forms.map((f) => (
          <li key={f.id} style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: 6, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong>{f.title}</strong> <em style={{ color: '#888' }}>({f.is_published ? 'publié' : 'brouillon'})</em>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => onViewForm(f.id)} style={{ padding: '0.25rem 0.5rem' }}>
                Voir / Répondre
              </button>
              <button onClick={() => onViewDashboard(f.id)} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#12234A', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                Résultats
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}