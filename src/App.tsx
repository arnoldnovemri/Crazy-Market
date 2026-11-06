/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CharacterConfig, PlayerRole, BuyerState, MarketStall } from './types/game';
import { INITIAL_SHOPPING_LIST, MARKET_STALLS } from './utils/gameData';
import { CrazyMarket3D } from './components/CrazyMarket3D';
import { CharacterCreator } from './components/CharacterCreator';
import { BuyerHUD } from './components/BuyerHUD';
import { SellerHUD } from './components/SellerHUD';
import { StallModal } from './components/StallModal';
import { MiniGameModal } from './components/MiniGameModal';
import { FormulaGuideModal } from './components/FormulaGuideModal';
import { MovementActionControls } from './components/MovementActionControls';
import { PauseModal } from './components/PauseModal';
import { EndGameModal } from './components/EndGameModal';
import { sounds } from './utils/audio';

const DEFAULT_CHARACTER: CharacterConfig = {
  name: 'Alex',
  gender: 'boy',
  skinTone: '#fed7aa',
  hairStyle: 'short',
  hairColor: '#1e293b',
  shirtColor: '#059669',
  shirtStyle: 'tshirt',
  pantsColor: '#1e3a8a',
  shoesColor: '#f8fafc',
  accessory: 'headphones',
  trolleyColor: '#f97316',
};

export default function App() {
  const [gameMode, setGameMode] = useState<'preview' | 'playing'>('preview');
  const [playerRole, setPlayerRole] = useState<PlayerRole>('buyer');
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig>(DEFAULT_CHARACTER);

  // Buyer Game State
  const [buyerState, setBuyerState] = useState<BuyerState>({
    budget: 200000,
    wallet: 200000,
    shoppingList: INITIAL_SHOPPING_LIST.map((item) => ({ ...item })),
    totalSaved: 0,
    unlockedMiniGameDiscounts: {},
    cartItems: [],
  });

  // Seller Performance Metrics
  const [sellerMetrics, setSellerMetrics] = useState({
    roundsCompleted: 0,
    totalProfit: 0,
    stars: 5.0,
  });

  // Modals & HUD states
  const [nearStall, setNearStall] = useState<{ id: string; name: string } | null>(null);
  const [activeStall, setActiveStall] = useState<MarketStall | null>(null);
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const [miniGameTarget, setMiniGameTarget] = useState<{
    stallId: string;
    itemId: string;
    bonusPercent: number;
    itemName: string;
  } | null>(null);

  // Movement & Directional controls (Depan, Belakang, Kiri, Kanan, Putar)
  const [virtualDirection, setVirtualDirection] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    turnLeft: false,
    turnRight: false,
  });

  const handleStartGame = (config: CharacterConfig, role: PlayerRole) => {
    setCharacterConfig(config);
    setPlayerRole(role);
    setGameMode('playing');
    setIsPaused(false);
    setIsEnded(false);
    sounds.startMarketAmbience();

    // Reset buyer state
    setBuyerState({
      budget: 200000,
      wallet: 200000,
      shoppingList: INITIAL_SHOPPING_LIST.map((item) => ({ ...item })),
      totalSaved: 0,
      unlockedMiniGameDiscounts: {},
      cartItems: [],
    });

    // Reset seller state
    setSellerMetrics({
      roundsCompleted: 0,
      totalProfit: 0,
      stars: 5.0,
    });
  };

  const handleGoHome = () => {
    sounds.playClick();
    setGameMode('preview');
    setIsPaused(false);
    setIsEnded(false);
    setActiveStall(null);
    setMiniGameTarget(null);
    setIsFormulaOpen(false);
  };

  const handleRestart = () => {
    sounds.playClick();
    setIsPaused(false);
    setIsEnded(false);
    setActiveStall(null);
    setMiniGameTarget(null);

    if (playerRole === 'buyer') {
      setBuyerState({
        budget: 200000,
        wallet: 200000,
        shoppingList: INITIAL_SHOPPING_LIST.map((item) => ({ ...item })),
        totalSaved: 0,
        unlockedMiniGameDiscounts: {},
        cartItems: [],
      });
    } else {
      setSellerMetrics({
        roundsCompleted: 0,
        totalProfit: 0,
        stars: 5.0,
      });
    }
  };

  const handleOpenStall = (stallId: string) => {
    const stall = MARKET_STALLS.find((s) => s.id === stallId);
    if (stall) {
      setActiveStall(stall);
    }
  };

  const handleBuyItem = (
    itemId: string,
    qty: number,
    unitCost: number,
    stallName: string,
    savings: number
  ) => {
    setBuyerState((prev) => {
      const totalCost = unitCost * qty;
      const nextWallet = Math.max(0, prev.wallet - totalCost);
      const nextSaved = prev.totalSaved + savings;

      // Update shopping list progress
      const nextList = prev.shoppingList.map((item) => {
        if (item.itemId === itemId) {
          const newQty = item.boughtQty + qty;
          return {
            ...item,
            boughtQty: newQty,
            totalSpent: item.totalSpent + totalCost,
          };
        }
        return item;
      });

      // Add to cart
      const nextCart = [
        ...prev.cartItems,
        {
          itemId,
          qty,
          unitPrice: unitCost,
          stallName,
        },
      ];

      return {
        ...prev,
        wallet: nextWallet,
        totalSaved: nextSaved,
        shoppingList: nextList,
        cartItems: nextCart,
      };
    });
  };

  const handleOpenMiniGame = (
    stallId: string,
    itemId: string,
    bonusPercent: number,
    itemName: string
  ) => {
    setMiniGameTarget({ stallId, itemId, bonusPercent, itemName });
  };

  const handleMiniGameSuccess = () => {
    if (!miniGameTarget) return;
    const key = `${miniGameTarget.stallId}_${miniGameTarget.itemId}`;
    setBuyerState((prev) => ({
      ...prev,
      unlockedMiniGameDiscounts: {
        ...prev.unlockedMiniGameDiscounts,
        [key]: true,
      },
    }));
    setMiniGameTarget(null);
  };

  const handleVirtualDirection = (
    dir: 'forward' | 'backward' | 'left' | 'right' | 'turnLeft' | 'turnRight',
    active: boolean
  ) => {
    setVirtualDirection((prev) => ({ ...prev, [dir]: active }));
  };

  // Dedicated action button "Ambil"
  const handleAmbil = () => {
    sounds.playClick();
    if (playerRole === 'buyer') {
      if (nearStall) {
        handleOpenStall(nearStall.id);
      } else {
        // Find nearest stall to inspect
        const firstStall = MARKET_STALLS[0];
        handleOpenStall(firstStall.id);
      }
    } else {
      // Seller mode: pick customer items / ding register
      sounds.playCashRegister();
    }
  };

  // Dedicated action button "Hitung"
  const handleHitung = () => {
    sounds.playClick();
    if (playerRole === 'buyer') {
      setIsFormulaOpen(true);
    } else {
      // In Seller mode, trigger or open formula guide & ledger
      setIsFormulaOpen(true);
    }
  };

  const handleInteractKey = () => {
    if (nearStall && !activeStall && !miniGameTarget && !isFormulaOpen) {
      sounds.playClick();
      handleOpenStall(nearStall.id);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D Supermarket Scene Canvas */}
      <CrazyMarket3D
        gameMode={gameMode}
        playerRole={playerRole}
        playerConfig={characterConfig}
        cartCount={buyerState.cartItems.reduce((acc, item) => acc + item.qty, 0)}
        onNearStallChange={setNearStall}
        virtualDirection={virtualDirection}
        onInteractKeyPressed={handleInteractKey}
      />

      {/* Screen 1: Landing Page & Live 3D Character Customization */}
      {gameMode === 'preview' && (
        <CharacterCreator
          initialConfig={characterConfig}
          onChangeConfig={setCharacterConfig}
          onStartGame={handleStartGame}
        />
      )}

      {/* Screen 2: First-Person Gameplay for Buyer or Seller */}
      {gameMode === 'playing' && (
        <>
          {playerRole === 'buyer' ? (
            <BuyerHUD
              player={characterConfig}
              buyerState={buyerState}
              nearStall={nearStall}
              onOpenStall={handleOpenStall}
              onOpenFormula={() => setIsFormulaOpen(true)}
              onPause={() => setIsPaused(true)}
              onEndGame={() => setIsEnded(true)}
              onGoHome={handleGoHome}
              onRestart={handleRestart}
            />
          ) : (
            <SellerHUD
              player={characterConfig}
              onOpenFormula={() => setIsFormulaOpen(true)}
              onPause={() => setIsPaused(true)}
              onEndGame={() => setIsEnded(true)}
              onGoHome={handleGoHome}
              onRestart={handleRestart}
              onUpdateMetrics={setSellerMetrics}
            />
          )}

          {/* Movement Controls (Depan, Belakang, Kiri, Kanan, Putar) & Action Buttons (Ambil, Hitung) */}
          <MovementActionControls
            onDirectionPress={handleVirtualDirection}
            onAmbil={handleAmbil}
            onHitung={handleHitung}
            role={playerRole}
            isNearStall={!!nearStall}
          />
        </>
      )}

      {/* Modal: Market Stall Shopping & Price Comparison */}
      {activeStall && (
        <StallModal
          stall={activeStall}
          buyerState={buyerState}
          onBuyItem={handleBuyItem}
          onOpenMiniGame={handleOpenMiniGame}
          onClose={() => setActiveStall(null)}
        />
      )}

      {/* Modal: Double Discount Mini-Game */}
      {miniGameTarget && (
        <MiniGameModal
          stallName={
            MARKET_STALLS.find((s) => s.id === miniGameTarget.stallId)?.name || 'Market Stall'
          }
          itemName={miniGameTarget.itemName}
          bonusPercent={miniGameTarget.bonusPercent}
          onSuccess={handleMiniGameSuccess}
          onClose={() => setMiniGameTarget(null)}
        />
      )}

      {/* Modal: Social Arithmetic Formula Handbook */}
      {isFormulaOpen && (
        <FormulaGuideModal onClose={() => setIsFormulaOpen(false)} />
      )}

      {/* Modal: Pause Screen with Resume, End Game, Restart, Home */}
      {isPaused && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onEndGame={() => {
            setIsPaused(false);
            setIsEnded(true);
          }}
          onRestart={handleRestart}
          onGoHome={handleGoHome}
        />
      )}

      {/* Modal: End Game Session Summary Screen */}
      {isEnded && (
        <EndGameModal
          playerRole={playerRole}
          player={characterConfig}
          buyerState={buyerState}
          sellerMetrics={sellerMetrics}
          onRestart={handleRestart}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  );
}
