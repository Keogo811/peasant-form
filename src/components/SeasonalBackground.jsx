import { useMemo } from 'react'

const EMOJIS = {
  // Hiver : Moins de diversité, on garde le givre et les étoiles
  winter: ['❄️', '❄️', '✨'], 
  // Printemps : Inchanég
  spring: ['🌸', '🌺', '🌷', '🍀', '🦋'],
  // Automne : Inchanég
  autumn: ['🍂', '🍁', '🍄', '🌰'],
  // Été : Moins de diversité
  summer: ['🌻', '🍦', '☀️'] 
}

export default function SeasonalBackground({ season }) {
  // On génère 25 particules pour l'hiver et l'automne, et seulement 8 pour l'été
  const particleCount = season === 'summer' ? 8 : 25

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => {
      const emojis = EMOJIS[season] || ['✨']
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
      
      return {
        id: i,
        emoji: randomEmoji,
        left: Math.random() * 100 + 'vw',
        // Vitesses : Neige lente (15-25s), Feuilles moyennes (8-15s), Été rapide (6-10s)
        animationDuration: season === 'winter' 
          ? (Math.random() * 10 + 15) + 's' 
          : (Math.random() * 7 + 8) + 's',
        animationDelay: (Math.random() * -20) + 's',
        fontSize: (Math.random() * 1.5 + 0.8) + 'rem',
        opacity: Math.random() * 0.5 + 0.4
      }
    })
  }, [season, particleCount])

  if (!season || season === 'none') return null

  return (
    <>
      <div className="seasonal-bg">
        {/* PARTICULES */}
        {season === 'winter' && particles.map(p => (
          <div key={p.id} className="snowflake" style={{ 
            left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, fontSize: p.fontSize, opacity: p.opacity
          }}>{p.emoji}</div>
        ))}

        {season === 'spring' && particles.map(p => (
          <div key={p.id} className="floating-nature" style={{ 
            left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, fontSize: p.fontSize, opacity: p.opacity
          }}>{p.emoji}</div>
        ))}

        {season === 'autumn' && (
          <>
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={`rain-${i}`} className="rain" style={{ 
                left: Math.random() * 100 + 'vw', animationDuration: (Math.random() * 0.5 + 0.6) + 's', animationDelay: (Math.random() * -2) + 's' 
              }} />
            ))}
            {particles.slice(0, 15).map(p => (
              <div key={p.id} className="floating-nature" style={{ 
                left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, fontSize: p.fontSize, opacity: p.opacity
              }}>{p.emoji}</div>
            ))}
          </>
        )}

        {season === 'summer' && (
          <>
            <div className="sun" />
            {particles.map(p => (
              <div key={p.id} className="floating-nature" style={{ 
                left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, fontSize: p.fontSize, opacity: p.opacity
              }}>{p.emoji}</div>
            ))}
          </>
        )}
      </div>

      {/* EFFETS DE BORDS (Calque au-dessus) */}
      <div className={`edge-effect edge-${season}`} />
    </>
  )
}