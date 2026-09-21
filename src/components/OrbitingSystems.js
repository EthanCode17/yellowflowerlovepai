import * as THREE from 'three';
import { createSunflowerParticleTexture, createStarDustTexture, createPetalTexture } from '../utils/textures';

export const PLANETARY_SYSTEMS_DATA = [
  {
    id: 1,
    name: 'El Comienzo',
    shortTitle: 'Nuestra Historia',
    icon: '✨',
    radius: 46,
    speed: 0.24,
    inclination: 0.08,
    size: 2.8,
    color: '#ffe066',
    title: 'El Día que Llegaste a mi Vida',
    message: '¿Recuerdas cómo empezó todo? vacilando un melon con vino, nos besamos y no nos separamos nunca mas, desde ese dia supe que lo nuestro era para siempre',
    prompt: 'Tú eres mi principio favorito'
  },
  {
    id: 2,
    name: 'Tu Belleza Única',
    shortTitle: 'Lo Que Amo de Ti',
    icon: '💛',
    radius: 74,
    speed: 0.19,
    inclination: -0.12,
    size: 3.2,
    color: '#ffd000',
    title: 'Todo Lo Que Amo de Ti',
    message: 'Amo tu risa cuando te hace cosquillas el alma, amo tu forma de mirar el mundo con tanta ternura, tu inteligencia, tu bondad y la paz que me das con solo un abrazo. No hay nada en este universo más hermoso que tu corazón.',
    prompt: 'Eres perfecta ante mis ojos'
  },
  {
    id: 3,
    name: 'Galaxia de Recuerdos',
    shortTitle: 'Nuestros Recuerdos',
    icon: '🌻',
    radius: 108,
    speed: 0.15,
    inclination: 0.15,
    size: 3.0,
    color: '#ffb703',
    title: 'Nuestros Momentos Inolvidables',
    message: 'Cada salida, cada charla de madrugada, cada viaje juntos y cada tarde compartida son tesoros que guardo como reliquias. Si tuviera que revivir mi vida una y mil veces, elegiría encontrarte en cada una de ellas sin dudarlo.',
    prompt: 'Cada segundo a tu lado vale oro'
  },
  {
    id: 4,
    name: 'Amor Incondicional',
    shortTitle: 'Mis Promesas Para Ti',
    icon: '💌',
    radius: 148,
    speed: 0.12,
    inclination: -0.09,
    size: 3.2,
    color: '#fb8500',
    title: 'Mis Promesas Hacia Ti',
    message: 'Prometo cuidarte en tus días difíciles, celebrar cada uno de tus triunfos, escucharte siempre con paciencia, hacerte reír cuando lo necesites y entregarte todo mi amor sincero, leal y paciente hoy, mañana y siempre.',
    prompt: 'Siempre estaré aquí para ti'
  },
  {
    id: 5,
    name: 'Te dedico un poema',
    shortTitle: 'Nuestro Futuro',
    icon: '🪐',
    radius: 194,
    speed: 0.09,
    inclination: 0.18,
    size: 3.6,
    color: '#fff3b0',
    title: 'El Futuro Que Soñamos',
    message: 'Te amo como nunca pensé amar a alguien, eres mi todo, mi razón de ser, mi confidente, mi mejor amiga y el amor de mi vida. Eres mi presente y la persona con la que quiero caminar toda la vida. Te amo mi Sweetepai.',
    prompt: 'Por una eternidad a tu lado'
  }
];

export class OrbitingSystems {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.planets = [];
    this.hitObjects = []; // Meshes for raycaster
    this.time = 0;

    this.init();
  }

  init() {
    const sunflowerTex = createSunflowerParticleTexture();
    const stardustTex = createStarDustTexture();
    const petalTex = createPetalTexture();

    PLANETARY_SYSTEMS_DATA.forEach((data, index) => {
      const planetGroup = new THREE.Group();
      this.group.add(planetGroup);

      // 1. Orbital Ring Path
      const ringSegments = 64;
      const ringGeo = new THREE.RingGeometry(data.radius - 0.08, data.radius + 0.08, ringSegments);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide
      });
      const orbitRing = new THREE.Mesh(ringGeo, ringMat);
      orbitRing.rotation.x = Math.PI / 2;
      orbitRing.rotation.y = data.inclination;
      this.group.add(orbitRing);

      // 2. Mini Sunflower Body
      const miniSunGroup = new THREE.Group();
      planetGroup.add(miniSunGroup);

      // Center Seed Core
      const coreGeo = new THREE.SphereGeometry(data.size * 0.45, 16, 16);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x5a2d0c,
        emissive: 0xffa500,
        emissiveIntensity: 0.5,
        roughness: 0.5
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      miniSunGroup.add(coreMesh);

      // Ring of 16 Petals
      const petalGeo = new THREE.PlaneGeometry(data.size * 0.35, data.size * 0.9);
      petalGeo.translate(0, (data.size * 0.9) / 2, 0);
      const petalMat = new THREE.MeshStandardMaterial({
        map: petalTex,
        side: THREE.DoubleSide,
        transparent: true,
        emissive: 0xffaa00,
        emissiveIntensity: 0.3
      });

      const petalCount = 14;
      for (let p = 0; p < petalCount; p++) {
        const pAngle = (p / petalCount) * Math.PI * 2;
        const petalMesh = new THREE.Mesh(petalGeo, petalMat);
        petalMesh.position.set(
          Math.cos(pAngle) * (data.size * 0.4),
          Math.sin(pAngle) * (data.size * 0.4),
          0
        );
        petalMesh.rotation.z = pAngle - Math.PI / 2;
        petalMesh.rotation.x = 0.2; // slight flare
        miniSunGroup.add(petalMesh);
      }

      // Glowing Atmosphere / Halo
      const haloGeo = new THREE.PlaneGeometry(data.size * 3.2, data.size * 3.2);
      const haloMat = new THREE.MeshBasicMaterial({
        map: stardustTex,
        color: new THREE.Color(data.color),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      miniSunGroup.add(haloMesh);

      // Invisible Hit Sphere for Raycasting / Tapping
      const hitGeo = new THREE.SphereGeometry(data.size * 1.6, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { planetData: data };
      miniSunGroup.add(hitMesh);
      this.hitObjects.push(hitMesh);

      // Mini Orbiting Moon / Sparkle
      const moonGeo = new THREE.SphereGeometry(data.size * 0.14, 8, 8);
      const moonMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const moonMesh = new THREE.Mesh(moonGeo, moonMat);
      miniSunGroup.add(moonMesh);

      this.planets.push({
        data,
        group: planetGroup,
        miniSun: miniSunGroup,
        halo: haloMesh,
        moon: moonMesh,
        baseAngle: (index / PLANETARY_SYSTEMS_DATA.length) * Math.PI * 2
      });
    });
  }

  update(delta, camera) {
    this.time += delta;

    this.planets.forEach((p) => {
      const angle = p.baseAngle + this.time * p.data.speed * 0.4;
      const r = p.data.radius;

      // Position along orbit with slight inclination
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = Math.sin(angle * 2) * (r * p.data.inclination);

      p.miniSun.position.set(x, y, z);

      // Spin sunflower
      p.miniSun.rotation.z += 0.015;

      // Halo faces the camera
      if (camera) {
        p.halo.lookAt(camera.position);
      }

      // Moon orbit
      if (p.moon) {
        const moonAngle = this.time * 2.2;
        p.moon.position.set(
          Math.cos(moonAngle) * (p.data.size * 1.2),
          Math.sin(moonAngle) * (p.data.size * 1.2),
          Math.sin(moonAngle * 0.5) * 0.5
        );
      }
    });
  }

  checkIntersection(raycaster) {
    const intersects = raycaster.intersectObjects(this.hitObjects, true);
    if (intersects.length > 0) {
      return intersects[0].object.userData.planetData;
    }
    return null;
  }
}
