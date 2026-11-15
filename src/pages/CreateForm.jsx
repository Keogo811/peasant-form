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
  function removeQuestion(index) {
    setQuestions((qs) => qs.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    // 1. Insérer le formulaire
    const { data: formData, error: formError } = await neon
      .from('forms')
      .insert({
        creator_id: user.id,
        title,
        description,
        theme,
        is_published: false,
      })
      .select()
      .single()

    if (formError) {
      setSaving(false)
      setMessage(`Erreur formulaire : ${formError.message}`)
      return
    }

    // 2. Insérer les questions
    const questionsToInsert = questions
      .filter((q) => q.label.trim() !== '')
      .map((q, i) => ({
        form_id: formData.id,
        label: q.label,
        type: q.type,
        options: q.options
          ? q.options.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
        required: q.required,
        position: i,
      }))

    if (questionsToInsert.length > 0) {
      const { error: qError } = await neon.from('questions').insert(questionsToInsert)
      if (qError) {
        setSaving(false)
        setMessage(`Formulaire créé, mais erreurs sur les questions : ${qError.message}`)
        return
      }
    }

    setSaving(false)
    setMessage('Formulaire créé ✅')
    onCreated?.()
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Créer un formulaire</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>
          Titre
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
        <label>
          Thème
          <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
            {THEMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>

        <h3>Questions</h3>
        {questions.map((q, i) => (
          <div key={i} style={{ border: '1px solid #ddd', borderRadius: 6, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label>
              Libellé
              <input
                value={q.label}
                onChange={(e) => updateQuestion(i, { label: e.target.value })}
                style={{ width: '100%', padding: '0.5rem' }}
                required
              />
            </label>
            <label>
              Type
              <select
                value={q.type}
                onChange={(e) => updateQuestion(i, { type: e.target.value })}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
              <label>
                Options (séparées par des virgules)
                <input
                  value={q.options}
                  onChange={(e) => updateQuestion(i, { options: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem' }}
                  placeholder="Rouge, Bleu, Vert"
                />
              </label>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={q.required}
                onChange={(e) => updateQuestion(i, { required: e.target.checked })}
              />
              Obligatoire
            </label>
            <button type="button" onClick={() => removeQuestion(i)} disabled={questions.length === 1}>
              Supprimer cette question
            </button>
          </div>
        ))}
        <button type="button" onClick={addQuestion}>+ Ajouter une question</button>
        <button type="submit" disabled={saving} style={{ padding: '0.75rem', fontWeight: 'bold' }}>
          {saving ? 'Enregistrement…' : 'Créer le formulaire'}
        </button>
      </form>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  )
}