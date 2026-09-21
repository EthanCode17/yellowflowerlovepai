import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * Initializes the UnrealBloomPass composer for celestial golden glow
 */
export function setupPostProcessing(renderer, scene, camera, width, height) {
  const renderScene = new RenderPass(scene, camera);

  // Resolution vector for bloom
  const resolution = new THREE.Vector2(width, height);
  // Strength: 0.38, Radius: 0.3, Threshold: 0.62
  const bloomPass = new UnrealBloomPass(resolution, 0.38, 0.3, 0.62);

  const composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  return {
    composer,
    bloomPass,
    setSize: (w, h) => {
      composer.setSize(w, h);
      bloomPass.resolution.set(w, h);
    }
  };
}
