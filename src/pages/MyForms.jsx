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

  useEffect(() => { load() }, [])

  async function togglePublish(id, currentStatus) {
    const { error } = await neon.from('forms').update({ is_published: !currentStatus }).eq('id', id)
    if (!error) load()
    else alert("Erreur : " + error.message)
  }

  function copyLink(id) {
    const url = `${window.location.origin}${window.location.pathname}?form=${id}`
    navigator.clipboard.writeText(url)
    alert("Lien copié !\n\n" + url)
  }

  if (loading) return <p>Chargement…</p>

  return (
    <div>
      {forms.length === 0 && <p>Aucun formulaire pour l'instant. Crée le premier !</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {forms.map((f) => (
          <div key={f.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{f.title}</h3>
              <span style={{ 
                fontSize: '0.8em', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #1a1a1a',
                backgroundColor: f.is_published ? 'var(--secondary)' : '#eee',
                color: f.is_published ? 'white' : '#666'
              }}>
                {f.is_published ? 'En ligne' : 'Brouillon'}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
              <button className="btn" onClick={() => onViewDashboard(f.id)} style={{ flex: 1, backgroundColor: '#1a1a1a', color: 'white' }}>Résultats</button>
              <button className="btn" onClick={() => onViewForm(f.id)}>Voir</button>
              
              <div style={{ width: '100%', display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="btn" onClick={() => copyLink(f.id)} style={{ flex: 1 }}>Lien</button>
                <button 
                  onClick={() => togglePublish(f.id, f.is_published)} 
                  className="btn"
                  style={{ flex: 1, backgroundColor: f.is_published ? 'var(--accent)' : 'var(--primary)', color: f.is_published ? '#1a1a1a' : 'white' }}
                >
                  {f.is_published ? 'Dépublier' : 'Publier'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}