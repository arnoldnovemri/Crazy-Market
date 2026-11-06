import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CharacterConfig, PlayerRole } from '../types/game';
import { buildSupermarketScene, SupermarketSceneBundle } from '../3d/supermarketBuilder';
import { buildCharacter, AnimatedCharacterMesh } from '../3d/characterBuilder';
import { sounds } from '../utils/audio';

interface CrazyMarket3DProps {
  gameMode: 'preview' | 'playing';
  playerRole: PlayerRole;
  playerConfig: CharacterConfig;
  cartCount?: number;
  onNearStallChange?: (stall: { id: string; name: string } | null) => void;
  virtualDirection?: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    turnLeft: boolean;
    turnRight: boolean;
  };
  onInteractKeyPressed?: () => void;
}

export const CrazyMarket3D: React.FC<CrazyMarket3DProps> = ({
  gameMode,
  playerRole,
  playerConfig,
  cartCount = 0,
  onNearStallChange,
  virtualDirection,
  onInteractKeyPressed,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const updatePreviewCharacterRef = useRef<((cfg: CharacterConfig) => void) | null>(null);
  const updatePlayingCharacterRef = useRef<((cfg: CharacterConfig, role: PlayerRole, cartItems: number) => void) | null>(null);
  const updateCartItemsRef = useRef<((count: number) => void) | null>(null);

  // Store references for continuous animation
  const stateRef = useRef<{
    gameMode: 'preview' | 'playing';
    playerRole: PlayerRole;
    playerConfig: CharacterConfig;
    cartCount: number;
    virtualDirection?: typeof virtualDirection;
    nearStall: { id: string; name: string } | null;
  }>({
    gameMode,
    playerRole,
    playerConfig,
    cartCount,
    virtualDirection,
    nearStall: null,
  });

  // Keep stateRef synced
  useEffect(() => {
    stateRef.current.gameMode = gameMode;
    stateRef.current.playerRole = playerRole;
    stateRef.current.playerConfig = playerConfig;
    stateRef.current.cartCount = cartCount;
    stateRef.current.virtualDirection = virtualDirection;
    // Dynamically update the 3D preview character when player customizes hair/skin/clothes/props!
    if (updatePreviewCharacterRef.current) {
      updatePreviewCharacterRef.current(playerConfig);
    }
    // Dynamically update the 3D playing character for Third-Person View!
    if (updatePlayingCharacterRef.current) {
      updatePlayingCharacterRef.current(playerConfig, playerRole, cartCount);
    }
    if (updateCartItemsRef.current) {
      updateCartItemsRef.current(cartCount);
    }
  }, [gameMode, playerRole, playerConfig, cartCount, virtualDirection]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(renderer.domElement);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    // 3. Environment & Scene Setup
    const bundle: SupermarketSceneBundle = buildSupermarketScene(playerConfig);
    const scene = bundle.scene;

    // Mandatory RoomEnvironment for metallic & reflections
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // Graceful fallback if PMREM isn't supported in test environment
    }

    // 4. Character Model for Preview Mode (Turntable)
    let previewCharacter: AnimatedCharacterMesh | null = null;
    const previewPedestal = new THREE.Group();
    const pedestalMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 0.2, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.5 })
    );
    pedestalMesh.position.y = 0.1;
    previewPedestal.add(pedestalMesh);
    scene.add(previewPedestal);

    const updatePreviewCharacter = (cfg: CharacterConfig) => {
      if (previewCharacter) {
        previewPedestal.remove(previewCharacter);
      }
      previewCharacter = buildCharacter(cfg, true);
      previewCharacter.position.set(0, 0.2, 0);
      previewPedestal.add(previewCharacter);
    };

    updatePreviewCharacterRef.current = updatePreviewCharacter;
    updatePreviewCharacter(playerConfig);

    // 5. Playing Character Model for Third-Person View (TPV)
    bundle.firstPersonCart.visible = false;
    scene.add(camera);

    let playingCharacter: AnimatedCharacterMesh | null = null;

    const updatePlayingCharacter = (cfg: CharacterConfig, role: PlayerRole, cartItems: number) => {
      if (playingCharacter) {
        scene.remove(playingCharacter);
      }
      playingCharacter = buildCharacter(cfg, role === 'buyer');
      playingCharacter.visible = stateRef.current.gameMode === 'playing';
      if (role === 'buyer') {
        playingCharacter.setCartItemsCount?.(cartItems);
      }
      scene.add(playingCharacter);
    };

    updatePlayingCharacterRef.current = updatePlayingCharacter;
    updatePlayingCharacter(playerConfig, playerRole, cartCount);

    updateCartItemsRef.current = (count: number) => {
      if (playingCharacter) {
        playingCharacter.setCartItemsCount?.(count);
      }
    };

    // Customer Shopper NPC standing in front of the counter in Seller mode
    const customerConfig: CharacterConfig = {
      name: 'Maya',
      gender: 'girl',
      skinTone: '#fed7aa',
      hairStyle: 'ponytail',
      hairColor: '#451a03',
      shirtColor: '#f59e0b',
      shirtStyle: 'tshirt',
      pantsColor: '#1e3a8a',
      shoesColor: '#ffffff',
      accessory: 'none',
      trolleyColor: '#06b6d4',
    };
    const counterCustomer = buildCharacter(customerConfig, true);
    counterCustomer.position.set(0, 0, -5.9);
    counterCustomer.rotation.y = 0; // facing the counter and seller
    counterCustomer.visible = false;
    scene.add(counterCustomer);

    // Player ground position (Buyer)
    const buyerPos = new THREE.Vector3(0, 0, 10); // Start near south entrance on floor (y = 0)
    // Player ground position (Seller)
    const sellerPos = new THREE.Vector3(0, 0, -8.2); // Start behind main counter on floor (y = 0)

    let playerYaw = 0; // rotation around Y (facing forward north)
    let playerPitch = 0; // look up/down

    let isMoving = false;
    let stepTimer = 0;
    let headBob = 0;

    // Keyboard state
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === 'KeyE') {
        onInteractKeyPressed?.();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse drag-to-look or pointer lock
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (stateRef.current.gameMode !== 'playing') return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || stateRef.current.gameMode !== 'playing') return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      playerYaw -= dx * 0.004;
      playerPitch = Math.max(-0.6, Math.min(0.6, playerPitch - dy * 0.004));
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Clock
    const clock = new THREE.Clock();
    let frameId = 0;

    // Software WebGL pacing helper
    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    // Main Tick Loop
    const tick = () => {
      const delta = Math.min(0.1, clock.getDelta());
      const currentMode = stateRef.current.gameMode;
      const currentRole = stateRef.current.playerRole;
      const vDir = stateRef.current.virtualDirection;

      // Update animated NPC shoppers running in aisles
      bundle.update(delta);

      if (currentMode === 'preview') {
        // PREVIEW MODE: Camera views the customized turntable character
        previewPedestal.visible = true;
        if (playingCharacter) playingCharacter.visible = false;
        bundle.firstPersonCart.visible = false;

        // Frame the custom character prominently on the left side
        const isNarrow = container.clientWidth < 768;
        const targetX = isNarrow ? 0 : -1.35;
        previewPedestal.position.set(targetX, 0, 0);
        previewPedestal.rotation.y += delta * 0.7;
        if (previewCharacter) {
          previewCharacter.updateAnimation(delta, false);
        }

        camera.position.set(targetX, 1.45, 3.2);
        camera.lookAt(targetX, 1.05, 0);
      } else {
        // PLAYING MODE: THIRD-PERSON VIEW (TPV)
        previewPedestal.visible = false;
        if (playingCharacter) playingCharacter.visible = true;
        bundle.firstPersonCart.visible = false;

        if (currentRole === 'buyer') {
          counterCustomer.visible = false;
          // Input collection (W/S/A/D, arrows, virtual directional controls)
          let moveFwd = 0;
          let moveSide = 0;

          if (keys['KeyW'] || keys['ArrowUp'] || vDir?.forward) moveFwd += 1;
          if (keys['KeyS'] || keys['ArrowDown'] || vDir?.backward) moveFwd -= 1;
          if (keys['KeyA'] || keys['ArrowLeft'] || vDir?.left) moveSide -= 1;
          if (keys['KeyD'] || keys['ArrowRight'] || vDir?.right) moveSide += 1;

          if (vDir?.turnLeft) playerYaw += delta * 2.2;
          if (vDir?.turnRight) playerYaw -= delta * 2.2;

          isMoving = moveFwd !== 0 || moveSide !== 0;

          if (isMoving) {
            const speed = 6.2;
            const forward = new THREE.Vector3(-Math.sin(playerYaw), 0, -Math.cos(playerYaw));
            const right = new THREE.Vector3(Math.cos(playerYaw), 0, -Math.sin(playerYaw));

            const moveVec = new THREE.Vector3()
              .addScaledVector(forward, moveFwd)
              .addScaledVector(right, moveSide)
              .normalize()
              .multiplyScalar(speed * delta);

            buyerPos.add(moveVec);

            // Supermarket room boundaries
            buyerPos.x = Math.max(-15.5, Math.min(15.5, buyerPos.x));
            buyerPos.z = Math.max(-15.5, Math.min(15.5, buyerPos.z));

            headBob += delta * 12;
            stepTimer += delta;
            if (stepTimer > 0.35) {
              sounds.playFootstep();
              sounds.playCartWheel();
              stepTimer = 0;
            }
          }

          // Position player character on floor and animate walking/trolley
          if (playingCharacter) {
            playingCharacter.position.set(buyerPos.x, buyerPos.y, buyerPos.z);
            playingCharacter.rotation.y = playerYaw + Math.PI;
            playingCharacter.updateAnimation(delta, isMoving);
          }

          // Third-Person Camera trailing behind buyer character
          const camDist = 3.6;
          const camHeight = 2.15;
          const targetCamX = buyerPos.x + Math.sin(playerYaw) * camDist;
          const targetCamZ = buyerPos.z + Math.cos(playerYaw) * camDist;
          const targetCamY = buyerPos.y + camHeight + (isMoving ? Math.sin(headBob) * 0.025 : 0);

          camera.position.set(targetCamX, targetCamY, targetCamZ);

          // Camera looks forward through character and shopping cart
          const lookTarget = new THREE.Vector3(
            buyerPos.x - Math.sin(playerYaw) * 1.2,
            1.25,
            buyerPos.z - Math.cos(playerYaw) * 1.2
          );
          camera.lookAt(lookTarget);

          // Proximity detection for stalls
          let detectedStall: { id: string; name: string } | null = null;
          for (const zone of bundle.stallInteractZones) {
            const dist = Math.hypot(buyerPos.x - zone.x, buyerPos.z - zone.z);
            if (dist < zone.radius) {
              detectedStall = { id: zone.id, name: zone.name };
              break;
            }
          }

          if (detectedStall?.id !== stateRef.current.nearStall?.id) {
            stateRef.current.nearStall = detectedStall;
            onNearStallChange?.(detectedStall);
          }
        } else {
          // SELLER MODE: Third-Person Over-the-Shoulder View behind the counter
          let moveSide = 0;
          if (keys['KeyA'] || keys['ArrowLeft'] || vDir?.left) moveSide -= 1;
          if (keys['KeyD'] || keys['ArrowRight'] || vDir?.right) moveSide += 1;

          isMoving = moveSide !== 0;
          if (isMoving) {
            sellerPos.x += moveSide * 3.5 * delta;
            sellerPos.x = Math.max(-2.2, Math.min(2.2, sellerPos.x));
            stepTimer += delta;
            if (stepTimer > 0.4) {
              sounds.playFootstep();
              stepTimer = 0;
            }
          }

          if (playingCharacter) {
            playingCharacter.position.set(sellerPos.x, sellerPos.y, sellerPos.z);
            playingCharacter.rotation.y = Math.PI; // facing customers at front counter
            playingCharacter.updateAnimation(delta, isMoving);
          }

          // Customer shopper waiting at the counter
          counterCustomer.visible = true;
          counterCustomer.updateAnimation(delta, false);

          // Camera over the shoulder behind the seller
          const camX = sellerPos.x - 1.15;
          const camY = 2.15;
          const camZ = sellerPos.z - 2.4;
          camera.position.set(camX, camY, camZ);
          camera.lookAt(sellerPos.x + 0.3, 1.25, sellerPos.z + 2.5);
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    // Pre-warm shaders
    if (!isSoftwareGl) {
      try {
        renderer.compile(scene, camera);
      } catch {
        // ignore
      }
    }

    // Start loop
    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-slate-950"
    />
  );
};
