import * as THREE from 'three';
import { CharacterConfig } from '../types/game';

export interface AnimatedCharacterMesh extends THREE.Group {
  updateAnimation: (delta: number, isMoving: boolean) => void;
  setTrolleyVisible: (visible: boolean) => void;
  setCartItemsCount?: (count: number, itemIds?: string[]) => void;
}

export function buildShoppingTrolley(color: string = '#f97316'): THREE.Group {
  const trolley = new THREE.Group();
  trolley.name = 'ShoppingTrolley';

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.85,
    roughness: 0.2,
  });

  const gripMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.5,
    metalness: 0.1,
  });

  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.8,
  });

  // Base frame
  const baseFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.04, 0.9),
    chromeMat
  );
  baseFrame.position.y = 0.22;
  trolley.add(baseFrame);

  // Lower wire tray
  const lowerTray = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.02, 0.75),
    new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.7, roughness: 0.3, wireframe: true })
  );
  lowerTray.position.y = 0.24;
  trolley.add(lowerTray);

  // 4 Wheels
  const wheelGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12);
  wheelGeom.rotateZ(Math.PI / 2);
  const wheelPositions = [
    [-0.32, 0.07, -0.38],
    [0.32, 0.07, -0.38],
    [-0.32, 0.07, 0.38],
    [0.32, 0.07, 0.38],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    trolley.add(wheel);
  });

  // Vertical support uprights
  const uprightGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.75, 8);
  const uprightCols = [
    [-0.32, 0.55, -0.35],
    [0.32, 0.55, -0.35],
    [-0.32, 0.55, 0.35],
    [0.32, 0.55, 0.35],
  ];
  uprightCols.forEach(([x, y, z]) => {
    const col = new THREE.Mesh(uprightGeom, chromeMat);
    col.position.set(x, y, z);
    trolley.add(col);
  });

  // Main basket (slightly tapered box)
  const basketWireMat = new THREE.MeshStandardMaterial({
    color: 0xbbbbbb,
    metalness: 0.8,
    roughness: 0.25,
    wireframe: true,
  });
  const basket = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.45, 0.85),
    basketWireMat
  );
  basket.position.set(0, 0.72, 0);
  trolley.add(basket);

  // Top rim of basket
  const topRim = new THREE.Mesh(
    new THREE.BoxGeometry(0.74, 0.03, 0.87),
    chromeMat
  );
  topRim.position.set(0, 0.94, 0);
  trolley.add(topRim);

  // Handlebar extending back
  const handleSupportLeft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8),
    chromeMat
  );
  handleSupportLeft.position.set(-0.32, 0.98, -0.48);
  handleSupportLeft.rotation.x = Math.PI / 4;
  trolley.add(handleSupportLeft);

  const handleSupportRight = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8),
    chromeMat
  );
  handleSupportRight.position.set(0.32, 0.98, -0.48);
  handleSupportRight.rotation.x = Math.PI / 4;
  trolley.add(handleSupportRight);

  // Grip bar
  const grip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.68, 12),
    gripMat
  );
  grip.position.set(0, 1.05, -0.55);
  grip.rotation.z = Math.PI / 2;
  trolley.add(grip);

  // Front bumper
  const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(0.74, 0.05, 0.06),
    gripMat
  );
  bumper.position.set(0, 0.72, 0.44);
  trolley.add(bumper);

  // Dynamic 3D grocery items group inside the basket
  const basketItemsGroup = new THREE.Group();
  basketItemsGroup.name = 'BasketItemsGroup';
  basketItemsGroup.position.set(0, 0.65, 0);
  trolley.add(basketItemsGroup);

  // Update visual products in cart
  (trolley as any).updateItems = (count: number) => {
    while (basketItemsGroup.children.length > 0) {
      basketItemsGroup.remove(basketItemsGroup.children[0]);
    }
    const itemColors = [0xef4444, 0x10b981, 0x3b82f6, 0xf59e0b, 0x8b5cf6, 0xec4899, 0x14b8a6, 0xf97316];
    const totalToRender = Math.min(count, 14);
    for (let i = 0; i < totalToRender; i++) {
      const col = itemColors[i % itemColors.length];
      const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.35, metalness: 0.1 });
      let mesh: THREE.Mesh;
      if (i % 3 === 0) {
        // Cereal or stationery box
        mesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.12), mat);
      } else if (i % 3 === 1) {
        // Can or bottle
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 10), mat);
      } else {
        // Fresh fruit / snack
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), mat);
      }
      mesh.castShadow = true;
      const row = Math.floor(i / 3);
      const colIdx = i % 3;
      const x = (colIdx - 1) * 0.2 + (Math.sin(i * 1.5) * 0.03);
      const y = 0.08 + Math.floor(i / 6) * 0.14;
      const z = (row % 2 - 0.5) * 0.3 + (Math.cos(i * 1.5) * 0.03);
      mesh.position.set(x, y, z);
      mesh.rotation.y = (i * 0.45);
      mesh.rotation.z = (Math.sin(i * 2) * 0.1);
      basketItemsGroup.add(mesh);
    }
  };

  return trolley;
}

export function buildCharacter(config: CharacterConfig, withTrolley: boolean = true): AnimatedCharacterMesh {
  const root = new THREE.Group() as AnimatedCharacterMesh;
  root.name = 'Character';

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.skinTone),
    roughness: 0.6,
    metalness: 0.05,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.hairColor),
    roughness: 0.7,
    metalness: 0.1,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.shirtColor),
    roughness: 0.65,
    metalness: 0.05,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.pantsColor),
    roughness: 0.7,
    metalness: 0.05,
  });

  const shoesMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.shoesColor),
    roughness: 0.5,
    metalness: 0.1,
  });

  // Hips / Pelvis
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.95;
  root.add(pelvis);

  // Torso
  const torsoGeom = new THREE.BoxGeometry(0.48, 0.62, 0.28);
  const torso = new THREE.Mesh(torsoGeom, shirtMat);
  torso.position.y = 0.35;
  torso.castShadow = true;
  pelvis.add(torso);

  // Head Group
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.8;
  pelvis.add(headGroup);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.12, 10), skinMat);
  neck.position.y = -0.1;
  headGroup.add(neck);

  // Head
  const headGeom = new THREE.BoxGeometry(0.32, 0.34, 0.32);
  const head = new THREE.Mesh(headGeom, skinMat);
  head.position.y = 0.12;
  head.castShadow = true;
  headGroup.add(head);

  // Face Features (Eyes & Mouth)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
  const eyeGeom = new THREE.SphereGeometry(0.035, 8, 8);
  
  const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
  leftEye.position.set(-0.08, 0.14, 0.165);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
  rightEye.position.set(0.08, 0.14, 0.165);
  headGroup.add(rightEye);

  // Smile / Mouth
  const smile = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.01), eyeMat);
  smile.position.set(0, 0.05, 0.165);
  headGroup.add(smile);

  // Hair
  const hairGroup = new THREE.Group();
  headGroup.add(hairGroup);

  if (config.hairStyle === 'short' || config.hairStyle === 'spiky') {
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.36), hairMat);
    hairTop.position.set(0, 0.3, 0);
    hairGroup.add(hairTop);

    if (config.hairStyle === 'spiky') {
      for (let i = -0.12; i <= 0.12; i += 0.08) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 4), hairMat);
        spike.position.set(i, 0.4, 0);
        hairGroup.add(spike);
      }
    }
  } else if (config.hairStyle === 'curly' || config.hairStyle === 'bob') {
    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), hairMat);
    hairTop.position.set(0, 0.22, -0.04);
    hairGroup.add(hairTop);
    const sideLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.34), hairMat);
    sideLeft.position.set(-0.18, 0.12, 0);
    hairGroup.add(sideLeft);
    const sideRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.34), hairMat);
    sideRight.position.set(0.18, 0.12, 0);
    hairGroup.add(sideRight);
  } else if (config.hairStyle === 'ponytail') {
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.36), hairMat);
    hairTop.position.set(0, 0.3, 0);
    hairGroup.add(hairTop);
    const pony = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.28, 8), hairMat);
    pony.position.set(0, 0.18, -0.22);
    pony.rotation.x = -Math.PI / 4;
    hairGroup.add(pony);
  }

  // Accessories
  if (config.accessory === 'glasses' || config.accessory === 'sunglasses') {
    const frameColor = config.accessory === 'sunglasses' ? 0x0f172a : 0xd97706;
    const lensColor = config.accessory === 'sunglasses' ? 0x020617 : 0x93c5fd;
    const glassesGroup = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: frameColor, metalness: 0.8, roughness: 0.2 });
    const lensMat = new THREE.MeshStandardMaterial({
      color: lensColor,
      transparent: true,
      opacity: config.accessory === 'sunglasses' ? 0.9 : 0.5,
    });
    const leftLens = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.02), lensMat);
    leftLens.position.set(-0.08, 0.14, 0.18);
    glassesGroup.add(leftLens);
    const rightLens = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.02), lensMat);
    rightLens.position.set(0.08, 0.14, 0.18);
    glassesGroup.add(rightLens);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.015, 0.01), frameMat);
    bridge.position.set(0, 0.14, 0.18);
    glassesGroup.add(bridge);
    headGroup.add(glassesGroup);
  } else if (config.accessory === 'headphones') {
    const hpMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4, roughness: 0.4 });
    const hpBand = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 16, Math.PI), hpMat);
    hpBand.position.set(0, 0.16, 0);
    hpBand.rotation.z = Math.PI;
    headGroup.add(hpBand);
    const leftCup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12), hpMat);
    leftCup.position.set(-0.2, 0.14, 0);
    leftCup.rotation.z = Math.PI / 2;
    headGroup.add(leftCup);
    const rightCup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12), hpMat);
    rightCup.position.set(0.2, 0.14, 0);
    rightCup.rotation.z = Math.PI / 2;
    headGroup.add(rightCup);
  } else if (config.accessory === 'cap') {
    const capMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.6 });
    const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
    capDome.position.set(0, 0.24, 0);
    headGroup.add(capDome);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.18), capMat);
    visor.position.set(0, 0.24, 0.2);
    headGroup.add(visor);
  }

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.32, 0.58, 0);
  pelvis.add(leftArm);
  const leftSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.14), shirtMat);
  leftSleeve.position.y = -0.16;
  leftArm.add(leftSleeve);
  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), skinMat);
  leftHand.position.y = -0.38;
  leftArm.add(leftHand);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.32, 0.58, 0);
  pelvis.add(rightArm);
  const rightSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.14), shirtMat);
  rightSleeve.position.y = -0.16;
  rightArm.add(rightSleeve);
  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), skinMat);
  rightHand.position.y = -0.38;
  rightArm.add(rightHand);

  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.15, 0, 0);
  pelvis.add(leftLeg);
  const leftThigh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.68, 0.18), pantsMat);
  leftThigh.position.y = -0.34;
  leftThigh.castShadow = true;
  leftLeg.add(leftThigh);
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.28), shoesMat);
  leftShoe.position.set(0, -0.68, 0.04);
  leftShoe.castShadow = true;
  leftLeg.add(leftShoe);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.15, 0, 0);
  pelvis.add(rightLeg);
  const rightThigh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.68, 0.18), pantsMat);
  rightThigh.position.y = -0.34;
  rightThigh.castShadow = true;
  rightLeg.add(rightThigh);
  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.28), shoesMat);
  rightShoe.position.set(0, -0.68, 0.04);
  rightShoe.castShadow = true;
  rightLeg.add(rightShoe);

  // Trolley
  const trolley = buildShoppingTrolley(config.trolleyColor);
  trolley.position.set(0, 0, 0.95);
  root.add(trolley);
  trolley.visible = withTrolley;

  // Posed arms for pushing trolley
  if (withTrolley) {
    leftArm.rotation.x = Math.PI / 3;
    leftArm.rotation.y = -Math.PI / 16;
    rightArm.rotation.x = Math.PI / 3;
    rightArm.rotation.y = Math.PI / 16;
  }

  // Animation state
  let walkCycle = 0;
  root.updateAnimation = (delta: number, isMoving: boolean) => {
    if (isMoving) {
      walkCycle += delta * 10;
      const legAngle = Math.sin(walkCycle) * 0.65;
      leftLeg.rotation.x = legAngle;
      rightLeg.rotation.x = -legAngle;

      // Slight head bob and hip bounce
      pelvis.position.y = 0.95 + Math.abs(Math.sin(walkCycle * 2)) * 0.05;

      if (!trolley.visible) {
        leftArm.rotation.x = -legAngle * 0.8;
        rightArm.rotation.x = legAngle * 0.8;
        headGroup.rotation.y = 0;
        pelvis.rotation.z = 0;
      } else {
        // Subtle cart rattle
        trolley.position.y = Math.sin(walkCycle * 4) * 0.01;
      }
    } else {
      // Idle breathing & waiting poses
      walkCycle += delta * 2;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      pelvis.position.y = 0.95 + Math.sin(walkCycle) * 0.015;

      if (!trolley.visible) {
        // SELLER WAITING AT STORE COUNTER ANIMATION:
        // Posed arms resting on counter with subtle breathing motions
        leftArm.rotation.x = Math.PI / 4.2 + Math.sin(walkCycle * 1.5) * 0.02;
        leftArm.rotation.y = -Math.PI / 14;
        rightArm.rotation.x = Math.PI / 4.2 + Math.cos(walkCycle * 1.5) * 0.02;
        rightArm.rotation.y = Math.PI / 14;

        // Looking around the store patiently waiting for customers
        headGroup.rotation.y = Math.sin(walkCycle * 0.45) * 0.35;
        headGroup.rotation.x = Math.sin(walkCycle * 0.9) * 0.04;

        // Gentle weight shifting while standing at counter
        pelvis.rotation.z = Math.sin(walkCycle * 0.35) * 0.035;
      } else {
        headGroup.rotation.y = 0;
        pelvis.rotation.z = 0;
      }
    }
  };

  root.setTrolleyVisible = (visible: boolean) => {
    trolley.visible = visible;
    if (visible) {
      leftArm.rotation.x = Math.PI / 3;
      rightArm.rotation.x = Math.PI / 3;
    } else {
      leftArm.rotation.x = 0;
      rightArm.rotation.x = 0;
    }
  };

  root.setCartItemsCount = (count: number) => {
    if ((trolley as any).updateItems) {
      (trolley as any).updateItems(count);
    }
  };

  return root;
}
