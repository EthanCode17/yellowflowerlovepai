import * as THREE from 'three';
import { generateGalaxyData } from '../utils/galaxyMath';
import { createSunflowerParticleTexture, createStarDustTexture } from '../utils/textures';

/**
 * Milky Way Galaxy filled with thousands of golden stars and glowing sunflower particles.
 * Implements real-time physical repulsion from pointer and spring return damping.
 */
export class MilkyWayGalaxy {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.particleCount = 14000;
    this.galaxyData = generateGalaxyData(this.particleCount, 4, 180);

    // Physics parameters
    this.pointer3D = new THREE.Vector3(9999, 9999, 9999);
    this.pointerRadius = 38; // Radius of physical repulsion field
    this.repulsionStrength = 180; // How fast particles shoot away
    this.springStiffness = 0.055; // How strongly they return
    this.damping = 0.88; // Friction factor

    this.init();
  }

  init() {
    const data = this.galaxyData;

    // Filter indices for sunflowers and stardust
    const sunflowerIndices = [];
    const stardustIndices = [];

    for (let i = 0; i < this.particleCount; i++) {
      if (data.particleTypes[i] === 1) {
        sunflowerIndices.push(i);
      } else {
        stardustIndices.push(i);
      }
    }

    this.sunflowerCount = sunflowerIndices.length;
    this.stardustCount = stardustIndices.length;

    this.sunflowerIndices = sunflowerIndices;
    this.stardustIndices = stardustIndices;

    // --- 1. Sunflower Particles System ---
    this.sunflowerTex = createSunflowerParticleTexture();
    this.sunflowerGeo = new THREE.BufferGeometry();

    const sfPositions = new Float32Array(this.sunflowerCount * 3);
    const sfColors = new Float32Array(this.sunflowerCount * 3);
    const sfSizes = new Float32Array(this.sunflowerCount);

    for (let j = 0; j < this.sunflowerCount; j++) {
      const idx = sunflowerIndices[j];
      const j3 = j * 3;
      const idx3 = idx * 3;

      sfPositions[j3] = data.currentPositions[idx3];
      sfPositions[j3 + 1] = data.currentPositions[idx3 + 1];
      sfPositions[j3 + 2] = data.currentPositions[idx3 + 2];

      sfColors[j3] = data.colors[idx3];
      sfColors[j3 + 1] = data.colors[idx3 + 1];
      sfColors[j3 + 2] = data.colors[idx3 + 2];

      sfSizes[j] = data.sizes[idx];
    }

    this.sunflowerGeo.setAttribute('position', new THREE.BufferAttribute(sfPositions, 3));
    this.sunflowerGeo.setAttribute('color', new THREE.BufferAttribute(sfColors, 3));
    this.sunflowerGeo.setAttribute('size', new THREE.BufferAttribute(sfSizes, 1));

    const sunflowerMat = new THREE.PointsMaterial({
      size: 5.2,
      map: this.sunflowerTex,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.sunflowerPoints = new THREE.Points(this.sunflowerGeo, sunflowerMat);
    this.group.add(this.sunflowerPoints);

    // --- 2. Stardust Particles System ---
    this.stardustTex = createStarDustTexture();
    this.stardustGeo = new THREE.BufferGeometry();

    const sdPositions = new Float32Array(this.stardustCount * 3);
    const sdColors = new Float32Array(this.stardustCount * 3);
    const sdSizes = new Float32Array(this.stardustCount);

    for (let j = 0; j < this.stardustCount; j++) {
      const idx = stardustIndices[j];
      const j3 = j * 3;
      const idx3 = idx * 3;

      sdPositions[j3] = data.currentPositions[idx3];
      sdPositions[j3 + 1] = data.currentPositions[idx3 + 1];
      sdPositions[j3 + 2] = data.currentPositions[idx3 + 2];

      sdColors[j3] = data.colors[idx3];
      sdColors[j3 + 1] = data.colors[idx3 + 1];
      sdColors[j3 + 2] = data.colors[idx3 + 2];

      sdSizes[j] = data.sizes[idx];
    }

    this.stardustGeo.setAttribute('position', new THREE.BufferAttribute(sdPositions, 3));
    this.stardustGeo.setAttribute('color', new THREE.BufferAttribute(sdColors, 3));
    this.stardustGeo.setAttribute('size', new THREE.BufferAttribute(sdSizes, 1));

    const stardustMat = new THREE.PointsMaterial({
      size: 1.2,
      map: this.stardustTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.stardustPoints = new THREE.Points(this.stardustGeo, stardustMat);
    this.group.add(this.stardustPoints);
  }

  /**
   * Updates pointer position in 3D world space coordinates
   */
  setPointer(worldPos) {
    if (worldPos) {
      this.pointer3D.copy(worldPos);
    } else {
      this.pointer3D.set(9999, 9999, 9999);
    }
  }

  /**
   * Real-time physical simulation step:
   * 1. Orbits particles slowly around galactic core.
   * 2. Checks pointer repulsion vector.
   * 3. Calculates Hooke's spring return force.
   * 4. Integrates velocity and updates buffer positions.
   */
  update(delta) {
    const data = this.galaxyData;
    const px = this.pointer3D.x;
    const py = this.pointer3D.y;
    const pz = this.pointer3D.z;

    const prSq = this.pointerRadius * this.pointerRadius;
    const k = this.springStiffness;
    const damp = this.damping;
    const repulse = this.repulsionStrength * Math.min(delta, 0.05);

    // Orbital rotation increment
    const rotSpeed = 0.0008;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Update cosmic orbital baseline position
      data.angles[i] += data.orbitSpeeds[i] * 0.05 + rotSpeed;
      const r = data.distances[i];
      const armAngle = data.angles[i];

      // Base target position on spiral orbit
      const targetX = Math.cos(armAngle) * r;
      const targetZ = Math.sin(armAngle) * r;
      const targetY = data.originPositions[i3 + 1];

      // Current particle position
      let cx = data.currentPositions[i3];
      let cy = data.currentPositions[i3 + 1];
      let cz = data.currentPositions[i3 + 2];

      // Velocity
      let vx = data.velocities[i3];
      let vy = data.velocities[i3 + 1];
      let vz = data.velocities[i3 + 2];

      // 1. Repulsion physics against mouse / finger pointer in 3D
      const dx = cx - px;
      const dy = cy - py;
      const dz = cz - pz;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < prSq && distSq > 0.01) {
        const dist = Math.sqrt(distSq);
        const force = (1.0 - dist / this.pointerRadius) * repulse;
        // Radial push away from cursor
        vx += (dx / dist) * force;
        vy += (dy / dist) * force * 1.5; // Extra vertical swirl
        vz += (dz / dist) * force;
      }

      // 2. Spring return force towards the orbital target
      const springX = (targetX - cx) * k;
      const springY = (targetY - cy) * k;
      const springZ = (targetZ - cz) * k;

      vx = (vx + springX) * damp;
      vy = (vy + springY) * damp;
      vz = (vz + springZ) * damp;

      cx += vx;
      cy += vy;
      cz += vz;

      data.currentPositions[i3] = cx;
      data.currentPositions[i3 + 1] = cy;
      data.currentPositions[i3 + 2] = cz;

      data.velocities[i3] = vx;
      data.velocities[i3 + 1] = vy;
      data.velocities[i3 + 2] = vz;
    }

    // Transfer updated positions to the respective BufferGeometry attributes
    const sfPos = this.sunflowerGeo.attributes.position.array;
    for (let j = 0; j < this.sunflowerCount; j++) {
      const idx3 = this.sunflowerIndices[j] * 3;
      const j3 = j * 3;
      sfPos[j3] = data.currentPositions[idx3];
      sfPos[j3 + 1] = data.currentPositions[idx3 + 1];
      sfPos[j3 + 2] = data.currentPositions[idx3 + 2];
    }
    this.sunflowerGeo.attributes.position.needsUpdate = true;

    const sdPos = this.stardustGeo.attributes.position.array;
    for (let j = 0; j < this.stardustCount; j++) {
      const idx3 = this.stardustIndices[j] * 3;
      const j3 = j * 3;
      sdPos[j3] = data.currentPositions[idx3];
      sdPos[j3 + 1] = data.currentPositions[idx3 + 1];
      sdPos[j3 + 2] = data.currentPositions[idx3 + 2];
    }
    this.stardustGeo.attributes.position.needsUpdate = true;
  }
}
