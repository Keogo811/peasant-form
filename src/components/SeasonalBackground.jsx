import { useMemo } from 'react'

const EMOJIS = {
  winter: ['❄️', '❄️', '✨'], 
  spring: ['🌸', '🌷', '🍀'], // Moins de diversité
  autumn: ['🍂', '🍁', '🍄', '🌰'],
  summer: ['🌻', '☀️', '☀️'] 
}

export default function SeasonalBackground({ season }) {
  // Réduction du nombre de particules : 12 pour le printemps, 8 pour l'été, 25 pour les autres
  const particleCount = season === 'spring' ? 12 : (season === 'summer' ? 8 : 25)

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => {
      const emojis = EMOJIS[season] || ['✨']
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
      
      return {
        id: i,
        emoji: randomEmoji,
        left: Math.random() * 100 + 'vw',
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
        {season === 'winter' && particles.map(p => (
          <div key={p.id} className="snowflake" style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, fontSize: p.fontSize, opacity: p.opacity }}>{p.emoji}</div>
        ))}

        {season === 'spring' && particles.map(p => (
          <div key={p.id} className="floating-nature" style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, fontSize: p.fontSize, opacity: p.opacity }}>{p.emoji}</div>
        ))}

        {season === 'autumn' && (
          <>
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={`rain-${i}`} className="rain" style={{ left: Math.random() * 100 + 'vw', animationDuration: (Math.random() * 0.5 + 0.6) + 's', animationDelay: (Math.random() * -2) + 's' }} />
            ))}
            {particles.slice(0, 15).map(p => (
              <div key={p.id} className="floating-nature" style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, fontSize: p.fontSize, opacity: p.opacity }}>{p.emoji}</div>
            ))}
          </>
        )}

        {season === 'summer' && (
          <>
            <div className="sun" />
            {particles.map(p => (
              <div key={p.id} className="floating-nature" style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, fontSize: p.fontSize, opacity: p.opacity }}>{p.emoji}</div>
            ))}
          </>
        )}
      </div>

      <div className={`edge-effect edge-${season}`} />
    </>
  )
}