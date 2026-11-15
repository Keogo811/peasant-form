import { useState, useEffect } from 'react'

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light')
  const [fontSize, setFontSize] = useState(localStorage.getItem('app-fontsize') || '16px')
  const [accent, setAccent] = useState(localStorage.getItem('app-accent') || '#ff6b6b')

  // Appliquer les changements dès qu'ils bougent
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.fontSize = fontSize
    document.documentElement.style.setProperty('--primary', accent)
    
    localStorage.setItem('app-theme', theme)
    localStorage.setItem('app-fontsize', fontSize)
    localStorage.setItem('app-accent', accent)
  }, [theme, fontSize, accent])

  return (
    <>
      <button className="settings-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✖' : '⚙️'}
      </button>

      {isOpen && (
        <div className="settings-panel">
          <h3 style={{ margin: '0 0 1rem 0' }}>Paramètres</h3>

          <div className="settings-section">
            <h4>Thème</h4>
            <button className={`option-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>☀️ Clair</button>
            <button className={`option-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>🌙 Sombre</button>
          </div>

          <div className="settings-section">
            <h4>Taille du texte</h4>
            <button className={`option-btn ${fontSize === '14px' ? 'active' : ''}`} onClick={() => setFontSize('14px')}>Petit</button>
            <button className={`option-btn ${fontSize === '16px' ? 'active' : ''}`} onClick={() => setFontSize('16px')}>Normal</button>
            <button className={`option-btn ${fontSize === '18px' ? 'active' : ''}`} onClick={() => setFontSize('18px')}>Grand</button>
          </div>

          <div className="settings-section">
            <h4>Couleur d'accent</h4>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {['#ff6b6b', '#4ecdc4', '#a29bfe', '#ffe66d', '#1a1a1a'].map(c => (
                <div 
                  key={c}
                  className="color-circle" 
                  style={{ backgroundColor: c, transform: accent === c ? 'scale(1.3)' : 'scale(1)' }}
                  onClick={() => setAccent(c)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}