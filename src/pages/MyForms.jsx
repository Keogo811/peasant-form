import { useEffect, useState } from 'react'
import { neon } from '../lib/neon'

export default function MyForms({ onViewForm, onViewDashboard }) {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await neon.from('forms').select('*').order('created_at', { ascending: false })
    setForms(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function togglePublish(id, currentStatus) {
    const { error } = await neon.from('forms').update({ is_published: !currentStatus }).eq('id', id)
    if (!error) load()
    else alert("Erreur : " + error.message)
  }

  function copyLink(id) {
    const url = `${window.location.origin}${window.location.pathname}?form=${id}`
    navigator.clipboard.writeText(url)
    alert("Lien copié dans le presse-papiers !\n\n" + url)
  }

  if (loading) return <p>Chargement…</p>

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Mes formulaires</h2>
      {forms.length === 0 && <p>Aucun formulaire pour l'instant.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {forms.map((f) => (
          <li key={f.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: 8, marginBottom: '1rem', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong>{f.title}</strong>
              <em style={{ color: f.is_published ? '#28a745' : '#888' }}>
                {f.is_published ? 'En ligne' : 'Brouillon'}
              </em>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => onViewForm(f.id)} style={{ padding: '0.25rem 0.5rem' }}>Voir / Répondre</button>
              <button onClick={() => onViewDashboard(f.id)} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#12234A', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Résultats</button>
              
              <button onClick={() => copyLink(f.id)} style={{ padding: '0.25rem 0.5rem', marginLeft: 'auto', backgroundColor: '#f4f4f4' }}>
                Copier le lien
              </button>
              
              <button 
                onClick={() => togglePublish(f.id, f.is_published)} 
                style={{ padding: '0.25rem 0.5rem', backgroundColor: f.is_published ? '#dc3545' : '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >
                {f.is_published ? 'Dépublier' : 'Publier'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}