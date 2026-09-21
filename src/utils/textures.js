import * as THREE from 'three';

/**
 * Creates a high-detail, crisp procedural sunflower texture using Canvas 2D
 * Sharp petals and dark rich chocolate center without blurry haze
 */
export function createSunflowerParticleTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  // Clear
  ctx.clearRect(0, 0, size, size);

  // Draw 18 crisp petals radiating outward
  const petalCount = 18;
  const petalLen = size * 0.44;
  const petalWidth = size * 0.115;

  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);

    // Petal gradient: warm amber at base, vibrant sunflower yellow in middle, bright tip
    const petalGrad = ctx.createLinearGradient(0, 0, 0, -petalLen);
    petalGrad.addColorStop(0, '#e67300');
    petalGrad.addColorStop(0.25, '#ff9900');
    petalGrad.addColorStop(0.75, '#ffdd00');
    petalGrad.addColorStop(0.95, '#fff68f');
    petalGrad.addColorStop(1, '#ffffff');

    ctx.fillStyle = petalGrad;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.12); // Start at disc edge
    ctx.quadraticCurveTo(-petalWidth / 2, -petalLen * 0.55, 0, -petalLen);
    ctx.quadraticCurveTo(petalWidth / 2, -petalLen * 0.55, 0, -size * 0.12);
    ctx.fill();

    // Subtle petal central vein
    ctx.strokeStyle = 'rgba(230, 115, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.12);
    ctx.lineTo(0, -petalLen * 0.85);
    ctx.stroke();

    ctx.restore();
  }

  // Inner Petal Layer (offset for fullness and organic depth)
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2 + Math.PI / petalCount;
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);

    const innerLen = petalLen * 0.86;
    const innerWidth = petalWidth * 0.9;
    const petalGrad = ctx.createLinearGradient(0, 0, 0, -innerLen);
    petalGrad.addColorStop(0, '#cc5500');
    petalGrad.addColorStop(0.5, '#ffaa00');
    petalGrad.addColorStop(1, '#ffee55');

    ctx.fillStyle = petalGrad;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.12);
    ctx.quadraticCurveTo(-innerWidth / 2, -innerLen * 0.5, 0, -innerLen);
    ctx.quadraticCurveTo(innerWidth / 2, -innerLen * 0.5, 0, -size * 0.12);
    ctx.fill();
    ctx.restore();
  }

  // Dark Chocolate & Amber Center disc (Fibonacci seed floret look)
  const discGrad = ctx.createRadialGradient(center, center, 0, center, center, size * 0.18);
  discGrad.addColorStop(0, '#5a2305');
  discGrad.addColorStop(0.6, '#3a1400');
  discGrad.addColorStop(0.85, '#220a00');
  discGrad.addColorStop(1, '#ffaa00'); // Thin glowing golden rim
  ctx.fillStyle = discGrad;
  ctx.beginPath();
  ctx.arc(center, center, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Subtle golden seed specks on disk
  ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
  for (let r = 8; r < size * 0.16; r += 7) {
    const dots = Math.floor(r * 0.9);
    for (let d = 0; d < dots; d++) {
      const a = (d / dots) * Math.PI * 2 + r;
      const x = center + Math.cos(a) * r;
      const y = center + Math.sin(a) * r;
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  return texture;
}

/**
 * Creates soft subtle star dust texture with clean falloff
 */
export function createStarDustTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  grad.addColorStop(0.2, 'rgba(255, 220, 120, 0.6)');
  grad.addColorStop(0.5, 'rgba(255, 160, 40, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(center, center, center, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedural petal texture with delicate leaf veins and luminous golden gradient
 */
export function createPetalTexture() {
  const width = 128;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background gradient: warm golden yellow with orange amber base
  const grad = ctx.createLinearGradient(0, height, 0, 0);
  grad.addColorStop(0, '#d97706'); // Base attachment
  grad.addColorStop(0.25, '#f59e0b');
  grad.addColorStop(0.7, '#fbbf24');
  grad.addColorStop(0.95, '#fef08a'); // Tip
  grad.addColorStop(1, '#ffffff');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Central vein
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(width / 2, height);
  ctx.lineTo(width / 2, 20);
  ctx.stroke();

  // Subtle side veins
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
  ctx.lineWidth = 1.5;
  for (let y = height * 0.8; y > 40; y -= 24) {
    ctx.beginPath();
    ctx.moveTo(width / 2, y);
    ctx.quadraticCurveTo(width * 0.3, y - 10, width * 0.15, y - 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width / 2, y);
    ctx.quadraticCurveTo(width * 0.7, y - 10, width * 0.85, y - 30);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates high-resolution circular badge texture for the sun center:
 * "Mi amor por ti es más grande que el universo, te dedico este giraSOL"
 */
export function createSunCenterTextTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  // Clear
  ctx.clearRect(0, 0, size, size);

  // Rich velvet dark amber core
  const bgGrad = ctx.createRadialGradient(center, center, 0, center, center, center * 0.95);
  bgGrad.addColorStop(0, 'rgba(50, 16, 2, 0.96)');
  bgGrad.addColorStop(0.7, 'rgba(26, 8, 0, 0.94)');
  bgGrad.addColorStop(0.92, 'rgba(15, 4, 0, 0.85)');
  bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(center, center, center * 0.95, 0, Math.PI * 2);
  ctx.fill();

  // Outer glowing gold border ring
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(center, center, center * 0.84, 0, Math.PI * 2);
  ctx.stroke();

  // Inner delicate ring
  ctx.strokeStyle = 'rgba(255, 235, 120, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(center, center, center * 0.78, 0, Math.PI * 2);
  ctx.stroke();

  // Text setup
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // "Paola"
  ctx.font = 'bold 44px "Cinzel", Georgia, serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 16;
  ctx.fillText('PAOLA', center, center - 95);

  // Subtitle lines: "Mi amor por ti es más grande que el universo, te dedico este giraSOL"
  ctx.fillStyle = '#fffae0';
  ctx.shadowColor = 'rgba(255, 190, 0, 0.6)';
  ctx.shadowBlur = 8;

  ctx.font = '500 22px "Outfit", sans-serif';
  ctx.fillText('Mi amor por ti es', center, center - 40);

  ctx.font = '600 24px "Outfit", sans-serif';
  ctx.fillStyle = '#ffd000';
  ctx.fillText('más grande que el universo,', center, center - 8);

  ctx.font = '500 21px "Outfit", sans-serif';
  ctx.fillStyle = '#fff4a3';
  ctx.fillText('te dedico este', center, center + 26);

  // "giraSOL" highlighted
  const solGrad = ctx.createLinearGradient(0, center + 60, 0, center + 100);
  solGrad.addColorStop(0, '#ffffff');
  solGrad.addColorStop(0.3, '#fff485');
  solGrad.addColorStop(1, '#ff9900');
  ctx.fillStyle = solGrad;
  ctx.font = 'bold 36px "Cinzel", "Outfit", sans-serif';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 20;
  ctx.fillText('giraSOL 🌻', center, center + 72);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  return texture;
}
