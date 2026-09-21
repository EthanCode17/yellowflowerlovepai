import React, { useState } from 'react';
import CosmicCanvas from './components/CosmicCanvas';
import UIOverlay from './components/UIOverlay';

export default function App() {
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'sun'
  const [isJourneyStarted, setIsJourneyStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSunDedication, setShowSunDedication] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  return (
    <main style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <CosmicCanvas
        viewMode={viewMode}
        setViewMode={setViewMode}
        isJourneyStarted={isJourneyStarted}
        setIsJourneyStarted={setIsJourneyStarted}
        onFlowerClick={() => {
          // Central sunflower heart clicked -> reveal dedication
          setShowSunDedication(true);
        }}
        onSelectPlanet={(planetData) => {
          setSelectedPlanet(planetData);
        }}
      />
      <UIOverlay
        viewMode={viewMode}
        setViewMode={setViewMode}
        isJourneyStarted={isJourneyStarted}
        setIsJourneyStarted={setIsJourneyStarted}
        showModal={showModal}
        setShowModal={setShowModal}
        showSunDedication={showSunDedication}
        setShowSunDedication={setShowSunDedication}
        selectedPlanet={selectedPlanet}
        setSelectedPlanet={setSelectedPlanet}
      />
    </main>
  );
}
