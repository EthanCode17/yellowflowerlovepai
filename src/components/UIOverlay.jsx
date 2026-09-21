import React, { useState } from 'react';
import { Volume2, VolumeX, Heart, Compass, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

export default function UIOverlay({
  viewMode,
  setViewMode,
  isJourneyStarted,
  setIsJourneyStarted,
  showModal,
  setShowModal,
  showSunDedication,
  setShowSunDedication,
  selectedPlanet,
  setSelectedPlanet
}) {
  const [isMuted, setIsMuted] = useState(true);

  const handleToggleSound = () => {
    const playing = soundManager.toggle();
    setIsMuted(!playing);
  };

  const handleStartJourney = (e) => {
    if (e) {
      e.stopPropagation();
      if (e.cancelable && e.preventDefault) e.preventDefault();
    }
    setIsJourneyStarted(true);
    setViewMode('sun');
    if (isMuted) {
      const playing = soundManager.toggle();
      setIsMuted(!playing);
    }
  };

  const handleOpenDedication = () => {
    setShowModal(true);
    soundManager.playChime(587.33, 0.2, 2.0);
    confetti({
      particleCount: 60,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#ffb703', '#fb8500', '#fff3b0']
    });
  };

  return (
    <div className="ui-overlay">
      {/* Top Section with Header & Controls */}
      <div className="top-section">
        <header className="header-glass interactive">
          <h1 className="header-title">Vía Láctea de Girasoles</h1>
          <p className="header-sub">
            Una flor amarilla es poco, así que te regalo una galaxia de girasoles, tu flor favorita, te amo
          </p>
        </header>

        {/* Controls (positioned below on mobile, top-right on desktop) */}
        <div className="top-controls interactive">
          {/* Toggle Audio */}
          <button
            className="btn-icon"
            onClick={handleToggleSound}
            title={isMuted ? 'Activar música espacial' : 'Silenciar'}
            aria-label="Música"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Change Camera Perspective */}
          <button
            className="btn-icon"
            onClick={() => setViewMode(viewMode === 'overview' ? 'sun' : 'overview')}
            title={viewMode === 'overview' ? 'Ir al Sol Girasol' : 'Ver Vía Láctea completa'}
            aria-label="Perspectiva"
          >
            {viewMode === 'overview' ? <Compass size={20} /> : <RotateCcw size={20} />}
          </button>
        </div>
      </div>

      {/* Center Prompt when in Galactic Overview */}
      {viewMode === 'overview' && !isJourneyStarted && (
        <div className="center-hint interactive">
          <button
            className="start-journey-btn"
            onClick={handleStartJourney}
            onTouchEnd={handleStartJourney}
          >
            <Heart size={20} fill="#ffd000" />
            <span>Tap &lt;3</span>
          </button>
        </div>
      )}

      {/* Bottom Floating Guide */}
      <footer className="bottom-bar">
        <div className="hints-capsule interactive">
          {viewMode === 'overview' ? (
            <div className="hint-item">
              <span className="hint-dot"></span>
              <span>Pasa el cursor o mantén presionado y desliza para explorar</span>
            </div>
          ) : (
            <>
              <div className="hint-item">
                <span className="hint-dot"></span>
                <span>Mantén presionado y arrastra para orbitar en 3D</span>
              </div>
              <div className="hint-item">
                <span className="hint-dot"></span>
                <span>Toca los girasoles orbitales o el sol central</span>
              </div>
            </>
          )}
        </div>
      </footer>

      {/* Main Love Dedication Modal */}
      {showModal && (
        <div className="modal-backdrop interactive" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <span className="modal-flower-icon">🌻</span>
            <h2 className="modal-title">Para Paola, Mi Amor Eterno</h2>
            <p className="modal-text">
              En este día no quería darte solo una flor... 
              <br /><br />
              Quería regalarte un universo entero donde cada estrella en la Vía Láctea es un girasol 
              brillando para ti, y en el centro, el sol más radiante que lleva grabado que eres el amor de mi vida.
              <br /><br />
              <strong>Gracias por iluminar mi mundo hoy y siempre. Te amo infinito.</strong>
            </p>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
              Guardar en mi corazón ✨
            </button>
          </div>
        </div>
      )}

      {/* Planetary Solar System Modal */}
      {selectedPlanet && (
        <div className="modal-backdrop interactive" onClick={() => setSelectedPlanet(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <span className="modal-flower-icon">{selectedPlanet.icon}</span>
            <h2 className="modal-title">{selectedPlanet.title}</h2>
            <p style={{ color: '#ffd000', fontSize: '0.9rem', marginBottom: '8px', letterSpacing: '1px' }}>
              {selectedPlanet.name}
            </p>
            <p className="modal-text">
              {selectedPlanet.message}
              <br /><br />
              <strong>✨ {selectedPlanet.prompt} ✨</strong>
            </p>
            <button className="modal-close-btn" onClick={() => setSelectedPlanet(null)}>
              Continuar explorando 🌻
            </button>
          </div>
        </div>
      )}

      {/* Sun Center Heart Dedication Modal */}
      {showSunDedication && (
        <div className="modal-backdrop interactive" onClick={() => setShowSunDedication(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <span className="modal-flower-icon">🌻</span>
            <p style={{ color: '#ffd000', fontFamily: 'var(--font-serif)', fontSize: '1.1rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Para Paola
            </p>
            <h2 className="modal-title" style={{ fontSize: '1.6rem', margin: '14px 0', lineHeight: '1.4', color: '#fff9d6' }}>
              "Mi amor por ti es más grande que el universo, te dedico este giraSOL"
            </h2>
            <p className="modal-text" style={{ fontSize: '1.05rem', color: '#ffeaa7' }}>
              Eres el sol que le da calor y sentido a todo mi mundo. Hoy y siempre, mi corazón late solo por ti.
            </p>
            <button className="modal-close-btn" onClick={() => setShowSunDedication(false)}>
              Te amo infinito 💛
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
