import React from 'react';
import { Trophy, ShoppingBag, Store, RotateCcw, Home, CheckCircle2 } from 'lucide-react';
import { BuyerState, CharacterConfig, PlayerRole, formatIDR } from '../types/game';
import { sounds } from '../utils/audio';

interface EndGameModalProps {
  playerRole: PlayerRole;
  player: CharacterConfig;
  buyerState: BuyerState;
  sellerMetrics?: {
    roundsCompleted: number;
    totalProfit: number;
    stars: number;
  };
  onRestart: () => void;
  onGoHome: () => void;
}

export const EndGameModal: React.FC<EndGameModalProps> = ({
  playerRole,
  player,
  buyerState,
  sellerMetrics,
  onRestart,
  onGoHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 text-white shadow-2xl animate-in zoom-in-95">
        <div className="text-center mb-5">
          <div className="w-16 h-16 mx-auto mb-3 bg-amber-400/20 text-amber-300 rounded-full flex items-center justify-center shadow-lg">
            <Trophy className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold font-display text-amber-300">
            SESSION COMPLETED
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Performance Report for <strong className="text-white">{player.name}</strong> as {playerRole === 'buyer' ? 'Buyer' : 'Seller'}
          </p>
        </div>

        {playerRole === 'buyer' ? (
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-2.5 mb-5">
            <div className="flex justify-between text-slate-300">
              <span>Initial Budget:</span>
              <span className="font-mono font-bold">{formatIDR(buyerState.budget)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Items Acquired:</span>
              <span className="font-bold text-white">
                {buyerState.shoppingList.reduce((acc, it) => acc + it.boughtQty, 0)} items
              </span>
            </div>
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Total Money Saved (Discounts):</span>
              <span className="font-mono font-bold">{formatIDR(buyerState.totalSaved)}</span>
            </div>
            <div className="flex justify-between text-sky-300">
              <span>Remaining Wallet Balance:</span>
              <span className="font-mono font-bold">{formatIDR(buyerState.wallet)}</span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between text-amber-300 font-bold">
              <span>Budget Discipline:</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> High Proficiency
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-2.5 mb-5">
            <div className="flex justify-between text-slate-300">
              <span>Customers Served:</span>
              <span className="font-bold text-white">{sellerMetrics?.roundsCompleted || 0}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Net Profit Accumulated:</span>
              <span className="font-mono font-bold">{formatIDR(sellerMetrics?.totalProfit || 0)}</span>
            </div>
            <div className="flex justify-between text-amber-300">
              <span>Customer Satisfaction:</span>
              <span className="font-mono font-bold">⭐ {sellerMetrics?.stars || 5.0} Stars</span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between text-sky-300 font-bold">
              <span>Ledger Accuracy:</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Grade 7 Master
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onRestart();
            }}
            className="py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onGoHome();
            }}
            className="py-3 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>Return Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
