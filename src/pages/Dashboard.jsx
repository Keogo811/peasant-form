import { useEffect, useState } from 'react'
import { neon } from '../lib/neon'

export default function Dashboard({ formId, onBack }) {
  const [responses, setResponses] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // 1. Récupérer les questions pour avoir les libellés
      const { data: qData } = await neon.from('questions').select('*').eq('form_id', formId).order('position')
      setQuestions(qData || [])

      // 2. Récupérer les réponses et leurs "answers" imbriquées
      const { data: rData } = await neon
        .from('responses')
        .select('*, answers(*)')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false })
      
      setResponses(rData || [])
      setLoading(false)
    }
    load()
  }, [formId])

  if (loading) return <p>Chargement des résultats…</p>

  return (
    <div style={{ marginTop: '2rem' }}>
      <button onClick={onBack} style={{ marginBottom: '1rem', padding: '0.5rem' }}>← Retour aux formulaires</button>
      
      <h2>Résultats ({responses.length} réponse{responses.length > 1 ? 's' : ''})</h2>
      
      {responses.length === 0 && <p style={{ color: '#666' }}>Aucune réponse pour le moment.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {responses.map((r, i) => (
          <div key={r.id} style={{ padding: '1rem', backgroundColor: '#f4f4f4', borderRadius: 8, borderLeft: '4px solid #F0A500' }}>
            <p style={{ margin: '0 0 0.75rem 0', fontWeight: 'bold', color: '#12234A' }}>
              Réponse #{responses.length - i} 
              <span style={{ fontWeight: 'normal', fontSize: '0.85em', color: '#666', marginLeft: '0.5rem' }}>
                ({new Date(r.submitted_at).toLocaleString()})
              </span>
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              {questions.map(q => {
                const answer = r.answers?.find(a => a.question_id === q.id)
                return (
                  <li key={q.id}>
                    <strong>{q.label} :</strong> {answer ? answer.value : <em style={{ color: '#999' }}>(vide)</em>}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}