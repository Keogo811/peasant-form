import { useState, useEffect, useRef } from 'react'
import { useI18n } from '../lib/i18n' // <-- Nouvel import

// Pistes par défaut (en ligne). Remplace-les plus tard par tes imports locaux.
const TRACKS = [
  { id: 'lofi', name: 'Lo-Fi Chill', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
  { id: 'synth', name: 'Synthwave', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3' }
]

export default function SettingsPanel({ season, setSeason }) {
  const { lang, changeLang, t } = useI18n() // <-- Récupération de la langue et de la fonction de traduction
  
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light')
  const [fontSize, setFontSize] = useState(localStorage.getItem('app-fontsize') || '16px')
  const [accent, setAccent] = useState(localStorage.getItem('app-accent') || '#ff6b6b')
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(TRACKS[0])
  const audioRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.fontSize = fontSize
    document.documentElement.style.setProperty('--primary', accent)
    
    localStorage.setItem('app-theme', theme)
    localStorage.setItem('app-fontsize', fontSize)
    localStorage.setItem('app-accent', accent)
  }, [theme, fontSize, accent])

  function togglePlay() {
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  function changeTrack(track) {
    setCurrentTrack(track)
    setIsPlaying(false)
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }, 100)
  }

  return (
    <>
      <audio ref={audioRef} src={currentTrack.url} loop />
      <button className="settings-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✖' : '⚙️'}
      </button>

      {isOpen && (
        <div className="settings-panel">
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text)' }}>{t('settings')}</h3>

          {/* SÉLECTEUR DE LANGUE */}
          <div className="settings-section" style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--text)' }}>Language / Langue</h4>
            <button className={`option-btn ${lang === 'fr' ? 'active' : ''}`} onClick={() => changeLang('fr')}>🇫🇷 FR</button>
            <button className={`option-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => changeLang('en')}>🇬🇧 EN</button>
          </div>

          <div className="settings-section">
            <h4 style={{ color: 'var(--text)' }}>{t('theme')}</h4>
            <button className={`option-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>{t('light')}</button>
            <button className={`option-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>{t('dark')}</button>
          </div>

          <div className="settings-section">
            <h4 style={{ color: 'var(--text)' }}>{t('text_size')}</h4>
            <button className={`option-btn ${fontSize === '14px' ? 'active' : ''}`} onClick={() => setFontSize('14px')}>{t('small')}</button>
            <button className={`option-btn ${fontSize === '16px' ? 'active' : ''}`} onClick={() => setFontSize('16px')}>{t('normal')}</button>
            <button className={`option-btn ${fontSize === '18px' ? 'active' : ''}`} onClick={() => setFontSize('18px')}>{t('large')}</button>
          </div>

          <div className="settings-section">
            <h4 style={{ color: 'var(--text)' }}>{t('accent_color')}</h4>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {['#ff6b6b', '#4ecdc4', '#a29bfe', '#ffe66d', '#1a1a1a'].map(c => (
                <div key={c} className="color-circle" style={{ backgroundColor: c, transform: accent === c ? 'scale(1.3)' : 'scale(1)', borderColor: 'var(--text)' }} onClick={() => setAccent(c)} />
              ))}
            </div>
          </div>

          {/* SAISONS */}
          <div className="settings-section" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--text)' }}>
            <h4 style={{ color: 'var(--text)' }}>{t('ambiance')}</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              <button className={`option-btn ${season === 'none' ? 'active' : ''}`} onClick={() => setSeason('none')}>{t('none')}</button>
              <button className={`option-btn ${season === 'winter' ? 'active' : ''}`} onClick={() => setSeason('winter')}>{t('winter')}</button>
              <button className={`option-btn ${season === 'spring' ? 'active' : ''}`} onClick={() => setSeason('spring')}>{t('spring')}</button>
              <button className={`option-btn ${season === 'summer' ? 'active' : ''}`} onClick={() => setSeason('summer')}>{t('summer')}</button>
              <button className={`option-btn ${season === 'autumn' ? 'active' : ''}`} onClick={() => setSeason('autumn')}>{t('autumn')}</button>
            </div>
          </div>

          <div className="settings-section" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--text)' }}>
            <h4 style={{ color: 'var(--text)' }}>{t('music')}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <button className="btn" onClick={togglePlay} style={{ padding: '0.5rem', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}>
                {isPlaying ? '⏸' : '▶️'}
              </button>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text)' }}>{currentTrack.name}</span>
            </div>
            <select className="input" style={{ padding: '0.25rem', fontSize: '0.85rem', marginBottom: 0 }} value={currentTrack.id} onChange={(e) => {
              const track = TRACKS.find(t => t.id === e.target.value)
              if (track) changeTrack(track)
            }}>
              {TRACKS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      )}
    </>
  )
}