import * as THREE from 'three';

// Procedural texture generators using HTML5 Canvas - Zero 404 dependencies

export function createSupermarketFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base bright supermarket floor color
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 512);

  // Checkered clean tiles with fine grout
  const tileSize = 64;
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      ctx.fillStyle = isAlt ? '#ffffff' : '#f1f5f9';
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

      // Subtle gloss speckles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(x + 4, y + 4, tileSize - 8, 4);

      // Grout line
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createStripedAwningTexture(color1: string, color2: string = '#ffffff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const stripeWidth = 32;
  for (let x = 0; x < 256; x += stripeWidth) {
    const isPrimary = (x / stripeWidth) % 2 === 0;
    ctx.fillStyle = isPrimary ? color1 : color2;
    ctx.fillRect(x, 0, stripeWidth, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#b45309'; // warm amber wood
  ctx.fillRect(0, 0, 256, 256);

  // Planks
  const plankH = 64;
  for (let y = 0; y < 256; y += plankH) {
    ctx.fillStyle = y % 128 === 0 ? '#92400e' : '#78350f';
    ctx.fillRect(0, y + 2, 256, plankH - 4);

    // Wood grain lines
    ctx.strokeStyle = 'rgba(254, 215, 170, 0.2)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, y + 12 + i * 14);
      ctx.bezierCurveTo(80, y + 8 + i * 14, 180, y + 16 + i * 14, 256, y + 12 + i * 14);
      ctx.stroke();
    }

    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, y, 256, plankH);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createStallSignTexture(name: string, bgColor: string, textColor: string = '#ffffff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Background banner
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 128);

  // Border highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 116);

  // Text
  ctx.fillStyle = textColor;
  ctx.font = 'bold 36px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name.toUpperCase(), 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createProductLabelTexture(emoji: string, title: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 240, 240);

  ctx.font = '72px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 128, 90);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Outfit", sans-serif';
  ctx.fillText(title, 128, 180);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
