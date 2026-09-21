import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { MilkyWayGalaxy } from './MilkyWayGalaxy';
import { SunflowerSun } from './SunflowerSun';
import { OrbitingSystems } from './OrbitingSystems';
import { CosmicBackground } from './CosmicBackground';
import { setupPostProcessing } from './PostProcessing';
import { soundManager } from '../utils/audio';

export default function CosmicCanvas({
  viewMode, // 'overview' | 'sun'
  setViewMode,
  isJourneyStarted,
  setIsJourneyStarted,
  onFlowerClick,
  onSelectPlanet
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const galaxyRef = useRef(null);
  const sunRef = useRef(null);
  const orbitingSystemsRef = useRef(null);
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  // Dynamic Camera Orbit Exploration state
  const isInteractingRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const hasMovedSignificantlyRef = useRef(false);

  // Orbit angles
  const orbitStateRef = useRef({
    radius: 360,
    targetRadius: 360,
    theta: 0,       // Azimuthal angle around Y
    targetTheta: 0,
    phi: 1.05,      // Polar angle from Y axis
    targetPhi: 1.05,
    velocityTheta: 0,
    velocityPhi: 0,
    isAnimatingZoom: false
  });

  const raycasterPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycasterRef = useRef(new THREE.Raycaster());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    const isMobile = width < 768;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020205, 0.0016);

    // 2. Camera
    const fov = isMobile ? 62 : 52;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 2000);
    cameraRef.current = camera;

    const initialRadius = isMobile ? 440 : 360;
    const initialPhi = 1.05;
    orbitStateRef.current.radius = initialRadius;
    orbitStateRef.current.targetRadius = initialRadius;
    orbitStateRef.current.phi = initialPhi;
    orbitStateRef.current.targetPhi = initialPhi;

    // Position camera using spherical coordinates
    camera.position.set(
      initialRadius * Math.sin(initialPhi) * Math.sin(0),
      initialRadius * Math.cos(initialPhi),
      initialRadius * Math.sin(initialPhi) * Math.cos(0)
    );
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: false,
      stencil: false,
      depth: true
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Post-processing (Bloom)
    const postProcessing = setupPostProcessing(renderer, scene, camera, width, height);
    composerRef.current = postProcessing;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5e0, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(30, 60, 40);
    scene.add(dirLight);

    // 6. Objects
    const background = new CosmicBackground(scene);
    const galaxy = new MilkyWayGalaxy(scene);
    galaxyRef.current = galaxy;

    const sun = new SunflowerSun(scene);
    sunRef.current = sun;

    const orbitingSystems = new OrbitingSystems(scene);
    orbitingSystemsRef.current = orbitingSystems;

    // 7. Interaction, Pointer & Raycasting
    const pointerNDC = new THREE.Vector2(-999, -999);
    const worldIntersection = new THREE.Vector3();

    const updatePointerWorldPos = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerNDC, camera);

      // In overview mode, intersect with horizontal plane (Y=0)
      if (raycasterRef.current.ray.intersectPlane(raycasterPlaneRef.current, worldIntersection)) {
        galaxy.setPointer(worldIntersection);
      }
    };

    // Event Handlers for Dynamic 3D Exploration & Orbiting
    const onPointerDown = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      isInteractingRef.current = true;
      hasMovedSignificantlyRef.current = false;
      pointerStartRef.current = { x: clientX, y: clientY };
      prevPointerRef.current = { x: clientX, y: clientY };

      orbitStateRef.current.velocityTheta = 0;
      orbitStateRef.current.velocityPhi = 0;

      updatePointerWorldPos(clientX, clientY);
    };

    const onPointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      updatePointerWorldPos(clientX, clientY);

      if (isInteractingRef.current && !orbitStateRef.current.isAnimatingZoom) {
        const deltaX = clientX - prevPointerRef.current.x;
        const deltaY = clientY - prevPointerRef.current.y;

        const totalDist = Math.hypot(
          clientX - pointerStartRef.current.x,
          clientY - pointerStartRef.current.y
        );
        if (totalDist > 6) {
          hasMovedSignificantlyRef.current = true;
        }

        // Dynamic 3D Universe Exploration rotation sensitivity
        const rotSensitivity = 0.0055;
        orbitStateRef.current.targetTheta -= deltaX * rotSensitivity;
        orbitStateRef.current.targetPhi -= deltaY * rotSensitivity;

        // Clamp phi to prevent flipping upside down
        orbitStateRef.current.targetPhi = Math.max(0.15, Math.min(Math.PI - 0.15, orbitStateRef.current.targetPhi));

        // Store velocities for inertia
        orbitStateRef.current.velocityTheta = -deltaX * rotSensitivity * 0.4;
        orbitStateRef.current.velocityPhi = -deltaY * rotSensitivity * 0.4;

        prevPointerRef.current = { x: clientX, y: clientY };
      }
    };

    const onPointerUp = (e) => {
      isInteractingRef.current = false;

      // Ignore if user tapped on an interactive UI element (button, modal, etc.)
      if (e.target && e.target.closest && e.target.closest('.interactive')) {
        return;
      }

      // CRITICAL: Only allow tapping planets or sun when ALREADY in 'sun' view mode and not currently animating zoom!
      if (viewModeRef.current !== 'sun' || orbitStateRef.current.isAnimatingZoom) {
        return;
      }

      // If it was a quick tap/click without dragging, test interactive objects
      if (!hasMovedSignificantlyRef.current) {
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        const rect = container.getBoundingClientRect();
        pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(pointerNDC, camera);

        // 1. Check if an orbiting planetary sunflower system was tapped!
        if (orbitingSystemsRef.current) {
          const hitPlanet = orbitingSystemsRef.current.checkIntersection(raycasterRef.current);
          if (hitPlanet) {
            soundManager.playChime(659.25, 0.22, 2.5);
            if (onSelectPlanet) onSelectPlanet(hitPlanet);
            return;
          }
        }

        // 2. Check if the center sunflower sun was tapped!
        const hitSun = (sunRef.current && sunRef.current.checkIntersection(raycasterRef.current)) || (Math.hypot(pointerNDC.x, pointerNDC.y) < 0.35);
        if (hitSun && sunRef.current) {
          sunRef.current.triggerPulse();
          soundManager.playChime(783.99, 0.25, 3.0);

          // Trigger flower center dedication display
          if (onFlowerClick) onFlowerClick();
        }
      }
    };

    const onPointerLeave = () => {
      isInteractingRef.current = false;
      galaxy.setPointer(null);
    };

    // Attach listeners
    const dom = container;
    dom.addEventListener('mousemove', onPointerMove, { passive: true });
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('mouseleave', onPointerLeave);

    dom.addEventListener('touchmove', onPointerMove, { passive: true });
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      const mobile = width < 768;

      camera.fov = mobile ? 62 : 52;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      postProcessing.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 9. Render Loop with Smooth Orbit Physics
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Dynamic Universe Exploration inertia update
      const orbit = orbitStateRef.current;
      if (!orbit.isAnimatingZoom) {
        if (!isInteractingRef.current) {
          // Slow natural celestial orbit rotation
          orbit.targetTheta += 0.0006;

          // Apply remaining velocity inertia
          orbit.targetTheta += orbit.velocityTheta;
          orbit.targetPhi += orbit.velocityPhi;
          orbit.velocityTheta *= 0.92;
          orbit.velocityPhi *= 0.92;
        }

        // Smooth spring interpolation
        orbit.theta += (orbit.targetTheta - orbit.theta) * 0.08;
        orbit.phi += (orbit.targetPhi - orbit.phi) * 0.08;
        orbit.radius += (orbit.targetRadius - orbit.radius) * 0.08;

        // Position camera spherically
        const sinPhi = Math.sin(orbit.phi);
        camera.position.x = orbit.radius * sinPhi * Math.sin(orbit.theta);
        camera.position.y = orbit.radius * Math.cos(orbit.phi);
        camera.position.z = orbit.radius * sinPhi * Math.cos(orbit.theta);
        camera.lookAt(0, 0, 0);
      }

      galaxy.update(delta);
      sun.update(delta);
      orbitingSystems.update(delta, camera);
      background.update();

      postProcessing.composer.render();
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousemove', onPointerMove);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('mouseleave', onPointerLeave);
      dom.removeEventListener('touchmove', onPointerMove);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchend', onPointerUp);

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // GSAP Cinematic Camera Zoom between Overview (Milky Way) and Sun (Sunflower Center)
  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    const isMobile = window.innerWidth < 768;
    const orbit = orbitStateRef.current;

    // When viewMode changes, smoothly interpolate radius and orientation
    gsap.killTweensOf(orbit);

    if (viewMode === 'sun') {
      const sunRadius = isMobile ? 220 : 170;
      const sunPhi = 1.28;

      orbit.isAnimatingZoom = true;
      soundManager.playChime(523.25, 0.15, 3.0);

      gsap.to(orbit, {
        targetRadius: sunRadius,
        radius: sunRadius,
        targetPhi: sunPhi,
        phi: sunPhi,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate: () => {
          const sinPhi = Math.sin(orbit.phi);
          camera.position.x = orbit.radius * sinPhi * Math.sin(orbit.theta);
          camera.position.y = orbit.radius * Math.cos(orbit.phi);
          camera.position.z = orbit.radius * sinPhi * Math.cos(orbit.theta);
          camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
          orbit.isAnimatingZoom = false;
          orbit.targetRadius = sunRadius;
          orbit.radius = sunRadius;
          orbit.targetPhi = sunPhi;
          orbit.phi = sunPhi;
          setIsJourneyStarted(true);
        }
      });
    } else {
      const overviewRadius = isMobile ? 440 : 360;
      const overviewPhi = 1.05;

      orbit.isAnimatingZoom = true;

      gsap.to(orbit, {
        targetRadius: overviewRadius,
        radius: overviewRadius,
        targetPhi: overviewPhi,
        phi: overviewPhi,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate: () => {
          const sinPhi = Math.sin(orbit.phi);
          camera.position.x = orbit.radius * sinPhi * Math.sin(orbit.theta);
          camera.position.y = orbit.radius * Math.cos(orbit.phi);
          camera.position.z = orbit.radius * sinPhi * Math.cos(orbit.theta);
          camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
          orbit.isAnimatingZoom = false;
          orbit.targetRadius = overviewRadius;
          orbit.radius = overviewRadius;
          orbit.targetPhi = overviewPhi;
          orbit.phi = overviewPhi;
        }
      });
    }
  }, [viewMode, setIsJourneyStarted]);

  return <div ref={containerRef} className="canvas-container" />;
}
