import { useEffect, useState } from 'react'
import { neon } from '../lib/neon'

// --- LISTE DES MOTS VIDES (STOP WORDS FRANÇAIS) ---
const STOP_WORDS = new Set([
  'le', 'la', 'les', 'de', 'des', 'un', 'une', 'et', 'en', 'du', 'au', 'aux', 'ce', 'ces', 'cet', 'cette',
  'dans', 'pour', 'par', 'sur', 'avec', 'pas', 'plus', 'ne', 'se', 'sa', 'son', 'ses', 'je', 'tu', 'il',
  'elle', 'nous', 'vous', 'ils', 'elles', 'que', 'qui', 'quoi', 'dont', 'ou', 'où', 'mais', 'donc', 'or',
  'ni', 'car', 'est', 'sont', 'a', 'ont', 'as', 'ai', 'été', 'être', 'avoir', 'fait', 'faire', 'tout',
  'tous', 'toute', 'toutes', 'bien', 'très', 'aussi', 'comme', 'si', 'y', 'à', 'd', 'l', 'j', 't',
  's', 'c', 'n', 'm', 'qu', 'mon', 'ton', 'votre', 'notre', 'leur', 'leurs'
])

// --- COMPOSANTS GRAPHIQUES ---
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
            <circle key={i} cx="60" cy="60" r={radius} fill="transparent" stroke={item.color} strokeWidth="20" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dasharray 1s ease' }} />
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
              <div style={{ width: `${percentage}%`, backgroundColor: item.color, height: '100%', borderRadius: '6px', transition: 'width 1s ease-in-out' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// --- FONCTIONS UTILITAIRES ---
function downloadFile(content, fileName, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

function calculateAdvancedStats(values) {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const count = values.length
  const mean = values.reduce((a, b) => a + b, 0) / count
  const mid = Math.floor(count / 2)
  const median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  const freqMap = {}
  let maxFreq = 0
  let mode = values[0]
  values.forEach(v => {
    freqMap[v] = (freqMap[v] || 0) + 1
    if (freqMap[v] > maxFreq) { maxFreq = freqMap[v]; mode = v }
  })
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count
  const stdDev = Math.sqrt(variance)
  return { mean: mean.toFixed(2), median: median.toFixed(1), mode: mode, stdDev: stdDev.toFixed(2) }
}

// --- NOUVEAU : GÉNÉRATEUR DE NUAGE DE MOTS ---
function generateWordCloud(responses, questions) {
  const textQuestions = questions.filter(q => q.type === 'short_text' || q.type === 'long_text')
  if (textQuestions.length === 0) return []

  const wordCounts = {}
  responses.forEach(r => {
    textQuestions.forEach(q => {
      const ans = r.answers?.find(a => a.question_id === q.id)
      if (ans && ans.value) {
        // Nettoyage : minuscules, suppression de la ponctuation, séparation par espace
        const tokens = ans.value.toLowerCase()
          .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 2 && !STOP_WORDS.has(w))
        
        tokens.forEach(w => {
          wordCounts[w] = (wordCounts[w] || 0) + 1
        })
      }
    })
  })

  // Trier par fréquence décroissante et garder le top 30
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([text, value]) => ({ text, value }))
}

export default function Dashboard({ formId, onBack, isPublic = false }) {
  const [responses, setResponses] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRaw, setShowRaw] = useState(false)

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

  function handleExportCSV() {
    const headers = ['Date de soumission', ...questions.map(q => `"${q.label.replace(/"/g, '""')}"`)]
    const rows = responses.map(r => {
      const date = new Date(r.submitted_at).toLocaleString()
      const answers = questions.map(q => {
        const ans = r.answers?.find(a => a.question_id === q.id)
        return ans && ans.value ? `"${ans.value.replace(/"/g, '""')}"` : '""'
      })
      return [date, ...answers].join(';')
    })
    const csvContent = [headers.join(';'), ...rows].join('\n')
    downloadFile('\uFEFF' + csvContent, `export_formulaire_${formId}.csv`, 'text/csv;charset=utf-8;')
  }

  function handleExportJSON() {
    const cleanData = responses.map(r => {
      const obj = { date: r.submitted_at }
      questions.forEach(q => {
        const ans = r.answers?.find(a => a.question_id === q.id)
        obj[q.label] = ans ? ans.value : null
      })
      return obj
    })
    downloadFile(JSON.stringify(cleanData, null, 2), `export_formulaire_${formId}.json`, 'application/json')
  }

  if (loading) return <p>Chargement des résultats…</p>

  // --- CALCULS ---
  const timelineData = {}
  responses.forEach(r => {
    const dateStr = new Date(r.submitted_at).toISOString().split('T')[0]
    timelineData[dateStr] = (timelineData[dateStr] || 0) + 1
  })
  const sortedDates = Object.keys(timelineData).sort()
  const maxResponsesInADay = Math.max(...Object.values(timelineData), 1)

  const chartQuestions = questions.filter(q => ['single_choice', 'multiple_choice', 'rating', 'boolean'].includes(q.type))
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a29bfe', '#fd79a8', '#00b894', '#0984e3']

  let globalAverageScore = null
  const ratingQuestions = questions.filter(q => q.type === 'rating')
  if (ratingQuestions.length > 0 && responses.length > 0) {
    let totalScore = 0; let totalVotes = 0
    ratingQuestions.forEach(q => {
      responses.forEach(r => {
        const ans = r.answers?.find(a => a.question_id === q.id)
        if (ans && ans.value) {
          const val = parseInt(ans.value)
          if (!isNaN(val)) { totalScore += val; totalVotes++ }
        }
      })
    })
    if (totalVotes > 0) globalAverageScore = (totalScore / totalVotes).toFixed(1)
  }

  const stats = chartQuestions.map(q => {
    let counts = {}
    let rawValues = [] 
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
          if (counts[ans.value] !== undefined) {
            counts[ans.value]++
            if (q.type === 'rating') rawValues.push(parseInt(ans.value))
          }
        }
      }
    })

    const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0)
    const dataArray = Object.entries(counts).map(([label, count], i) => ({ label, count, color: colors[i % colors.length] }))
    const advancedStats = q.type === 'rating' ? calculateAdvancedStats(rawValues) : null
    return { question: q, dataArray, totalVotes, advancedStats }
  })

  // Calcul du nuage de mots
  const wordCloudData = generateWordCloud(responses, questions)
  const maxWordValue = wordCloudData.length > 0 ? wordCloudData[0].value : 1

  return (
    <div>
      {!isPublic && (
        <button className="btn" onClick={onBack} style={{ marginBottom: '2rem' }}>← Retour aux formulaires</button>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: 'var(--text)' }}>Tableau de bord</h2>
          <p style={{ color: 'var(--text)', opacity: 0.7, margin: 0 }}>Analyse des performances de ton formulaire.</p>
        </div>
        {responses.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={handleExportCSV} style={{ backgroundColor: '#28a745', color: 'white', borderColor: '#1a1a1a' }}>📥 Export CSV</button>
            <button className="btn" onClick={handleExportJSON} style={{ backgroundColor: '#17a2b8', color: 'white', borderColor: '#1a1a1a' }}>📦 Export JSON</button>
          </div>
        )}
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center', borderTop: '8px solid var(--primary)' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase' }}>Total Réponses</p>
          <h2 style={{ fontSize: '3rem', margin: '0.5rem 0 0 0', color: 'var(--text)' }}>{responses.length}</h2>
        </div>
        {globalAverageScore && (
          <div className="card" style={{ textAlign: 'center', borderTop: '8px solid #feca57' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase' }}>Moyenne globale</p>
            <h2 style={{ fontSize: '3rem', margin: '0.5rem 0 0 0', color: 'var(--text)' }}>{globalAverageScore} <span style={{ fontSize: '1.5rem', color: '#feca57' }}>★</span></h2>
          </div>
        )}
        <div className="card" style={{ textAlign: 'center', borderTop: '8px solid #4ecdc4' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase' }}>Questions</p>
          <h2 style={{ fontSize: '3rem', margin: '0.5rem 0 0 0', color: 'var(--text)' }}>{questions.length}</h2>
        </div>
      </div>

      {/* TIMELINE */}
      {responses.length > 0 && sortedDates.length > 0 && (
        <div className="card" style={{ marginBottom: '3rem', padding: '1.5rem' }}>
          <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: 'var(--text)' }}>Volume de réponses dans le temps</h4>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '150px', overflowX: 'auto', paddingBottom: '1rem', borderBottom: '2px solid var(--text)' }}>
            {sortedDates.map(date => {
              const count = timelineData[date]
              const heightPercent = (count / maxResponsesInADay) * 100
              const displayDate = new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
              return (
                <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--text)' }}>{count}</span>
                  <div style={{ width: '30px', height: `${Math.max(heightPercent, 5)}%`, backgroundColor: 'var(--primary)', border: '2px solid var(--text)', borderRadius: '4px 4px 0 0', transition: 'height 1s ease-in-out' }} title={`${count} réponse(s)`} />
                  <span style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: 'var(--text)', opacity: 0.7, whiteSpace: 'nowrap' }}>{displayDate}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* NUAGE DE MOTS */}
      {responses.length > 0 && wordCloudData.length > 0 && (
        <div className="card" style={{ marginBottom: '3rem', padding: '2rem', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: 'var(--text)' }}>Nuage de mots (Questions textuelles)</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
            {wordCloudData.map((word, i) => {
              // La taille varie de 1rem à 3.5rem selon la fréquence
              const fontSize = 1 + (word.value / maxWordValue) * 2.5
              const color = colors[i % colors.length]
              return (
                <span 
                  key={word.text} 
                  title={`Apparaît ${word.value} fois`}
                  style={{ 
                    fontSize: `${fontSize}rem`, 
                    fontWeight: '900', 
                    color: color,
                    textShadow: '1px 1px 0px var(--text)',
                    lineHeight: '1',
                    transition: 'transform 0.2s',
                    cursor: 'default'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  {word.text}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {responses.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontSize: '1.2rem', margin: 0 }}>Aucune donnée pour le moment.</p>
          {!isPublic && <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>Partage le lien de ton formulaire pour voir les graphiques apparaître !</p>}
        </div>
      )}

      {/* GRILLE DES GRAPHIQUES */}
      {responses.length > 0 && chartQuestions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {stats.map(({ question, dataArray, totalVotes, advancedStats }) => (
            <div key={question.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', lineHeight: '1.3', color: 'var(--text)' }}>{question.label}</h4>
              <div style={{ marginTop: 'auto' }}>
                {(question.type === 'single_choice' || question.type === 'boolean') && totalVotes > 0 ? (
                  <DonutChart data={dataArray.filter(d => d.count > 0)} total={totalVotes} />
                ) : (
                  <BarChart data={dataArray} total={totalVotes} />
                )}
              </div>
              {advancedStats && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--text)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7, fontWeight: 'bold' }}>Médiane</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text)' }}>{advancedStats.median}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7, fontWeight: 'bold' }}>Mode</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text)' }}>{advancedStats.mode}</div>
                  </div>
                  <div title="Un écart-type élevé signifie que les avis sont très divisés.">
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7, fontWeight: 'bold' }}>Écart-type</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text)' }}>±{advancedStats.stdDev}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* RÉPONSES BRUTES MASQUÉES */}
      {responses.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <button className="btn" onClick={() => setShowRaw(!showRaw)} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
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
                            <span style={{ backgroundColor: 'var(--bg)', padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid var(--text)' }}>{answer.value}</span>
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