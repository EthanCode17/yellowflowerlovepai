import * as THREE from 'three';
import { generatePhyllotaxisSeeds } from '../utils/galaxyMath';
import { createPetalTexture, createStarDustTexture, createSunCenterTextTexture } from '../utils/textures';

/**
 * Creates the central 3D Sunflower Sun with realistic Fibonacci floret disc,
 * dual-layer curved petals, solar corona flare, and physics-based inertia.
 */
export class SunflowerSun {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Physics & Interaction state
    this.angularVelocity = new THREE.Vector2(0, 0);
    this.targetRotation = new THREE.Euler(0, 0, 0);
    this.friction = 0.94;
    this.isDragging = false;
    this.pulseScale = 1.0;
    this.targetPulseScale = 1.0;

    this.petals = [];
    this.time = 0;

    this.init();
  }

  init() {
    this.createSolarCore();
    this.createFloretDisc();
    this.createPetals();
    this.createSolarCorona();
    this.createLoveBadge();
  }

  /**
   * Central incandescent pulsating sphere
   */
  createSolarCore() {
    const coreGeo = new THREE.SphereGeometry(3.6, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.85
    });
    this.solarCoreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.solarCoreMesh.position.z = -0.5;
    this.group.add(this.solarCoreMesh);

    // Warm point light emitting from the sun center to light up petals
    this.sunLight = new THREE.PointLight(0xffcc33, 4.5, 90, 1.2);
    this.sunLight.position.set(0, 0, 3);
    this.group.add(this.sunLight);
  }

  /**
   * Disc of 1200+ Fibonacci phyllotaxis seeds
   */
  createFloretDisc() {
    const seedData = generatePhyllotaxisSeeds(1250, 0.22);
    const seedGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.45, 6);
    seedGeo.rotateX(Math.PI / 2);

    const seedMat = new THREE.MeshStandardMaterial({
      roughness: 0.5,
      metalness: 0.15,
      emissive: new THREE.Color(0x3d1700),
      emissiveIntensity: 0.4
    });

    const count = seedData.scales.length;
    this.seedMesh = new THREE.InstancedMesh(seedGeo, seedMat, count);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      dummy.position.set(
        seedData.positions[i3],
        seedData.positions[i3 + 1],
        seedData.positions[i3 + 2]
      );

      dummy.rotation.z = seedData.rotations[i];
      // Angle seeds outwards slightly as they approach the rim
      const dist = Math.sqrt(dummy.position.x * dummy.position.x + dummy.position.y * dummy.position.y);
      dummy.rotation.x = (dummy.position.y / (dist + 0.001)) * 0.35;
      dummy.rotation.y = (-dummy.position.x / (dist + 0.001)) * 0.35;

      const s = seedData.scales[i];
      dummy.scale.set(s, s, s * 1.3);
      dummy.updateMatrix();

      this.seedMesh.setMatrixAt(i, dummy.matrix);

      color.setRGB(seedData.colors[i3], seedData.colors[i3 + 1], seedData.colors[i3 + 2]);
      this.seedMesh.setColorAt(i, color);
    }

    this.seedMesh.instanceMatrix.needsUpdate = true;
    if (this.seedMesh.instanceColor) this.seedMesh.instanceColor.needsUpdate = true;
    this.group.add(this.seedMesh);
  }

  /**
   * Dual-layer ring of curved 3D sunflower petals
   */
  createPetals() {
    const petalTexture = createPetalTexture();
    const petalMat = new THREE.MeshStandardMaterial({
      map: petalTexture,
      roughness: 0.35,
      metalness: 0.05,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(0xff9900),
      emissiveIntensity: 0.08,
      alphaTest: 0.05
    });

    // Create custom curved petal geometry
    const petalGeo = this.buildCurvedPetalGeometry(2.5, 8.2);

    const layerConfigs = [
      { count: 34, radius: 7.2, zOffset: -0.2, scale: 1.0, tiltBack: 0.22 }, // Inner ring
      { count: 34, radius: 7.6, zOffset: -0.6, scale: 1.15, tiltBack: 0.35, angleOffset: Math.PI / 34 } // Outer ring
    ];

    layerConfigs.forEach((layer, layerIdx) => {
      for (let i = 0; i < layer.count; i++) {
        const angle = (i / layer.count) * Math.PI * 2 + (layer.angleOffset || 0);
        const petalPivot = new THREE.Group();

        // Position at disc boundary
        petalPivot.position.set(
          Math.cos(angle) * layer.radius,
          Math.sin(angle) * layer.radius,
          layer.zOffset
        );

        // Point outwards
        petalPivot.rotation.z = angle - Math.PI / 2;
        petalPivot.rotation.x = layer.tiltBack;

        const mesh = new THREE.Mesh(petalGeo, petalMat);
        mesh.scale.set(layer.scale, layer.scale, layer.scale);

        petalPivot.add(mesh);
        this.group.add(petalPivot);

        this.petals.push({
          pivot: petalPivot,
          baseRotX: petalPivot.rotation.x,
          baseRotY: petalPivot.rotation.y,
          baseRotZ: petalPivot.rotation.z,
          seed: i * 0.35 + layerIdx * 10
        });
      }
    });
  }

  /**
   * Procedural curved petal mesh
   */
  buildCurvedPetalGeometry(width = 2.4, length = 7.8) {
    const segmentsX = 8;
    const segmentsY = 16;
    const geo = new THREE.PlaneGeometry(width, length, segmentsX, segmentsY);
    geo.translate(0, length / 2, 0); // Origin at base of petal

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const normY = y / length; // 0 (base) to 1 (tip)

      // Shape: taper at base, widen at mid, taper to tip
      let widthFactor;
      if (normY < 0.3) {
        widthFactor = 0.4 + (normY / 0.3) * 0.6;
      } else {
        widthFactor = 1.0 - Math.pow((normY - 0.3) / 0.7, 1.8) * 0.92;
      }
      pos.setX(i, x * widthFactor);

      // Curve backward along Y to give realistic organic curvature
      const bendZ = -Math.sin(normY * Math.PI * 0.85) * (length * 0.22);
      const cupZ = Math.pow(x / (width * 0.5), 2) * 0.25;
      pos.setZ(i, bendZ + cupZ);
    }

    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Solar flare aura placed behind the flower as a subtle rim halo
   */
  createSolarCorona() {
    const stardustTex = createStarDustTexture();

    // Subtle rim halo positioned well behind the sunflower
    const ringGeo = new THREE.PlaneGeometry(44, 44);
    const ringMat = new THREE.MeshBasicMaterial({
      map: stardustTex,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.coronaMesh = new THREE.Mesh(ringGeo, ringMat);
    this.coronaMesh.position.z = -2.8;
    this.group.add(this.coronaMesh);
  }

  /**
   * Heart badge in the center of the sun:
   * "Paola - Mi amor por ti es más grande que el universo, te dedico este giraSOL"
   */
  createLoveBadge() {
    const badgeTexture = createSunCenterTextTexture();
    const badgeGeo = new THREE.CircleGeometry(3.8, 64);
    const badgeMat = new THREE.MeshBasicMaterial({
      map: badgeTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    this.badgeMesh.position.set(0, 0, 1.9);
    this.group.add(this.badgeMesh);

    // Glowing golden outer filigree ring around badge
    const ringGeo = new THREE.RingGeometry(3.75, 3.98, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    this.badgeRing = new THREE.Mesh(ringGeo, ringMat);
    this.badgeRing.position.set(0, 0, 1.91);
    this.group.add(this.badgeRing);

    // Large invisible hit sphere covering the entire sunflower body and petals
    const hitGeo = new THREE.SphereGeometry(13, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    this.hitMesh = new THREE.Mesh(hitGeo, hitMat);
    this.group.add(this.hitMesh);
  }

  /**
   * Raycast check against the sunflower sun
   */
  checkIntersection(raycaster) {
    if (!this.hitMesh) return false;
    const hits = raycaster.intersectObject(this.hitMesh, false);
    return hits.length > 0;
  }

  /**
   * Physics updates every frame
   */
  update(delta) {
    this.time += delta;

    // Apply angular velocity inertia if not currently being actively dragged
    if (!this.isDragging) {
      this.group.rotation.y += this.angularVelocity.x;
      this.group.rotation.x += this.angularVelocity.y;

      // Natural gentle floating cosmic rotation
      this.group.rotation.z += 0.003;

      // Smooth damping / friction
      this.angularVelocity.x *= this.friction;
      this.angularVelocity.y *= this.friction;
    }

    // Organic petal waving in solar wind
    const swaySpeed = 2.4;
    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      const wave = Math.sin(this.time * swaySpeed + p.seed) * 0.04;
      p.pivot.rotation.x = p.baseRotX + wave;
    }

    // Solar flare pulse and slow reverse rotation
    if (this.coronaMesh) {
      this.coronaMesh.rotation.z -= 0.002;
      const flarePulse = 1.0 + Math.sin(this.time * 2.0) * 0.06;
      this.coronaMesh.scale.set(flarePulse, flarePulse, flarePulse);
    }
    if (this.innerFlare) {
      this.innerFlare.rotation.z += 0.003;
    }

    // Core pulsing light
    const pulseLight = 3.5 + Math.sin(this.time * 3.5) * 0.9;
    this.sunLight.intensity = pulseLight;

    if (this.badgeRing) {
      this.badgeRing.rotation.z += 0.005;
    }

    // Pulse animation (e.g. upon user click)
    this.pulseScale += (this.targetPulseScale - this.pulseScale) * 0.12;
    if (Math.abs(this.targetPulseScale - 1.0) > 0.01 && this.pulseScale > 1.15) {
      this.targetPulseScale = 1.0; // Return to normal after peak
    }
    this.group.scale.set(this.pulseScale, this.pulseScale, this.pulseScale);
  }

  /**
   * Called when user touches or clicks the sunflower
   */
  triggerPulse() {
    this.targetPulseScale = 1.25;
    this.sunLight.intensity = 8.0;
  }

  /**
   * Physics drag handling
   */
  startDrag() {
    this.isDragging = true;
    this.angularVelocity.set(0, 0);
  }

  onDrag(deltaX, deltaY) {
    const sensitivity = 0.006;
    this.group.rotation.y += deltaX * sensitivity;
    this.group.rotation.x += deltaY * sensitivity;

    // Track velocity for inertia release
    this.angularVelocity.x = deltaX * sensitivity;
    this.angularVelocity.y = deltaY * sensitivity;
  }

  endDrag() {
    this.isDragging = false;
  }
}
