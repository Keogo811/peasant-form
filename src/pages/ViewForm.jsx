import { useEffect, useState } from 'react'
import { neon } from '../lib/neon'

export default function ViewForm({ formId, onBack }) {
  const [form, setForm] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadData() {
      // 1. Récupérer le formulaire
      const { data: formData } = await neon.from('forms').select('*').eq('id', formId).single()
      // 2. Récupérer les questions
      const { data: qData } = await neon.from('questions').select('*').eq('form_id', formId).order('position')
      
      setForm(formData)
      setQuestions(qData || [])
      setLoading(false)
    }
    loadData()
  }, [formId])

  function handleAnswer(questionId, value) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('Envoi en cours…')

    // 1. Créer la réponse principale
    const { data: responseData, error: rError } = await neon
      .from('responses')
      .insert({ form_id: formId })
      .select()
      .single()

    if (rError) {
      setMessage(`Erreur : ${rError.message}`)
      return
    }

    // 2. Créer les réponses par question
    const answersToInsert = Object.entries(answers).map(([qId, val]) => ({
      response_id: responseData.id,
      question_id: qId,
      value: Array.isArray(val) ? val.join(', ') : String(val)
    }))

    const { error: aError } = await neon.from('answers').insert(answersToInsert)

    if (aError) {
      setMessage(`Erreur : ${aError.message}`)
    } else {
      setMessage('Réponse envoyée avec succès ✅')
      setAnswers({})
    }
  }

  if (loading) return <p>Chargement…</p>
  if (!form) return <p>Formulaire introuvable.</p>

  return (
    <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: 8 }}>
      <button onClick={onBack} style={{ marginBottom: '1rem' }}>← Retour</button>
      <h2>{form.title}</h2>
      <p style={{ color: '#666' }}>{form.description}</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        {questions.map((q) => (
          <div key={q.id}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
              {q.label} {q.required && '*'}
            </label>
            
            {q.type === 'short_text' && (
              <input type="text" required={q.required} onChange={(e) => handleAnswer(q.id, e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
            )}
            
            {q.type === 'long_text' && (
              <textarea required={q.required} onChange={(e) => handleAnswer(q.id, e.target.value)} style={{ width: '100%', padding: '0.5rem' }} rows={3} />
            )}

            {q.type === 'date' && (
              <input type="date" required={q.required} onChange={(e) => handleAnswer(q.id, e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
            )}

            {q.type === 'single_choice' && q.options && (
              <select required={q.required} onChange={(e) => handleAnswer(q.id, e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
                <option value="">-- Choisir --</option>
                {q.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            )}

            {q.type === 'multiple_choice' && q.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {q.options.map((opt, i) => (
                  <label key={i} style={{ fontWeight: 'normal' }}>
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        const current = answers[q.id] || [];
                        const next = e.target.checked ? [...current, opt] : current.filter(v => v !== opt);
                        handleAnswer(q.id, next);
                      }} 
                    /> {opt}
                  </label>
                ))}
              </div>
            )}

            {q.type === 'rating' && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <label key={n} style={{ fontWeight: 'normal' }}>
                    <input type="radio" name={`q_${q.id}`} value={n} required={q.required} onChange={(e) => handleAnswer(q.id, e.target.value)} /> {n}
                  </label>
                ))}
              </div>
            )}

            {q.type === 'boolean' && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label><input type="radio" name={`q_${q.id}`} value="Oui" required={q.required} onChange={(e) => handleAnswer(q.id, 'Oui')} /> Oui</label>
                <label><input type="radio" name={`q_${q.id}`} value="Non" required={q.required} onChange={(e) => handleAnswer(q.id, 'Non')} /> Non</label>
              </div>
            )}
          </div>
        ))}
        
        <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#111', color: 'white', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
          Envoyer les réponses
        </button>
      </form>
      {message && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{message}</p>}
    </div>
  )
}