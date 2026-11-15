import { useEffect, useState } from 'react'
import { neon } from '../lib/neon'

export default function Dashboard({ formId, onBack }) {
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

  // --- CALCUL DES STATISTIQUES POUR LES GRAPHIQUES ---
  const chartQuestions = questions.filter(q => 
    ['single_choice', 'multiple_choice', 'rating', 'boolean'].includes(q.type)
  )

  const stats = chartQuestions.map(q => {
    let counts = {}
    
    // Initialiser les options à 0
    if (q.type === 'multiple_choice' || q.type === 'single_choice') {
      (q.options || []).forEach(opt => counts[opt] = 0)
    } else if (q.type === 'rating') {
      [1, 2, 3, 4, 5].forEach(n => counts[n] = 0)
    } else if (q.type === 'boolean') {
      counts['Oui'] = 0; counts['Non'] = 0
    }

    // Compter les réponses
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

    const max = Math.max(...Object.values(counts), 1) // Éviter la division par 0
    return { question: q, counts, max }
  })

  // Couleurs fun pour les barres
  const colors = ['#F0A500', '#12234A', '#28a745', '#dc3545', '#6f42c1', '#17a2b8']

  return (
    <div style={{ marginTop: '2rem', fontFamily: 'sans-serif' }}>
      <button onClick={onBack} style={{ marginBottom: '1rem', padding: '0.5rem', cursor: 'pointer' }}>
        ← Retour aux formulaires
      </button>
      
      <h2>Dashboard des résultats</h2>
      <p style={{ color: '#666' }}>{responses.length} réponse{responses.length > 1 ? 's' : ''} reçue{responses.length > 1 ? 's' : ''}</p>

      {responses.length === 0 && <p style={{ color: '#666' }}>Aucune réponse pour le moment. Partage le lien !</p>}

      {/* --- SECTION GRAPHIQUES --- */}
      {responses.length > 0 && chartQuestions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', margin: '2rem 0' }}>
          {stats.map(({ question, counts, max }) => (
            <div key={question.id} style={{ padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>{question.label}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(counts).map(([label, count], i) => {
                  const percentage = Math.round((count / max) * 100)
                  const color = colors[i % colors.length]
                  return (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{label}</span>
                        <span style={{ color: '#666' }}>{count} ({percentage}%)</span>
                      </div>
                      {/* La barre CSS pure */}
                      <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${percentage}%`, 
                          backgroundColor: color, 
                          height: '100%', 
                          borderRadius: '10px',
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
      <h3 style={{ marginTop: '2rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Détail des réponses</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {responses.map((r, i) => (
          <div key={r.id} style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e0e0e0' }}>
            <p style={{ margin: '0 0 0.75rem 0', fontWeight: 'bold', color: '#F0A500' }}>
              Réponse #{responses.length - i} 
              <span style={{ fontWeight: 'normal', fontSize: '0.85em', color: '#999', marginLeft: '0.5rem' }}>
                ({new Date(r.submitted_at).toLocaleString()})
              </span>
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              {questions.map(q => {
                const answer = r.answers?.find(a => a.question_id === q.id)
                return (
                  <li key={q.id}>
                    <strong>{q.label} :</strong> {answer ? answer.value : <em style={{ color: '#ccc' }}>(vide)</em>}
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