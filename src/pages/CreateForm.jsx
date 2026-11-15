import { useState } from 'react'
import { neon } from '../lib/neon'

const THEMES = [
  { id: 'gaming', name: 'Gaming', bg: '#1a1a2e', color: '#00ffcc', font: "'Press Start 2P', monospace" },
  { id: 'noel', name: 'Noël', bg: '#fff5f5', color: '#165b33', font: "'Mountains of Christmas', cursive" },
  { id: 'pro', name: 'Pro moderne', bg: '#ffffff', color: '#0f172a', font: "'Inter', sans-serif" },
  { id: 'japonais', name: 'Japonais', bg: '#fdfbf7', color: '#c0392b', font: "'Noto Serif JP', serif" },
  { id: 'plage', name: 'Fun plage', bg: '#fda085', color: '#d84315', font: "'Pacifico', cursive" },
  { id: 'nerd', name: 'Nerd code', bg: '#0d1117', color: '#58a6ff', font: "'Roboto Mono', monospace" },
  { id: 'royal', name: 'Royal', bg: '#2b1b3d', color: '#f1c40f', font: "'Cinzel', serif" }
]

const QUESTION_TYPES = [
  { value: 'short_text', label: 'Texte court', desc: '(Nom, Email, Pseudo...)' },
  { value: 'long_text', label: 'Texte long', desc: '(Commentaires, Avis...)' },
  { value: 'single_choice', label: 'Choix unique', desc: '(Une seule option possible)' },
  { value: 'multiple_choice', label: 'Choix multiple', desc: '(Plusieurs options possibles)' },
  { value: 'rating', label: 'Note (1-5)', desc: '(Étoiles)' },
  { value: 'date', label: 'Date', desc: '(Calendrier)' },
  { value: 'boolean', label: 'Oui / Non', desc: '(Vrai ou faux)' },
]

const emptyQuestion = () => ({ label: '', type: 'short_text', options: '', required: false })

// Fonction pour compresser l'image avant de l'envoyer dans la base
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
        // Qualité à 70% pour réduire le poids
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
    }
  })
}

export default function CreateForm({ user, onCreated }) {
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
      .insert({ 
        creator_id: user.id, 
        title, 
        description, 
        theme, 
        image_url: image, // On sauvegarde l'image Base64
        is_published: false 
      })
      .select().single()

    if (formError) { setSaving(false); setMessage(`Erreur formulaire : ${formError.message}`); return }

    const questionsToInsert = questions
      .filter((q) => q.label.trim() !== '')
      .map((q, i) => ({
        form_id: formData.id, label: q.label, type: q.type,
        options: q.options ? q.options.split(',').map((s) => s.trim()).filter(Boolean) : null,
        required: q.required, position: i,
      }))

    if (questionsToInsert.length > 0) {
      const { error: qError } = await neon.from('questions').insert(questionsToInsert)
      if (qError) { setSaving(false); setMessage(`Erreur questions : ${qError.message}`); return }
    }

    setSaving(false)
    setMessage('Formulaire créé ✅')
    onCreated?.()
  }

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, color: 'var(--text)' }}>Créer un formulaire</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* --- SECTION 1 : INFOS GÉNÉRALES --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ color: 'var(--text)', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Titre du formulaire *
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Sondage sur le nouvel event" />
          </label>
          <label style={{ color: 'var(--text)', fontWeight: 'bold' }}>
            Description
            <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Explique brièvement le but de ce formulaire..." />
          </label>

          {/* Upload d'image */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text)', fontWeight: 'bold' }}>Image d'illustration (optionnel)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="image-upload" />
              <label htmlFor="image-upload" className="btn" style={{ cursor: 'pointer' }}>
                📷 Choisir une image
              </label>
              {image && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={image} alt="Aperçu" style={{ height: '40px', borderRadius: '4px', border: '1px solid var(--text)' }} />
                  <button type="button" onClick={() => setImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 'bold' }}>Supprimer</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- SECTION 2 : THÈMES --- */}
        <div>
          <h3 style={{ color: 'var(--text)', borderBottom: '2px solid var(--text)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Choisir un thème visuel</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {THEMES.map(t => (
              <div 
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  cursor: 'pointer',
                  border: theme === t.id ? '4px solid var(--primary)' : 'var(--border)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: theme === t.id ? '0 0 10px var(--primary)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {/* Mini aperçu du thème */}
                <div style={{ backgroundColor: t.bg, padding: '1rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: t.color, fontFamily: t.font, fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>
                    {t.name}
                  </span>
                </div>
                <div style={{ backgroundColor: 'var(--card-bg)', padding: '0.5rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text)' }}>
                  {t.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECTION 3 : QUESTIONS --- */}
        <div>
          <h3 style={{ color: 'var(--text)', borderBottom: '2px solid var(--text)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Questions</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {questions.map((q, i) => (
              <div key={i} style={{ border: 'var(--border)', borderRadius: 8, padding: '1.5rem', backgroundColor: 'var(--bg)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-10px', left: '15px', backgroundColor: 'var(--text)', color: 'var(--bg)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  Question {i + 1}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text)', fontWeight: 'bold' }}>
                    Intitulé de la question *
                    <input className="input" value={q.label} onChange={(e) => updateQuestion(i, { label: e.target.value })} required placeholder="Ex: Quel est ton plat préféré ?" />
                  </label>
                  <label style={{ color: 'var(--text)', fontWeight: 'bold' }}>
                    Type de réponse
                    <select className="input" value={q.type} onChange={(e) => updateQuestion(i, { type: e.target.value })}>
                      {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label} {t.desc}</option>)}
                    </select>
                  </label>
                </div>

                {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                  <label style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}>
                    Options (séparées par des virgules)
                    <input className="input" value={q.options} onChange={(e) => updateQuestion(i, { options: e.target.value })} placeholder="Ex: Pizza, Burger, Sushi" />
                  </label>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', fontWeight: 'bold', cursor: 'pointer' }}>
                    <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(i, { required: e.target.checked })} style={{ width: '20px', height: '20px', margin: 0 }} />
                    Réponse obligatoire
                  </label>
                  <button type="button" className="btn" onClick={() => removeQuestion(i)} disabled={questions.length === 1} style={{ backgroundColor: '#ff6b6b', color: 'white' }}>
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="btn btn-inverse" onClick={addQuestion} style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}>
            + Ajouter une nouvelle question
          </button>
        </div>

        {/* --- BOUTON FINAL --- */}
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '1rem', fontSize: '1.2rem', marginTop: '1rem' }}>
          {saving ? 'Création en cours…' : 'Créer le formulaire 🚀'}
        </button>
      </form>
      
      {message && <p style={{ marginTop: '1rem', fontWeight: 'bold', color: 'var(--primary)', textAlign: 'center', fontSize: '1.1rem' }}>{message}</p>}
    </div>
  )
}