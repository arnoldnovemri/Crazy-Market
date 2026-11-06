import React, { useState } from 'react';
import {
  Wallet,
  PiggyBank,
  CheckCircle2,
  Circle,
  BookOpen,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Store,
  Sparkles,
  Trophy,
  Pause,
  Flag,
  Home,
} from 'lucide-react';
import { BuyerState, CharacterConfig, formatIDR } from '../types/game';
import { PRODUCT_CATALOG } from '../utils/gameData';
import { sounds } from '../utils/audio';

interface BuyerHUDProps {
  player: CharacterConfig;
  buyerState: BuyerState;
  nearStall: { id: string; name: string } | null;
  onOpenStall: (stallId: string) => void;
  onOpenFormula: () => void;
  onPause: () => void;
  onEndGame: () => void;
  onGoHome: () => void;
  onRestart: () => void;
}

export const BuyerHUD: React.FC<BuyerHUDProps> = ({
  player,
  buyerState,
  nearStall,
  onOpenStall,
  onOpenFormula,
  onPause,
  onEndGame,
  onGoHome,
  onRestart,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'cart'>('list');
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  // Check if shopping list is completely fulfilled
  const isGoalFinished = buyerState.shoppingList.every(
    (item) => item.boughtQty >= item.requiredQty
  );

  const completedCount = buyerState.shoppingList.filter(
    (item) => item.boughtQty >= item.requiredQty
  ).length;

  const toggleMute = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
  };

  return (
    <>
      {/* Top Header Bar */}
      <div className="fixed top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Player Profile & Wallet */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2.5 px-4 shadow-xl backdrop-blur-md pointer-events-auto">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-inner"
            style={{ backgroundColor: player.shirtColor }}
          >
            {player.name.charAt(0).toUpperCase() || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{player.name}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                Buyer
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs mt-0.5">
              <span className="flex items-center gap-1 font-mono font-bold text-emerald-400">
                <Wallet className="w-3.5 h-3.5" />
                {formatIDR(buyerState.wallet)}
              </span>
              <span className="text-slate-400">·</span>
              <span className="flex items-center gap-1 font-mono text-amber-300">
                <PiggyBank className="w-3.5 h-3.5" />
                Saved: {formatIDR(buyerState.totalSaved)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions (Top Right as requested: Pause, End, Home) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenFormula();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-sky-300 rounded-xl shadow-lg transition-colors"
            title="Formula Guide"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Formula</span>
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onPause();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-300 rounded-xl shadow-lg transition-colors"
            title="Pause Game"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Pause</span>
          </button>

          {/* End Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onEndGame();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-600/60 text-xs font-semibold text-rose-300 rounded-xl shadow-lg transition-colors"
            title="End Game Session"
          >
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">End</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleMute}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl shadow-lg transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Home Button (Rightmost Top-Right Corner) */}
          <button
            onClick={() => {
              sounds.playClick();
              onGoHome();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xl transition-all"
            title="Return to Main Menu / Character Select"
          >
            <Home className="w-4 h-4 fill-slate-950" />
            <span>Home</span>
          </button>
        </div>
      </div>

      {/* On-Screen Live Cart Display Tray (Always visible on screen so player sees items accumulating!) */}
      <div className="fixed top-18 right-4 z-20 w-64 sm:w-72 pointer-events-auto">
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                Isi Keranjang ({buyerState.cartItems.reduce((acc, i) => acc + i.qty, 0)})
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {formatIDR(buyerState.cartItems.reduce((acc, i) => acc + i.unitPrice * i.qty, 0))}
            </span>
          </div>

          {/* Cart Items List */}
          {buyerState.cartItems.length === 0 ? (
            <div className="py-2.5 px-2 text-center text-slate-400 text-xs">
              <span className="text-xl block mb-1">🛒</span>
              <p className="text-[11px] text-slate-400 leading-tight">
                Keranjang masih kosong. Hitung barang di toko untuk mengisi trolimu!
              </p>
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {buyerState.cartItems.map((cart, idx) => {
                const prod = PRODUCT_CATALOG[cart.itemId];
                return (
                  <div
                    key={`${cart.itemId}_${idx}`}
                    className="flex items-center justify-between p-1.5 px-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs hover:border-amber-400/40 transition-all animate-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{prod.emoji}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-100 truncate text-[11px]">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {cart.stallName} · <span className="text-amber-300 font-semibold">{cart.qty}x</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono text-[11px] font-bold text-emerald-400">
                      {formatIDR(cart.unitPrice * cart.qty)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Proximity Interaction Prompt Banner */}
      {nearStall && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenStall(nearStall.id);
            }}
            className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform border-2 border-white/40"
          >
            <Store className="w-5 h-5" />
            <span>Press [E] or Tap to Shop at {nearStall.name}</span>
          </button>
        </div>
      )}

      {/* Goal Celebration Modal */}
      {isGoalFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-400 rounded-2xl p-6 text-center text-white shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 mx-auto mb-3 bg-amber-400/20 text-amber-300 rounded-full flex items-center justify-center">
              <Trophy className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold font-display text-amber-300">
              Shopping List Complete!
            </h2>
            <p className="text-xs text-slate-300 mt-1 mb-4">
              Master of Social Arithmetic! You compared deals, leveraged discounts, and stayed well within budget!
            </p>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-2 mb-5">
              <div className="flex justify-between text-slate-300">
                <span>Initial Budget:</span>
                <span className="font-mono font-bold">{formatIDR(buyerState.budget)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Total Money Saved:</span>
                <span className="font-mono font-bold">{formatIDR(buyerState.totalSaved)}</span>
              </div>
              <div className="flex justify-between text-sky-300">
                <span>Remaining Wallet:</span>
                <span className="font-mono font-bold">{formatIDR(buyerState.wallet)}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between text-amber-300 font-bold">
                <span>Efficiency Rating:</span>
                <span>⭐ 100% Top Shopper</span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onRestart();
              }}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg"
            >
              Play Again / Switch Role
            </button>
          </div>
        </div>
      )}

      {/* Unified Bottom Dock (Collapsible - Zero Viewport Occlusion) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-3xl pointer-events-auto transition-transform duration-300">
        {/* Toggle Collapse Button */}
        <div className="flex justify-center -mb-2">
          <button
            onClick={() => {
              sounds.playClick();
              setIsDockCollapsed(!isDockCollapsed);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-700 text-[11px] font-semibold text-slate-300 rounded-t-xl hover:text-white transition-colors shadow-lg"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Shopping Dashboard</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Dock</span>
              </>
            )}
          </button>
        </div>

        {/* Main Dock Container */}
        {!isDockCollapsed && (
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
            {/* Dock Tabs Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('list');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'list'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Shopping List ({completedCount}/5)</span>
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('cart');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'cart'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Cart Items ({buyerState.cartItems.length})</span>
                </button>
              </div>

              {/* Navigation tip */}
              <div className="hidden sm:block text-[11px] text-slate-400">
                Move: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">W</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">A</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">S</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">D</kbd> or Drag Mouse to Look
              </div>
            </div>

            {/* Tab 1: Shopping Checklist */}
            {activeTab === 'list' && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                {buyerState.shoppingList.map((item) => {
                  const prod = PRODUCT_CATALOG[item.itemId];
                  const isDone = item.boughtQty >= item.requiredQty;

                  return (
                    <div
                      key={item.itemId}
                      className={`p-2.5 rounded-xl border text-xs transition-colors ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{prod.emoji}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className="font-bold text-slate-100 truncate">{prod.name}</div>
                      <div className="flex items-center justify-between text-[11px] mt-1 text-slate-400">
                        <span>
                          {item.boughtQty} / {item.requiredQty} {prod.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Cart Receipts */}
            {activeTab === 'cart' && (
              <div className="mt-3 max-h-36 overflow-y-auto space-y-1.5">
                {buyerState.cartItems.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    Your trolley is currently empty. Visit market stalls to inspect discounts and purchase items!
                  </p>
                ) : (
                  buyerState.cartItems.map((cart, idx) => {
                    const prod = PRODUCT_CATALOG[cart.itemId];
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 px-3 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span>{prod.emoji}</span>
                          <span className="font-semibold text-white">{prod.name}</span>
                          <span className="text-slate-400 text-[11px]">x{cart.qty}</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-slate-400 text-[11px]">{cart.stallName}</span>
                          <span className="text-emerald-400 font-bold">{formatIDR(cart.unitPrice * cart.qty)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
