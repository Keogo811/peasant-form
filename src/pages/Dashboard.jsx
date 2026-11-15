import { useEffect, useState } from 'react'
import { neon } from '../lib/neon'

// --- COMPOSANT : GRAPHIQUE EN DONUT (SVG PUR) ---
function DonutChart({ data, total }) {
  let accumulatedPercent = 0
  const radius = 50
  const circumference = 2 * Math.PI * radius

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={radius} fill="transparent" stroke="var(--bg)" strokeWidth="20" />
        {data.map((item, i) => {
          if (item.count === 0) return null
          const percent = item.count / total
          const strokeDasharray = `${percent * circumference} ${circumference}`
          const strokeDashoffset = -accumulatedPercent * circumference
          accumulatedPercent += percent
          return (
            <circle
              key={i}
              cx="60" cy="60" r={radius} fill="transparent"
              stroke={item.color} strokeWidth="20"
              strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          )
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color }} />
            <span style={{ flex: 1, fontWeight: 'bold' }}>{item.label}</span>
            <span style={{ color: 'var(--text)', opacity: 0.7 }}>{item.count} ({Math.round((item.count / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- COMPOSANT : BARRE DE PROGRESSION ---
function BarChart({ data, total }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {data.map((item, i) => {
        const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', marginBottom: '0.25rem', fontWeight: 'bold' }}>
              <span>{item.label}</span>
              <span>{item.count} ({percentage}%)</span>
            </div>
            <div style={{ width: '100%', backgroundColor: 'var(--bg)', border: '1px solid var(--text)', borderRadius: '8px', height: '16px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${percentage}%`, 
                backgroundColor: item.color, 
                height: '100%', 
                borderRadius: '6px',
                transition: 'width 1s ease-in-out' 
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard({ formId, onBack, isPublic = false }) {
  const [responses, setResponses] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRaw, setShowRaw] = useState(false) // État pour afficher/masquer le détail

  useEffect(() => {
    async function load() {
      const { data: qData } = await neon.from('questions').select('*').eq('form_id', formId).order('position')
      setQuestions(qData || [])
      const { data: rData } = await neon.from('responses').select('*, answers(*)').eq('form_id', formId).order('submitted_at', { ascending: false })
      setResponses(rData || [])
      setLoading(false)
    }
    load()
  }, [formId])

  if (loading) return <p>Chargement des résultats…</p>

  // --- ANALYSE DES DONNÉES ---
  const chartQuestions = questions.filter(q => ['single_choice', 'multiple_choice', 'rating', 'boolean'].includes(q.type))
  const ratingQuestions = questions.filter(q => q.type === 'rating')
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a29bfe', '#fd79a8', '#00b894', '#0984e3']

  // Calcul de la moyenne globale des notes (si des questions notes existent)
  let averageScore = null
  if (ratingQuestions.length > 0 && responses.length > 0) {
    let totalScore = 0
    let totalVotes = 0
    ratingQuestions.forEach(q => {
      responses.forEach(r => {
        const ans = r.answers?.find(a => a.question_id === q.id)
        if (ans && ans.value) {
          const val = parseInt(ans.value)
          if (!isNaN(val)) { totalScore += val; totalVotes++ }
        }
      })
    })
    if (totalVotes > 0) averageScore = (totalScore / totalVotes).toFixed(1)
  }

  // Préparation des données pour les graphiques
  const stats = chartQuestions.map(q => {
    let counts = {}
    if (q.type === 'multiple_choice' || q.type === 'single_choice') {
      (q.options || []).forEach(opt => counts[opt] = 0)
    } else if (q.type === 'rating') {
      [1, 2, 3, 4, 5].forEach(n => counts[n] = 0)
    } else if (q.type === 'boolean') {
      counts['Oui'] = 0; counts['Non'] = 0
    }

    responses.forEach(r => {
      const ans = r.answers?.find(a => a.question_id === q.id)
      if (ans && ans.value) {
        if (q.type === 'multiple_choice') {
          ans.value.split(', ').forEach(val => { if (counts[val] !== undefined) counts[val]++ })
        } else {
          if (counts[ans.value] !== undefined) counts[ans.value]++
        }
      }
    })

    const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0)
    const dataArray = Object.entries(counts).map(([label, count], i) => ({
      label, count, color: colors[i % colors.length]
    }))

    return { question: q, dataArray, totalVotes }
  })

  return (
    <div>
      {!isPublic && (
        <button className="btn" onClick={onBack} style={{ marginBottom: '2rem' }}>← Retour aux formulaires</button>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: 'var(--text)' }}>Tableau de bord</h2>
          <p style={{ color: 'var(--text)', opacity: 0.7, margin: 0 }}>Analyse des performances de ton formulaire.</p>
        </div>
      </div>

      {/* --- CARTES KPI (INDICATEURS CLÉS) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ textAlign: 'center', borderTop: '8px solid var(--primary)' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase' }}>Total Réponses</p>
          <h2 style={{ fontSize: '3rem', margin: '0.5rem 0 0 0', color: 'var(--text)' }}>{responses.length}</h2>
        </div>
        
        {averageScore && (
          <div className="card" style={{ textAlign: 'center', borderTop: '8px solid #feca57' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase' }}>Moyenne des notes</p>
            <h2 style={{ fontSize: '3rem', margin: '0.5rem 0 0 0', color: 'var(--text)' }}>
              {averageScore} <span style={{ fontSize: '1.5rem', color: '#feca57' }}>★</span>
            </h2>
          </div>
        )}

        <div className="card" style={{ textAlign: 'center', borderTop: '8px solid #4ecdc4' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase' }}>Questions</p>
          <h2 style={{ fontSize: '3rem', margin: '0.5rem 0 0 0', color: 'var(--text)' }}>{questions.length}</h2>
        </div>
      </div>

      {responses.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontSize: '1.2rem', margin: 0 }}>Aucune donnée pour le moment.</p>
          {!isPublic && <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>Partage le lien de ton formulaire pour voir les graphiques apparaître !</p>}
        </div>
      )}

      {/* --- SECTION GRAPHIQUES --- */}
      {responses.length > 0 && chartQuestions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {stats.map(({ question, dataArray, totalVotes }) => (
            <div key={question.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', lineHeight: '1.3', color: 'var(--text)' }}>
                {question.label}
              </h4>
              
              <div style={{ marginTop: 'auto' }}>
                {/* Si c'est un choix unique ou un Oui/Non, on affiche un Donut. Sinon des barres. */}
                {(question.type === 'single_choice' || question.type === 'boolean') && totalVotes > 0 ? (
                  <DonutChart data={dataArray.filter(d => d.count > 0)} total={totalVotes} />
                ) : (
                  <BarChart data={dataArray} total={totalVotes} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- SECTION RÉPONSES BRUTES (MASQUÉE PAR DÉFAUT) --- */}
      {responses.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <button 
            className="btn" 
            onClick={() => setShowRaw(!showRaw)} 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            {showRaw ? '▲ Masquer le détail des réponses' : '▼ Afficher le détail des réponses brutes'}
          </button>

          {showRaw && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {responses.map((r, i) => (
                <div key={r.id} className="card" style={{ padding: '1.5rem' }}>
                  <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold', color: 'var(--primary)' }}>
                    Réponse #{responses.length - i} 
                    <span style={{ fontWeight: 'normal', fontSize: '0.85em', color: 'var(--text)', opacity: 0.6, marginLeft: '0.5rem' }}>
                      ({new Date(r.submitted_at).toLocaleString()})
                    </span>
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6', color: 'var(--text)' }}>
                    {questions.map(q => {
                      const answer = r.answers?.find(a => a.question_id === q.id)
                      return (
                        <li key={q.id} style={{ marginBottom: '0.5rem' }}>
                          <strong>{q.label} :</strong>{' '}
                          {answer ? (
                            <span style={{ backgroundColor: 'var(--bg)', padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid var(--text)' }}>
                              {answer.value}
                            </span>
                          ) : (
                            <em style={{ opacity: 0.5 }}>(vide)</em>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}