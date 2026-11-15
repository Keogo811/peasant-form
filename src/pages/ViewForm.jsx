import { useEffect, useState } from 'react'
import { neon } from '../lib/neon'

export default function ViewForm({ formId, onBack, isPublic = false }) {
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

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Chargement…</p>
  if (!form) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Formulaire introuvable.</p>

  return (
    <div className={`public-form theme-${form.theme || 'pro'}`}>
      {!isPublic && (
        <button 
          onClick={onBack} 
          style={{ 
            marginBottom: '1rem', 
            padding: '0.5rem', 
            cursor: 'pointer', 
            background: 'transparent', 
            border: '1px solid currentColor', 
            borderRadius: '4px', 
            color: 'inherit' 
          }}
        >
          ← Retour
        </button>
      )}
      
      <h2>{form.title}</h2>
      <p style={{ opacity: 0.8 }}>{form.description}</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        {questions.map((q) => (
          <div key={q.id}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
              {q.label} {q.required && '*'}
            </label>
            
            {q.type === 'short_text' && (
              <input type="text" required={q.required} onChange={(e) => handleAnswer(q.id, e.target.value)} />
            )}
            
            {q.type === 'long_text' && (
              <textarea required={q.required} onChange={(e) => handleAnswer(q.id, e.target.value)} rows={3} />
            )}

            {q.type === 'date' && (
              <input type="date" required={q.required} onChange={(e) => handleAnswer(q.id, e.target.value)} />
            )}

            {q.type === 'single_choice' && q.options && (
              <select required={q.required} onChange={(e) => handleAnswer(q.id, e.target.value)}>
                <option value="">-- Choisir --</option>
                {q.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            )}

            {q.type === 'multiple_choice' && q.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {q.options.map((opt, i) => (
                  <label key={i} style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: 'auto', marginRight: '0.5rem' }}
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
              <div style={{ display: 'flex', gap: '1rem' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <label key={n} style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center' }}>
                    <input type="radio" name={`q_${q.id}`} value={n} required={q.required} onChange={(e) => handleAnswer(q.id, e.target.value)} style={{ width: 'auto', marginRight: '0.25rem' }} /> {n}
                  </label>
                ))}
              </div>
            )}

            {q.type === 'boolean' && (
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="radio" name={`q_${q.id}`} value="Oui" required={q.required} onChange={(e) => handleAnswer(q.id, 'Oui')} style={{ width: 'auto', marginRight: '0.25rem' }} /> Oui
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="radio" name={`q_${q.id}`} value="Non" required={q.required} onChange={(e) => handleAnswer(q.id, 'Non')} style={{ width: 'auto', marginRight: '0.25rem' }} /> Non
                </label>
              </div>
            )}
          </div>
        ))}
        
        <button type="submit">
          Envoyer les réponses
        </button>
      </form>
      {message && <p style={{ marginTop: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>{message}</p>}
    </div>
  )
}