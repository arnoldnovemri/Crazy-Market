import React from 'react';
import { X, BookOpen, Percent, TrendingUp, TrendingDown, Tag, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface FormulaGuideModalProps {
  onClose: () => void;
}

export const FormulaGuideModal: React.FC<FormulaGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl p-6 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-display">
                Social Arithmetic Formula Handbook
              </h2>
              <p className="text-xs text-slate-400">Grade 7 Mathematics essentials for buying, selling & discounts</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="mt-5 space-y-4">
          {/* 1. Cost Price vs Selling Price */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl">
            <h3 className="text-sm font-bold text-sky-400 mb-2 flex items-center gap-2">
              <span>01. Cost Price (Modal) & Selling Price (Harga Jual)</span>
            </h3>
            <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                <strong className="text-white">Cost Price ($C$ / Modal):</strong> The initial amount of money spent to produce or purchase goods from the distributor.
              </p>
              <p>
                <strong className="text-white">Selling Price ($S$ / Harga Jual):</strong> The amount charged to customers when buying goods.
              </p>
            </div>
          </div>

          {/* 2. Profit and Loss */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Profit (Untung)</span>
              </div>
              <p className="text-xs text-slate-300 mb-2">Happens when Selling Price &gt; Cost Price ($S &gt; C$):</p>
              <div className="bg-slate-900/80 p-2.5 rounded-lg font-mono text-xs text-emerald-300 space-y-1">
                <div>Profit = S - C</div>
                <div>Profit % = (Profit / C) × 100%</div>
              </div>
            </div>

            <div className="p-4 bg-rose-950/30 border border-rose-800/40 rounded-xl">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-1.5">
                <TrendingDown className="w-4 h-4" />
                <span>Loss (Rugi)</span>
              </div>
              <p className="text-xs text-slate-300 mb-2">Happens when Cost Price &gt; Selling Price ($C &gt; S$):</p>
              <div className="bg-slate-900/80 p-2.5 rounded-lg font-mono text-xs text-rose-300 space-y-1">
                <div>Loss = C - S</div>
                <div>Loss % = (Loss / C) × 100%</div>
              </div>
            </div>
          </div>

          {/* 3. Single Discount */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl">
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>02. Standard Percentage Discount</span>
            </h3>
            <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <div className="bg-slate-900/80 p-2.5 rounded-lg font-mono text-xs text-amber-300 space-y-1">
                <div>Discount Amount = Original Price × (Discount Rate / 100)</div>
                <div>Final Net Price = Original Price - Discount Amount</div>
              </div>
              <p className="text-slate-400">
                Example: Rp 40.000 with 25% discount saving = 25% × 40.000 = Rp 10.000. Final = Rp 30.000.
              </p>
            </div>
          </div>

          {/* 4. Special Supermarket Deals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-indigo-950/30 border border-indigo-800/40 rounded-xl">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1.5">
                <Percent className="w-4 h-4" />
                <span>Buy 1 Get 1 Free (BOGO)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You pay for 1 item and take 2 items. The effective unit cost of each item is cut by exactly <strong className="text-indigo-300">50%</strong>!
              </p>
            </div>

            <div className="p-4 bg-fuchsia-950/30 border border-fuchsia-800/40 rounded-xl">
              <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-sm mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Double Discount (Successive)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A 20% discount followed by an extra 20% discount is <strong className="text-fuchsia-300">NOT 40%</strong>! The 2nd discount applies to the reduced price:
                <span className="block mt-1 font-mono text-[11px] text-fuchsia-200">
                  Price × 0.8 × 0.8 = 0.64 × Price (Total 36% off)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Got it, Let's Shop!
          </button>
        </div>
      </div>
    </div>
  );
};
