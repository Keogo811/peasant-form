import { useState } from 'react'
import { neon } from '../lib/neon'
import { useI18n } from '../lib/i18n'

const THEMES = [
  { id: 'gaming', name: 'Gaming', bg: '#1a1a2e', color: '#00ffcc', font: "'Press Start 2P', monospace", border: '2px solid #00ffcc' },
  { id: 'noel', name: 'Noël', bg: '#fdf5f5', color: '#d32f2f', font: "'Mountains of Christmas', cursive", border: '3px solid #d32f2f' },
  { id: 'pro', name: 'Pro', bg: '#ffffff', color: '#0f172a', font: "'Inter', sans-serif", border: '1px solid #cbd5e1' },
  { id: 'japonais', name: 'Japonais', bg: '#fdfbf7', color: '#c0392b', font: "'Noto Serif JP', serif", border: '2px solid #c0392b' },
  { id: 'plage', name: 'Plage', bg: '#fecfef', color: '#d84315', font: "'Pacifico', cursive", border: '3px dashed #ff7043' },
  { id: 'nerd', name: 'Nerd', bg: '#0d1117', color: '#58a6ff', font: "'Roboto Mono', monospace", border: '1px solid #30363d' },
  { id: 'royal', name: 'Royal', bg: '#fdfbf7', color: '#4a0e4e', font: "'Cinzel', serif", border: '2px solid #d4af37' }
]

const QUESTION_TYPES = [
  { value: 'short_text', label: 'Texte court', desc: '(Nom, Email...)' },
  { value: 'long_text', label: 'Texte long', desc: '(Avis, Commentaires...)' },
  { value: 'single_choice', label: 'Choix unique', desc: '(Une seule option)' },
  { value: 'multiple_choice', label: 'Choix multiple', desc: '(Plusieurs options)' },
  { value: 'rating', label: 'Note (1-5)', desc: '(Étoiles)' },
  { value: 'date', label: 'Date', desc: '(Calendrier)' },
  { value: 'boolean', label: 'Oui / Non', desc: '(Vrai ou faux)' },
]

const emptyQuestion = () => ({ label: '', type: 'short_text', options: '', required: false })

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 800
        const scaleSize = MAX_WIDTH / img.width
        canvas.width = MAX_WIDTH
        canvas.height = img.height * scaleSize
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
    }
  })
}

export default function CreateForm({ user, onCreated }) {
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [theme, setTheme] = useState('gaming')
  const [image, setImage] = useState(null)
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function updateQuestion(index, patch) {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...patch } : q)))
  }
  function addQuestion() { setQuestions((qs) => [...qs, emptyQuestion()]) }
  function removeQuestion(index) { setQuestions((qs) => qs.filter((_, i) => i !== index)) }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (file) {
      const compressedBase64 = await compressImage(file)
      setImage(compressedBase64)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { data: formData, error: formError } = await neon
      .from('forms')
      .insert({ creator_id: user.id, title, description, theme, image_url: image, is_published: false })
      .select().single()

    if (formError) { setSaving(false); setMessage(`Error: ${formError.message}`); return }

    const questionsToInsert = questions
      .filter((q) => q.label.trim() !== '')
      .map((q, i) => ({
        form_id: formData.id, label: q.label, type: q.type,
        options: q.options ? q.options.split(',').map((s) => s.trim()).filter(Boolean) : null,
        required: q.required, position: i,
      }))

    if (questionsToInsert.length > 0) {
      const { error: qError } = await neon.from('questions').insert(questionsToInsert)
      if (qError) { setSaving(false); setMessage(`Error questions: ${qError.message}`); return }
    }

    setSaving(false)
    setMessage('✅')
    onCreated?.()
  }

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, color: 'var(--text)' }}>{t('create_title')}</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ color: 'var(--text)', fontWeight: 'bold', fontSize: '1.1rem' }}>
            {t('form_title')}
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Event survey" />
          </label>
          <label style={{ color: 'var(--text)', fontWeight: 'bold' }}>
            {t('form_desc')}
            <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="..." />
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text)', fontWeight: 'bold' }}>{t('image_upload')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="image-upload" />
              <label htmlFor="image-upload" className="btn" style={{ cursor: 'pointer' }}>
                {t('choose_image')}
              </label>
              {image && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={image} alt="Preview" style={{ height: '40px', borderRadius: '4px', border: '1px solid var(--text)' }} />
                  <button type="button" onClick={() => setImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 'bold' }}>{t('remove_image')}</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ color: 'var(--text)', borderBottom: '2px solid var(--text)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{t('choose_theme')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {THEMES.map(th => (
              <div 
                key={th.id}
                onClick={() => setTheme(th.id)}
                style={{
                  cursor: 'pointer',
                  border: theme === th.id ? '4px solid var(--primary)' : '1px solid #888',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: theme === th.id ? '0 0 15px var(--primary)' : 'none',
                  transition: 'all 0.2s',
                  transform: theme === th.id ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <div style={{ 
                  backgroundColor: th.bg, 
                  padding: '1.5rem 0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: th.border,
                  borderLeft: th.borderLeft || th.border,
                  borderRight: th.id === 'japonais' ? 'none' : th.border,
                  borderTop: th.id === 'japonais' ? 'none' : th.border,
                  borderBottom: th.id === 'japonais' ? 'none' : th.border,
                }}>
                  <span style={{ color: th.color, fontFamily: th.font, fontWeight: 'bold', fontSize: '1rem', textAlign: 'center' }}>
                    {th.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ color: 'var(--text)', borderBottom: '2px solid var(--text)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{t('questions')}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {questions.map((q, i) => (
              <div key={i} style={{ border: 'var(--border)', borderRadius: 8, padding: '1.5rem', backgroundColor: 'var(--bg)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-10px', left: '15px', backgroundColor: 'var(--text)', color: 'var(--bg)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {t('question_num')} {i + 1}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text)', fontWeight: 'bold' }}>
                    {t('question_label')}
                    <input className="input" value={q.label} onChange={(e) => updateQuestion(i, { label: e.target.value })} required placeholder="..." />
                  </label>
                  <label style={{ color: 'var(--text)', fontWeight: 'bold' }}>
                    {t('question_type')}
                    <select className="input" value={q.type} onChange={(e) => updateQuestion(i, { type: e.target.value })}>
                      {QUESTION_TYPES.map((qt) => <option key={qt.value} value={qt.value}>{qt.label} {qt.desc}</option>)}
                    </select>
                  </label>
                </div>

                {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                  <label style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}>
                    {t('options_placeholder')}
                    <input className="input" value={q.options} onChange={(e) => updateQuestion(i, { options: e.target.value })} placeholder="Option 1, Option 2, ..." />
                  </label>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', fontWeight: 'bold', cursor: 'pointer' }}>
                    <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(i, { required: e.target.checked })} style={{ width: '20px', height: '20px', margin: 0 }} />
                    {t('required')}
                  </label>
                  <button type="button" className="btn" onClick={() => removeQuestion(i)} disabled={questions.length === 1} style={{ backgroundColor: '#ff6b6b', color: 'white' }}>
                    🗑️ {t('delete_q')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="btn btn-inverse" onClick={addQuestion} style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}>
            + {t('add_q')}
          </button>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '1rem', fontSize: '1.2rem', marginTop: '1rem' }}>
          {saving ? t('creating') : t('create_btn')}
        </button>
      </form>
      
      {message && <p style={{ marginTop: '1rem', fontWeight: 'bold', color: 'var(--primary)', textAlign: 'center', fontSize: '1.1rem' }}>{message}</p>}
    </div>
  )
}