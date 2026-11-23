import { useEffect, useState } from 'react'
import { neon } from '../lib/neon'
import { useI18n } from '../lib/i18n'

export default function MyForms({ onViewForm, onViewDashboard }) {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

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

  async function deleteForm(id) {
    if (!window.confirm(t('delete') + " ?")) return
    const { error } = await neon.from('forms').delete().eq('id', id)
    if (!error) load()
    else alert("Erreur : " + error.message)
  }

  function copyLink(id) {
    const url = `${window.location.origin}${window.location.pathname}?form=${id}`
    navigator.clipboard.writeText(url)
    alert(t('link') + " !\n\n" + url)
  }

  if (loading) return <p>Loading…</p>

  return (
    <div>
      {forms.length === 0 && <p>{t('no_forms')}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {forms.map((f) => (
          <div key={f.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{f.title}</h3>
              <span style={{ 
                fontSize: '0.8em', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--text)',
                backgroundColor: f.is_published ? 'var(--secondary)' : 'var(--bg)',
                color: f.is_published ? 'white' : 'var(--text)'
              }}>
                {f.is_published ? t('online') : t('draft')}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
              <button className="btn btn-inverse" onClick={() => onViewDashboard(f.id)} style={{ flex: 1 }}>{t('results')}</button>
              <button className="btn" onClick={() => onViewForm(f.id)}>{t('view')}</button>
              
              <div style={{ width: '100%', display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="btn" onClick={() => copyLink(f.id)} style={{ flex: 1 }}>{t('link')}</button>
                <button 
                  onClick={() => togglePublish(f.id, f.is_published)} 
                  className="btn"
                  style={{ flex: 1, backgroundColor: f.is_published ? 'var(--accent)' : 'var(--primary)', color: f.is_published ? '#1a1a1a' : 'white' }}
                >
                  {f.is_published ? t('unpublish') : t('publish')}
                </button>
                <button 
                  onClick={() => deleteForm(f.id)} 
                  className="btn"
                  style={{ backgroundColor: '#ff6b6b', color: 'white', padding: '0.5rem 0.75rem' }}
                  title={t('delete')}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}