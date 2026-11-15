import { useState } from 'react'
import SignIn from './SignIn'
import SignUp from './SignUp'

export default function AuthPage({ onSuccess }) {
  const [view, setView] = useState('signin')

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      
      {/* --- ARRIÈRE-PLAN : LUMIÈRES FLOUES --- */}
      <div className="bg-light" style={{ width: '400px', height: '400px', background: '#ff6b6b', top: '10%', left: '-5%', animationDelay: '0s' }}></div>
      <div className="bg-light" style={{ width: '500px', height: '500px', background: '#4ecdc4', bottom: '-10%', right: '-5%', animationDelay: '-3s' }}></div>
      <div className="bg-light" style={{ width: '350px', height: '350px', background: '#ffe66d', top: '30%', left: '50%', animationDelay: '-7s' }}></div>
      <div className="bg-light" style={{ width: '450px', height: '450px', background: '#a29bfe', bottom: '10%', left: '20%', animationDelay: '-11s' }}></div>
      <div className="bg-light" style={{ width: '300px', height: '300px', background: '#fd79a8', top: '60%', right: '20%', animationDelay: '-5s' }}></div>

      {/* --- ARRIÈRE-PLAN : EMOJIS FLOTTANTS --- */}
      <div className="floating-emoji" style={{ fontSize: '7rem', left: '2%', top: '10%', animationDelay: '0s' }}>🚀</div>
      <div className="floating-emoji" style={{ fontSize: '2rem', left: '15%', top: '25%', animationDelay: '-1s' }}>🎨</div>
      <div className="floating-emoji" style={{ fontSize: '4.5rem', left: '25%', bottom: '15%', animationDelay: '-2s' }}>👾</div>
      <div className="floating-emoji" style={{ fontSize: '3rem', left: '5%', top: '55%', animationDelay: '-3s' }}>🕹️</div>
      <div className="floating-emoji" style={{ fontSize: '6rem', left: '8%', bottom: '-2%', animationDelay: '-4s' }}>🍕</div>
      <div className="floating-emoji" style={{ fontSize: '2.5rem', left: '30%', top: '45%', animationDelay: '-5s' }}>💡</div>
      <div className="floating-emoji" style={{ fontSize: '5.5rem', right: '3%', top: '15%', animationDelay: '-1s' }}>✨</div>
      <div className="floating-emoji" style={{ fontSize: '2rem', right: '20%', top: '30%', animationDelay: '-2s' }}>🍩</div>
      <div className="floating-emoji" style={{ fontSize: '7rem', right: '-2%', bottom: '10%', animationDelay: '-3s' }}>🪩</div>
      <div className="floating-emoji" style={{ fontSize: '3.5rem', right: '15%', top: '65%', animationDelay: '-4s' }}>🦄</div>
      <div className="floating-emoji" style={{ fontSize: '2.5rem', right: '8%', top: '45%', animationDelay: '-5s' }}>🔥</div>
      <div className="floating-emoji" style={{ fontSize: '4rem', right: '25%', bottom: '0%', animationDelay: '-6s' }}>🎸</div>

      {/* --- CONTENU PRINCIPAL --- */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 450, margin: '0 auto', padding: '4rem 1rem' }}>
        
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '4rem', 
          fontWeight: '900', 
          lineHeight: '1', 
          color: 'var(--card-bg)', 
          WebkitTextStroke: '3px var(--text)', 
          textShadow: '6px 6px 0px var(--primary), 8px 8px 0px var(--text)',
          marginBottom: '1.5rem',
          letterSpacing: '-2px'
        }}>
          Peasant Form
        </h1>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text)' }}>
          Marre de Google Forms ? Reprends le contrôle. 🤘
          <br/>
          <span style={{ fontSize: '1rem', fontWeight: 'normal', display: 'block', marginTop: '0.5rem' }}>
            Crée des formulaires stylés, partage-les, et analyse les résultats. C'est fun, c'est gratuit, et ça t'appartient. 🚀
          </span>
        </div>

        <div className="card">
          <div style={{ 
            marginBottom: '2rem', 
            fontSize: '0.9rem', 
            color: 'var(--text)', 
            backgroundColor: 'var(--accent)', 
            padding: '1rem', 
            borderRadius: '4px', 
            border: 'var(--border)',
            boxShadow: '2px 2px 0px var(--text)'
          }}>
            💡 <strong>Pourquoi se connecter ?</strong>
            <br/>
            Ton compte te permet de garder tes formulaires privés et de voir qui a répondu. Les gens qui répondent à tes liens n'ont pas besoin de compte !
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
            <button className={`btn ${view === 'signin' ? 'btn-primary' : ''}`} style={{ flex: 1 }} onClick={() => setView('signin')}>Connexion</button>
            <button className={`btn ${view === 'signup' ? 'btn-primary' : ''}`} style={{ flex: 1 }} onClick={() => setView('signup')}>Inscription</button>
          </div>

          <div>
            {view === 'signin' ? <SignIn onSuccess={onSuccess} /> : <SignUp />}
          </div>
        </div>
      </div>

      <div className="footer-credit">
        Made by Keogo · <a href="#" onClick={(e) => e.preventDefault()}>Mon lien</a>
      </div>

    </div>
  )
}