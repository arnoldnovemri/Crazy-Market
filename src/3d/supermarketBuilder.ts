import * as THREE from 'three';
import {
  createSupermarketFloorTexture,
  createStripedAwningTexture,
  createWoodTexture,
  createStallSignTexture,
  createProductLabelTexture,
} from './textureGenerator';
import { MARKET_STALLS, PRODUCT_CATALOG } from '../utils/gameData';
import { buildShoppingTrolley, buildCharacter, AnimatedCharacterMesh } from './characterBuilder';
import { CharacterConfig } from '../types/game';

export interface SupermarketSceneBundle {
  scene: THREE.Scene;
  npcShoppers: { mesh: AnimatedCharacterMesh; path: { x: number; z: number }[]; currentIdx: number; speed: number }[];
  stallInteractZones: { id: string; name: string; x: number; z: number; radius: number }[];
  firstPersonCart: THREE.Group;
  update: (delta: number) => void;
}

export function buildSupermarketScene(playerConfig: CharacterConfig): SupermarketSceneBundle {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0f172a');
  scene.fog = new THREE.FogExp2('#0f172a', 0.025);

  // 1. Lighting Rig (Studio 3-Point + Supermarket Ceiling Spotlights)
  const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x1e293b, 1.2);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffedd5, 1.6);
  keyLight.position.set(12, 18, 10);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 40;
  keyLight.shadow.camera.left = -20;
  keyLight.shadow.camera.right = 20;
  keyLight.shadow.camera.top = 20;
  keyLight.shadow.camera.bottom = -20;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.8);
  fillLight.position.set(-14, 15, -12);
  scene.add(fillLight);

  // 2. Floor
  const floorTexture = createSupermarketFloorTexture();
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.25,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // 3. Walls
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
  });
  const wallAccentMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.4,
  });

  const wallHeights = 6;
  const wallHalf = 18;

  // North Wall
  const nWall = new THREE.Mesh(new THREE.BoxGeometry(36, wallHeights, 0.4), wallMat);
  nWall.position.set(0, wallHeights / 2, -wallHalf);
  scene.add(nWall);

  // South Wall
  const sWall = new THREE.Mesh(new THREE.BoxGeometry(36, wallHeights, 0.4), wallMat);
  sWall.position.set(0, wallHeights / 2, wallHalf);
  scene.add(sWall);

  // West Wall
  const wWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, wallHeights, 36), wallMat);
  wWall.position.set(-wallHalf, wallHeights / 2, 0);
  scene.add(wWall);

  // East Wall
  const eWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, wallHeights, 36), wallMat);
  eWall.position.set(wallHalf, wallHeights / 2, 0);
  scene.add(eWall);

  // Decorative Wall Stripe
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(35.9, 0.6, 0.42), wallAccentMat);
  stripe.position.set(0, 3, -wallHalf + 0.02);
  scene.add(stripe);

  // Grand Entrance Sign "CRAZY MARKET"
  const entranceSignTex = createStallSignTexture('🛒 CRAZY MARKET 🛒', '#f59e0b', '#0f172a');
  const entranceSign = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 2),
    new THREE.MeshBasicMaterial({ map: entranceSignTex, side: THREE.DoubleSide })
  );
  entranceSign.position.set(0, 5, -wallHalf + 0.3);
  scene.add(entranceSign);

  // 4. Ceiling Beams & Hanging Lamps
  const beamMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
  for (let z = -14; z <= 14; z += 7) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(36, 0.4, 0.4), beamMat);
    beam.position.set(0, 5.8, z);
    scene.add(beam);

    // Suspended light lamps
    for (let x = -10; x <= 10; x += 10) {
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 6), beamMat);
      cable.position.set(x, 5.2, z);
      scene.add(cable);

      const lampCone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.15, 0.3, 16),
        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 })
      );
      lampCone.position.set(x, 4.5, z);
      scene.add(lampCone);

      const bulbGlow = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffedd5 })
      );
      bulbGlow.position.set(x, 4.4, z);
      scene.add(bulbGlow);
    }

    // Overhead colorful pennant flags along beam
    const flagColors = [0xef4444, 0xf59e0b, 0x10b981, 0x06b6d4, 0x8b5cf6, 0xec4899];
    for (let fx = -14; fx <= 14; fx += 2.0) {
      const flagGeom = new THREE.ConeGeometry(0.22, 0.45, 3);
      flagGeom.rotateZ(Math.PI);
      const flagMat = new THREE.MeshStandardMaterial({
        color: flagColors[Math.abs(Math.floor(fx + z)) % flagColors.length],
        side: THREE.DoubleSide,
        roughness: 0.5,
      });
      const flag = new THREE.Mesh(flagGeom, flagMat);
      flag.position.set(fx, 5.5, z);
      scene.add(flag);
    }
  }

  // 5. Build the 4 Market Stalls
  const woodTexture = createWoodTexture();
  const stallInteractZones: { id: string; name: string; x: number; z: number; radius: number }[] = [];

  MARKET_STALLS.forEach((stall) => {
    const stallGroup = new THREE.Group();
    stallGroup.position.set(stall.x, 0, stall.z);
    stallGroup.name = stall.id;

    // Counter Table
    const counterTopMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.4,
    });
    const counterBodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(stall.color),
      roughness: 0.5,
    });

    const counter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.0, 1.8), counterBodyMat);
    counter.position.set(0, 0.5, 0);
    counter.castShadow = true;
    counter.receiveShadow = true;
    stallGroup.add(counter);

    const counterTop = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.1, 2.0), counterTopMat);
    counterTop.position.set(0, 1.05, 0);
    counterTop.castShadow = true;
    stallGroup.add(counterTop);

    // Awning Support Poles
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const poleGeom = new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8);
    const polePositions = [
      [-2.0, 1.6, -0.85],
      [2.0, 1.6, -0.85],
      [-2.0, 1.6, 0.85],
      [2.0, 1.6, 0.85],
    ];
    polePositions.forEach(([px, py, pz]) => {
      const pole = new THREE.Mesh(poleGeom, poleMat);
      pole.position.set(px, py, pz);
      stallGroup.add(pole);
    });

    // Striped Awning Canopy
    const awningTex = createStripedAwningTexture(stall.color, '#ffffff');
    const awningMat = new THREE.MeshStandardMaterial({
      map: awningTex,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const awning = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.15, 2.4), awningMat);
    awning.position.set(0, 3.2, 0);
    awning.rotation.x = 0.08;
    awning.castShadow = true;
    stallGroup.add(awning);

    // Stall Banner Sign
    const signTex = createStallSignTexture(stall.name, stall.color, '#ffffff');
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.85),
      new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
    );
    sign.position.set(0, 3.75, 0.1);
    stallGroup.add(sign);

    // Display crates with 3D product props
    const crateMat = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.6 });
    for (let c = -1.4; c <= 1.4; c += 1.4) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.7), crateMat);
      crate.position.set(c, 1.25, 0.2);
      stallGroup.add(crate);

      // Add product visuals inside crate
      if (stall.id === 'stall_fresh_mart' && c < 0) {
        // Red Apples
        const appleMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
        for (let ax = -0.3; ax <= 0.3; ax += 0.25) {
          for (let az = -0.2; az <= 0.2; az += 0.25) {
            const apple = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), appleMat);
            apple.position.set(c + ax, 1.48, 0.2 + az);
            stallGroup.add(apple);
          }
        }
      } else if (stall.id === 'stall_discount_depot') {
        // Milk Cartons or Cereal Boxes
        const milkBoxMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 });
        for (let mx = -0.25; mx <= 0.25; mx += 0.25) {
          const milk = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.18), milkBoxMat);
          milk.position.set(c + mx, 1.55, 0.2);
          stallGroup.add(milk);
        }
      } else if (stall.id === 'stall_sweet_shack') {
        // Chocolate Bars
        const chocMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 });
        for (let bx = -0.25; bx <= 0.25; bx += 0.25) {
          const choc = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.28), chocMat);
          choc.position.set(c + bx, 1.45, 0.2);
          stallGroup.add(choc);
        }
      } else {
        // Notebooks
        const nbMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.5 });
        for (let nx = -0.25; nx <= 0.25; nx += 0.25) {
          const nb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.05), nbMat);
          nb.position.set(c + nx, 1.55, 0.2);
          stallGroup.add(nb);
        }
      }
    }

    // Clerk NPC behind the counter
    const clerkConfig: CharacterConfig = {
      name: stall.clerkName,
      gender: 'neutral',
      skinTone: '#fcd34d',
      hairStyle: 'short',
      hairColor: '#451a03',
      shirtColor: stall.color,
      shirtStyle: 'vest',
      pantsColor: '#1e293b',
      shoesColor: '#0f172a',
      accessory: 'cap',
      trolleyColor: stall.color,
    };
    const clerk = buildCharacter(clerkConfig, false);
    clerk.position.set(0, 0, -1.2);
    clerk.rotation.y = 0;
    stallGroup.add(clerk);

    // Fun Balloon Cluster at stall corner
    const balloonColors = [stall.accentColor, '#f43f5e', '#38bdf8', '#fbbf24'];
    const balloons = new THREE.Group();
    balloonColors.forEach((colorHex, bIdx) => {
      const bGeom = new THREE.SphereGeometry(0.24, 12, 12);
      bGeom.scale(1, 1.25, 1);
      const bMesh = new THREE.Mesh(
        bGeom,
        new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness: 0.2, metalness: 0.1 })
      );
      const bAngle = (bIdx / balloonColors.length) * Math.PI * 2;
      bMesh.position.set(Math.cos(bAngle) * 0.2, 2.5 + (bIdx % 2) * 0.25, Math.sin(bAngle) * 0.2);
      balloons.add(bMesh);

      const strMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 1.5, 4),
        new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
      );
      strMesh.position.set(bMesh.position.x * 0.5, 1.7, bMesh.position.z * 0.5);
      balloons.add(strMesh);
    });
    balloons.position.set(2.2, 0, 0.9);
    stallGroup.add(balloons);

    // Floating 3D Arcade Promotion Badge above stall
    const promoTitles: Record<string, string> = {
      stall_fresh_mart: '🍎 25% OFF SALE!',
      stall_discount_depot: '🔥 BUY 1 GET 1 FREE!',
      stall_sweet_shack: '✨ DOUBLE DISCOUNT!',
      stall_campus_hub: '📚 25% STUDENT DEAL!',
    };
    const promoTitle = promoTitles[stall.id] || '⚡ SPECIAL PROMO ⚡';
    const promoTex = createStallSignTexture(promoTitle, '#f59e0b', '#0f172a');
    const floatingBadge = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 0.75),
      new THREE.MeshBasicMaterial({ map: promoTex, side: THREE.DoubleSide })
    );
    floatingBadge.position.set(0, 4.6, 0);
    floatingBadge.name = `floating_promo_${stall.id}`;
    stallGroup.add(floatingBadge);

    // Glowing interaction ring on the floor in front of stall
    const ringGeom = new THREE.RingGeometry(1.6, 1.85, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(stall.accentColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.03, 2.2);
    stallGroup.add(ring);

    scene.add(stallGroup);

    // Register interaction trigger zone
    stallInteractZones.push({
      id: stall.id,
      name: stall.name,
      x: stall.x,
      z: stall.z + 2.2,
      radius: 3.2,
    });
  });

  // 6. Central Supermarket Island Display / Aisle Shelves
  const shelfWoodMat = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.5 });
  const centerAisle = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 6.0), shelfWoodMat);
  centerAisle.position.set(0, 1.1, 0);
  centerAisle.castShadow = true;
  centerAisle.receiveShadow = true;
  scene.add(centerAisle);

  // Aisle Sign on Center Shelf
  const aisleSignTex = createStallSignTexture('⚡ FLASH DEALS ⚡', '#ef4444', '#ffffff');
  const aisleSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 0.7),
    new THREE.MeshBasicMaterial({ map: aisleSignTex, side: THREE.DoubleSide })
  );
  aisleSign.position.set(0, 2.7, 0);
  scene.add(aisleSign);

  // 7. Animated 3D NPC Shoppers running around pushing trolleys!
  const npcColors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899'];
  const npcPaths = [
    // Shopper 1 running clockwise outer loop
    [
      { x: -12, z: -12 },
      { x: 12, z: -12 },
      { x: 12, z: 12 },
      { x: -12, z: 12 },
    ],
    // Shopper 2 running counter-clockwise
    [
      { x: 11, z: 10 },
      { x: 11, z: -10 },
      { x: -11, z: -10 },
      { x: -11, z: 10 },
    ],
    // Shopper 3 rushing between Stall A and Stall B
    [
      { x: -7, z: -4 },
      { x: 7, z: -4 },
      { x: 7, z: -12 },
      { x: -7, z: -12 },
    ],
    // Shopper 4 rushing across South aisles
    [
      { x: 7, z: 4 },
      { x: -7, z: 4 },
      { x: -7, z: 12 },
      { x: 7, z: 12 },
    ],
    // Shopper 5 weaving around center shelf
    [
      { x: -4, z: -5 },
      { x: -4, z: 5 },
      { x: 4, z: 5 },
      { x: 4, z: -5 },
    ],
    // Shopper 6 rushing down the middle lane
    [
      { x: -13, z: 0 },
      { x: 13, z: 0 },
      { x: 13, z: 2 },
      { x: -13, z: 2 },
    ],
  ];

  const npcShoppers: { mesh: AnimatedCharacterMesh; path: { x: number; z: number }[]; currentIdx: number; speed: number }[] = [];

  for (let i = 0; i < 6; i++) {
    const npcConfig: CharacterConfig = {
      name: `Shopper ${i + 1}`,
      gender: i % 2 === 0 ? 'boy' : 'girl',
      skinTone: i % 3 === 0 ? '#fbcfe8' : i % 3 === 1 ? '#fed7aa' : '#fcd34d',
      hairStyle: (['short', 'curly', 'ponytail', 'spiky', 'bob'] as const)[i % 5],
      hairColor: ['#1e293b', '#78350f', '#d97706', '#b91c1c', '#0284c7', '#475569'][i],
      shirtColor: npcColors[i],
      shirtStyle: 'tshirt',
      pantsColor: '#1e293b',
      shoesColor: '#ffffff',
      accessory: i % 2 === 0 ? 'headphones' : 'cap',
      trolleyColor: npcColors[i],
    };

    const mesh = buildCharacter(npcConfig, true);
    const path = npcPaths[i];
    mesh.position.set(path[0].x, 0, path[0].z);
    scene.add(mesh);

    npcShoppers.push({
      mesh,
      path,
      currentIdx: 0,
      speed: 3.5 + Math.random() * 1.5, // fast, energetic running!
    });
  }

  // 8. Player's First-Person Shopping Trolley
  // Attached to camera or viewport in First-Person Mode
  const firstPersonCart = buildShoppingTrolley(playerConfig.trolleyColor || '#f97316');
  // First person cart default position relative to player camera:
  firstPersonCart.position.set(0, -0.65, -1.2);
  firstPersonCart.rotation.y = Math.PI; // Face forward in camera direction

  // Animation update function
  let animClock = 0;
  const update = (delta: number) => {
    animClock += delta;

    // Animate floating promo badges
    scene.traverse((obj) => {
      if (obj.name && obj.name.startsWith('floating_promo_')) {
        obj.position.y = 4.6 + Math.sin(animClock * 2.5) * 0.12;
        obj.rotation.y = Math.sin(animClock * 1.5) * 0.15;
      }
    });

    // Update NPC shoppers running along their paths
    npcShoppers.forEach((npc) => {
      const target = npc.path[npc.currentIdx];
      const dx = target.x - npc.mesh.position.x;
      const dz = target.z - npc.mesh.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 0.4) {
        npc.currentIdx = (npc.currentIdx + 1) % npc.path.length;
      } else {
        const moveStep = Math.min(dist, npc.speed * delta);
        npc.mesh.position.x += (dx / dist) * moveStep;
        npc.mesh.position.z += (dz / dist) * moveStep;

        // Turn towards movement direction
        const angle = Math.atan2(dx, dz);
        npc.mesh.rotation.y = THREE.MathUtils.damp(npc.mesh.rotation.y, angle, 12, delta);
      }

      npc.mesh.updateAnimation(delta, true);
    });
  };

  return {
    scene,
    npcShoppers,
    stallInteractZones,
    firstPersonCart,
    update,
  };
}
