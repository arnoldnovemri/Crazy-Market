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
  onNearStallChange,
  virtualDirection,
  onInteractKeyPressed,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const updatePreviewCharacterRef = useRef<((cfg: CharacterConfig) => void) | null>(null);

  // Store references for continuous animation
  const stateRef = useRef<{
    gameMode: 'preview' | 'playing';
    playerRole: PlayerRole;
    playerConfig: CharacterConfig;
    virtualDirection?: typeof virtualDirection;
    nearStall: { id: string; name: string } | null;
  }>({
    gameMode,
    playerRole,
    playerConfig,
    virtualDirection,
    nearStall: null,
  });

  // Keep stateRef synced
  useEffect(() => {
    stateRef.current.gameMode = gameMode;
    stateRef.current.playerRole = playerRole;
    stateRef.current.playerConfig = playerConfig;
    stateRef.current.virtualDirection = virtualDirection;
    // Dynamically update the 3D preview character when player customizes hair/skin/clothes/props!
    if (updatePreviewCharacterRef.current) {
      updatePreviewCharacterRef.current(playerConfig);
    }
  }, [gameMode, playerRole, playerConfig, virtualDirection]);

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

    // 5. First-Person Rig
    // Player camera has the first-person shopping cart attached as a child!
    camera.add(bundle.firstPersonCart);
    scene.add(camera);

    // Player position & movement kinematics (Buyer)
    const buyerPos = new THREE.Vector3(0, 1.6, 10); // Start near south entrance
    // Player position & movement kinematics (Seller)
    const sellerPos = new THREE.Vector3(0, 1.6, -8.2); // Start behind main counter

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
        bundle.firstPersonCart.visible = false;

        // Frame the custom character so it is prominently visible beside/above customization UI
        const isNarrow = container.clientWidth < 768;
        const targetX = isNarrow ? 0 : -0.9;
        previewPedestal.position.set(targetX, 0, 0);
        previewPedestal.rotation.y += delta * 0.7;
        if (previewCharacter) {
          previewCharacter.updateAnimation(delta, false);
        }

        camera.position.set(targetX, 1.45, 3.2);
        camera.lookAt(targetX, 1.05, 0);
      } else {
        // PLAYING MODE
        previewPedestal.visible = false;
        const activePos = currentRole === 'buyer' ? buyerPos : sellerPos;
        bundle.firstPersonCart.visible = currentRole === 'buyer';

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
          const speed = currentRole === 'buyer' ? 6.0 : 3.5;
          const forward = new THREE.Vector3(-Math.sin(playerYaw), 0, -Math.cos(playerYaw));
          const right = new THREE.Vector3(Math.cos(playerYaw), 0, -Math.sin(playerYaw));

          const moveVec = new THREE.Vector3()
            .addScaledVector(forward, moveFwd)
            .addScaledVector(right, moveSide)
            .normalize()
            .multiplyScalar(speed * delta);

          activePos.add(moveVec);

          if (currentRole === 'buyer') {
            // Bounds inside supermarket room
            activePos.x = Math.max(-16, Math.min(16, activePos.x));
            activePos.z = Math.max(-16, Math.min(16, activePos.z));
          } else {
            // Bounds behind stall counter
            activePos.x = Math.max(-2.5, Math.min(2.5, activePos.x));
            activePos.z = Math.max(-9.2, Math.min(-7.2, activePos.z));
          }

          headBob += delta * 12;
          stepTimer += delta;
          if (stepTimer > 0.35) {
            sounds.playFootstep();
            if (currentRole === 'buyer') {
              sounds.playCartWheel();
            }
            stepTimer = 0;
          }
        }

        // Camera position with head-bob
        const bobOffset = isMoving ? Math.sin(headBob) * 0.04 : Math.sin(clock.getElapsedTime() * 1.5) * 0.01;
        camera.position.set(activePos.x, 1.6 + bobOffset, activePos.z);

        camera.rotation.order = 'YXZ';
        camera.rotation.y = playerYaw;
        camera.rotation.x = playerPitch;

        if (currentRole === 'buyer') {
          bundle.firstPersonCart.position.y = -0.65 + (isMoving ? Math.sin(headBob * 2) * 0.015 : 0);

          // Check proximity to market stalls
          let detectedStall: { id: string; name: string } | null = null;
          for (const zone of bundle.stallInteractZones) {
            const dist = Math.hypot(activePos.x - zone.x, activePos.z - zone.z);
            if (dist < zone.radius) {
              detectedStall = { id: zone.id, name: zone.name };
              break;
            }
          }

          if (detectedStall?.id !== stateRef.current.nearStall?.id) {
            stateRef.current.nearStall = detectedStall;
            onNearStallChange?.(detectedStall);
          }
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
