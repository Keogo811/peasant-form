import { useState } from 'react'
import { neon } from '../lib/neon'

const THEMES = [
  { value: 'gaming', label: 'Gaming' },
  { value: 'noel', label: 'Noël' },
  { value: 'pro', label: 'Pro moderne' },
  { value: 'japonais', label: 'Japonais' },
  { value: 'plage', label: 'Fun plage' },
  { value: 'nerd', label: 'Nerd code' },
  { value: 'royal', label: 'Royal' },
]

const QUESTION_TYPES = [
  { value: 'short_text', label: 'Texte court' },
  { value: 'long_text', label: 'Texte long' },
  { value: 'single_choice', label: 'Choix unique' },
  { value: 'multiple_choice', label: 'Choix multiple' },
  { value: 'rating', label: 'Note (1-5)' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Oui / Non' },
]

const emptyQuestion = () => ({ label: '', type: 'short_text', options: '', required: false })

export default function CreateForm({ user, onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [theme, setTheme] = useState('gaming')
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function updateQuestion(index, patch) {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...patch } : q)))
  }
  function addQuestion() { setQuestions((qs) => [...qs, emptyQuestion()]) }
  function removeQuestion(index) { setQuestions((qs) => qs.filter((_, i) => i !== index)) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { data: formData, error: formError } = await neon
      .from('forms')
      .insert({ creator_id: user.id, title, description, theme, is_published: false })
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
      if (qError) { setSaving(false); setMessage(`Formulaire créé, mais erreurs questions : ${qError.message}`); return }
    }

    setSaving(false)
    setMessage('Formulaire créé ✅')
    onCreated?.()
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0, color: 'var(--text)' }}>Créer un formulaire</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={{ color: 'var(--text)', fontWeight: 'bold' }}>
          Titre
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label style={{ color: 'var(--text)', fontWeight: 'bold' }}>
          Description
          <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>
        <label style={{ color: 'var(--text)', fontWeight: 'bold' }}>
          Thème
          <select className="input" value={theme} onChange={(e) => setTheme(e.target.value)}>
            {THEMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>

        <h3 style={{ color: 'var(--text)', marginBottom: 0 }}>Questions</h3>
        {questions.map((q, i) => (
          <div key={i} style={{ border: 'var(--border)', borderRadius: 6, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: 'var(--bg)' }}>
            <label style={{ color: 'var(--text)', fontWeight: 'bold' }}>
              Libellé
              <input className="input" value={q.label} onChange={(e) => updateQuestion(i, { label: e.target.value })} required />
            </label>
            <label style={{ color: 'var(--text)', fontWeight: 'bold' }}>
              Type
              <select className="input" value={q.type} onChange={(e) => updateQuestion(i, { type: e.target.value })}>
                {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
              <label style={{ color: 'var(--text)', fontWeight: 'bold' }}>
                Options (séparées par virgules)
                <input className="input" value={q.options} onChange={(e) => updateQuestion(i, { options: e.target.value })} placeholder="Rouge, Bleu, Vert" />
              </label>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
              <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(i, { required: e.target.checked })} style={{ width: 'auto', margin: 0 }} />
              Obligatoire
            </label>
            <button type="button" className="btn" onClick={() => removeQuestion(i)} disabled={questions.length === 1}>Supprimer</button>
          </div>
        ))}
        <button type="button" className="btn" onClick={addQuestion}>+ Ajouter une question</button>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '0.75rem', fontSize: '1.1rem' }}>
          {saving ? 'Enregistrement…' : 'Créer le formulaire'}
        </button>
      </form>
      {message && <p style={{ marginTop: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>{message}</p>}
    </div>
  )
}