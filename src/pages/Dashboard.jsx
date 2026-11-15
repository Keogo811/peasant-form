import { useEffect, useState } from 'react'
import { neon } from '../lib/neon'

export default function Dashboard({ formId, onBack, isPublic = false }) {
  const [responses, setResponses] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: qData } = await neon.from('questions').select('*').eq('form_id', formId).order('position')
      setQuestions(qData || [])
      
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

  const chartQuestions = questions.filter(q => ['single_choice', 'multiple_choice', 'rating', 'boolean'].includes(q.type))

  const stats = chartQuestions.map(q => {
    let counts = {}
    
    if (q.type === 'multiple_choice' || q.type === 'single_choice') {
      (q.options || []).forEach(opt => counts[opt] = 0)
    } else if (q.type === 'rating') {
      [1, 2, 3, 4, 5].forEach(n => counts[n] = 0)
    } else if (q.type === 'boolean') {
      counts['Oui'] = 0
      counts['Non'] = 0
    }

    responses.forEach(r => {
      const ans = r.answers?.find(a => a.question_id === q.id)
      if (ans && ans.value) {
        if (q.type === 'multiple_choice') {
          ans.value.split(', ').forEach(val => {
            if (counts[val] !== undefined) counts[val]++
          })
        } else {
          if (counts[ans.value] !== undefined) counts[ans.value]++
        }
      }
    })

    const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0)
    return { question: q, counts, totalVotes }
  })

  // Palette de couleurs Néo-brutaliste
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#1a1a1a', '#a29bfe', '#fd79a8']

  return (
    <div>
      {!isPublic && (
        <button className="btn" onClick={onBack} style={{ marginBottom: '2rem' }}>
          ← Retour aux formulaires
        </button>
      )}
      
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Résultats</h2>
      <p style={{ color: '#666', fontSize: '1.1rem', fontWeight: 'bold' }}>
        {responses.length} réponse{responses.length > 1 ? 's' : ''} reçue{responses.length > 1 ? 's' : ''}
      </p>

      {responses.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', marginTop: '2rem' }}>
          <p style={{ fontSize: '1.2rem', margin: 0 }}>Aucune réponse pour le moment.</p>
          {!isPublic && <p style={{ color: '#666', marginTop: '0.5rem' }}>Partage le lien de ton formulaire pour commencer à récolter des avis !</p>}
        </div>
      )}

      {/* --- SECTION GRAPHIQUES --- */}
      {responses.length > 0 && chartQuestions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', margin: '2rem 0' }}>
          {stats.map(({ question, counts, totalVotes }) => (
            <div key={question.id} className="card">
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', lineHeight: '1.3' }}>{question.label}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(counts).map(([label, count], i) => {
                  const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
                  const color = colors[i % colors.length]
                  
                  return (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                        <span>{label}</span>
                        <span>{count} ({percentage}%)</span>
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#e0e0e0', border: '1px solid #1a1a1a', borderRadius: '4px', height: '16px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${percentage}%`, 
                          backgroundColor: color, 
                          height: '100%', 
                          transition: 'width 1s ease-in-out' 
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- SECTION RÉPONSES BRUTES --- */}
      {responses.length > 0 && (
        <>
          <h3 style={{ marginTop: '3rem', borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem' }}>
            Détail des réponses
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            {responses.map((r, i) => (
              <div key={r.id} className="card">
                <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold', color: 'var(--primary)' }}>
                  Réponse #{responses.length - i} 
                  <span style={{ fontWeight: 'normal', fontSize: '0.85em', color: '#666', marginLeft: '0.5rem' }}>
                    ({new Date(r.submitted_at).toLocaleString()})
                  </span>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                  {questions.map(q => {
                    const answer = r.answers?.find(a => a.question_id === q.id)
                    return (
                      <li key={q.id} style={{ marginBottom: '0.25rem' }}>
                        <strong>{q.label} :</strong>{' '}
                        {answer ? (
                          <span style={{ backgroundColor: '#f4f4f4', padding: '0.1rem 0.3rem', borderRadius: '3px', border: '1px solid #ddd' }}>
                            {answer.value}
                          </span>
                        ) : (
                          <em style={{ color: '#999' }}>(vide)</em>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}