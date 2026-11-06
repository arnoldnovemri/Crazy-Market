import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Volume2,
  VolumeX,
  Star,
  Award,
  Pause,
  Flag,
  Home,
} from 'lucide-react';
import { CharacterConfig, formatIDR, SellerRound } from '../types/game';
import { SELLER_ROUNDS } from '../utils/gameData';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SellerHUDProps {
  player: CharacterConfig;
  onOpenFormula: () => void;
  onPause: () => void;
  onEndGame: () => void;
  onGoHome: () => void;
  onRestart: () => void;
  onUpdateMetrics?: (metrics: { roundsCompleted: number; totalProfit: number; stars: number }) => void;
}

export const SellerHUD: React.FC<SellerHUDProps> = ({
  player,
  onOpenFormula,
  onPause,
  onEndGame,
  onGoHome,
  onRestart,
  onUpdateMetrics,
}) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [totalProfitGenerated, setTotalProfitGenerated] = useState(0);
  const [reputationStars, setReputationStars] = useState(5.0);

  // Form inputs for current round
  const round: SellerRound = SELLER_ROUNDS[currentRoundIdx % SELLER_ROUNDS.length];

  const [inputTotalCost, setInputTotalCost] = useState('');
  const [inputGrossRevenue, setInputGrossRevenue] = useState('');
  const [inputDiscountAmount, setInputDiscountAmount] = useState('');
  const [inputNetRevenue, setInputNetRevenue] = useState('');
  const [inputProfitOrLoss, setInputProfitOrLoss] = useState<'profit' | 'loss' | 'breakeven' | ''>('');
  const [inputMarginAmount, setInputMarginAmount] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const toggleMute = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
  };

  const handleValidateLedger = (e: React.FormEvent) => {
    e.preventDefault();

    const enteredCost = parseInt(inputTotalCost.replace(/\D/g, '') || '0', 10);
    const enteredGross = parseInt(inputGrossRevenue.replace(/\D/g, '') || '0', 10);
    const enteredDiscount = parseInt(inputDiscountAmount.replace(/\D/g, '') || '0', 10);
    const enteredNet = parseInt(inputNetRevenue.replace(/\D/g, '') || '0', 10);
    const enteredMargin = parseInt(inputMarginAmount.replace(/\D/g, '') || '0', 10);

    // Validate calculations
    const costCorrect = Math.abs(enteredCost - round.totalCost) < 100;
    const grossCorrect = Math.abs(enteredGross - round.grossRevenue) < 100;
    const discountCorrect = Math.abs(enteredDiscount - round.discountAmount) < 100;
    const netCorrect = Math.abs(enteredNet - round.netRevenue) < 100;
    const statusCorrect = inputProfitOrLoss === round.profitOrLoss;
    const marginCorrect = Math.abs(enteredMargin - round.marginAmount) < 100;

    setSubmitted(true);

    if (costCorrect && grossCorrect && discountCorrect && netCorrect && statusCorrect && marginCorrect) {
      setIsSuccess(true);
      setErrorMessage('');
      sounds.playSuccess();
      sounds.playCashRegister();
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
      });

      const nextProfit = round.profitOrLoss === 'profit' ? round.marginAmount : -round.marginAmount;
      const updatedProfit = totalProfitGenerated + nextProfit;
      const updatedRounds = roundsCompleted + 1;
      setTotalProfitGenerated(updatedProfit);
      setRoundsCompleted(updatedRounds);
      onUpdateMetrics?.({
        roundsCompleted: updatedRounds,
        totalProfit: updatedProfit,
        stars: reputationStars,
      });
    } else {
      setIsSuccess(false);
      sounds.playError();
      let errors: string[] = [];
      if (!costCorrect) errors.push(`Total Cost should be ${round.quantity} × ${formatIDR(round.unitCostPrice)} = ${formatIDR(round.totalCost)}.`);
      if (!grossCorrect) errors.push(`Gross Selling Price should be ${round.quantity} × ${formatIDR(round.unitNormalPrice)} = ${formatIDR(round.grossRevenue)}.`);
      if (!discountCorrect) errors.push(`Discount Amount should be ${formatIDR(round.discountAmount)}.`);
      if (!netCorrect) errors.push(`Net Revenue should be ${formatIDR(round.grossRevenue)} - ${formatIDR(round.discountAmount)} = ${formatIDR(round.netRevenue)}.`);
      if (!statusCorrect) errors.push(`Status is actually ${round.profitOrLoss.toUpperCase()} (Net Revenue ${round.netRevenue > round.totalCost ? '>' : round.netRevenue < round.totalCost ? '<' : '='} Total Cost).`);
      if (!marginCorrect) errors.push(`Difference Amount is ${formatIDR(round.marginAmount)}.`);

      setErrorMessage(errors.join(' '));
      setReputationStars((prev) => Math.max(3.0, +(prev - 0.2).toFixed(1)));
    }
  };

  const handleNextCustomer = () => {
    sounds.playClick();
    setCurrentRoundIdx((prev) => prev + 1);
    setInputTotalCost('');
    setInputGrossRevenue('');
    setInputDiscountAmount('');
    setInputNetRevenue('');
    setInputProfitOrLoss('');
    setInputMarginAmount('');
    setSubmitted(false);
    setIsSuccess(false);
    setErrorMessage('');
  };

  // Helper autofill for learning
  const handleAutofillHint = () => {
    sounds.playClick();
    setInputTotalCost(round.totalCost.toString());
    setInputGrossRevenue(round.grossRevenue.toString());
    setInputDiscountAmount(round.discountAmount.toString());
    setInputNetRevenue(round.netRevenue.toString());
    setInputProfitOrLoss(round.profitOrLoss);
    setInputMarginAmount(round.marginAmount.toString());
  };

  return (
    <>
      {/* Top Header Bar */}
      <div className="fixed top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Seller Profile & Metrics */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2.5 px-4 shadow-xl backdrop-blur-md pointer-events-auto">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-inner"
            style={{ backgroundColor: player.shirtColor }}
          >
            {player.name.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{player.name}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                Stall Owner / Seller
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs mt-0.5">
              <span className="flex items-center gap-1 font-mono font-bold text-emerald-400">
                <DollarSign className="w-3.5 h-3.5" />
                Profit: {formatIDR(totalProfitGenerated)}
              </span>
              <span className="text-slate-400">·</span>
              <span className="flex items-center gap-1 font-mono text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {reputationStars} Stars
              </span>
              <span className="text-slate-400">·</span>
              <span className="flex items-center gap-1 text-slate-300 font-medium">
                <Users className="w-3.5 h-3.5" />
                {roundsCompleted} Served
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls (Top Right: Formula, Pause, End, Home) */}
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
            title="End Session"
          >
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">End</span>
          </button>

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

      {/* Store Waiting Atmosphere Status */}
      <div className="fixed top-20 left-4 z-20 pointer-events-auto hidden sm:block">
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-900/90 border border-emerald-500/40 rounded-xl shadow-lg backdrop-blur-md text-xs text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <span className="font-bold text-emerald-300 block text-[11px]">Toko Sedang Buka</span>
            <span className="text-[10px] text-slate-300">Karakter menunggu di meja kasir melayani pembeli</span>
          </div>
        </div>
      </div>

      {/* Customer Order Speech Bubble (In front of Seller Counter) */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-xl pointer-events-auto">
        <div className="bg-slate-900/95 border-2 border-amber-400/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
              🛒
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{round.customerName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  Pembeli #{currentRoundIdx + 1} di Depan Toko
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 italic leading-relaxed">
                "{round.customerGreeting}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Point-of-Sale Register (Collapsible Bottom Dock) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-4xl pointer-events-auto">
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md text-white max-h-[75vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm font-display text-white">
                Seller Cashier Ledger & Profit/Loss Audit
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={handleAutofillHint}
                className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Fill with Calculator Hint
              </button>
            </div>
          </div>

          {/* Item wholesale & retail specs */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Requested Item</span>
              <span className="font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                <span>{round.item.emoji}</span> {round.quantity}x {round.item.name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Cost Price (Modal/Unit)</span>
              <span className="font-mono font-semibold text-rose-300 block mt-0.5">
                {formatIDR(round.unitCostPrice)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Normal Selling (Price/Unit)</span>
              <span className="font-mono font-semibold text-amber-300 block mt-0.5">
                {formatIDR(round.unitNormalPrice)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Promo / Discount Offer</span>
              <span className="font-semibold text-emerald-300 block mt-0.5">
                {round.discountType === 'percentage'
                  ? `${round.discountPercent}% Discount`
                  : round.discountType === 'coupon'
                  ? `Voucher ${formatIDR(round.couponValue)} OFF`
                  : 'Buy 1 Get 1 Free (BOGO)'}
              </span>
            </div>
          </div>

          {/* Interactive Math Ledger Form */}
          <form onSubmit={handleValidateLedger} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Total Cost Price */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  1. Total Cost Price (Total Modal)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    disabled={submitted && isSuccess}
                    value={inputTotalCost}
                    onChange={(e) => setInputTotalCost(e.target.value)}
                    placeholder="e.g. 72000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Formula: Quantity × Cost Price
                </span>
              </div>

              {/* 2. Gross Selling Price */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  2. Gross Price (Before Discount)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    disabled={submitted && isSuccess}
                    value={inputGrossRevenue}
                    onChange={(e) => setInputGrossRevenue(e.target.value)}
                    placeholder="e.g. 100000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Formula: Quantity × Normal Selling Price
                </span>
              </div>

              {/* 3. Discount Amount */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  3. Total Discount Given
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    disabled={submitted && isSuccess}
                    value={inputDiscountAmount}
                    onChange={(e) => setInputDiscountAmount(e.target.value)}
                    placeholder="e.g. 20000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Formula: Gross × Discount % or Coupon
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              {/* 4. Net Revenue */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  4. Net Revenue (Income Received)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    disabled={submitted && isSuccess}
                    value={inputNetRevenue}
                    onChange={(e) => setInputNetRevenue(e.target.value)}
                    placeholder="e.g. 80000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Formula: Gross - Discount Amount
                </span>
              </div>

              {/* 5. Profit or Loss Selection */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  5. Profit (Untung) or Loss (Rugi)?
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    disabled={submitted && isSuccess}
                    onClick={() => setInputProfitOrLoss('profit')}
                    className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                      inputProfitOrLoss === 'profit'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> Profit
                  </button>
                  <button
                    type="button"
                    disabled={submitted && isSuccess}
                    onClick={() => setInputProfitOrLoss('loss')}
                    className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                      inputProfitOrLoss === 'loss'
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" /> Loss
                  </button>
                  <button
                    type="button"
                    disabled={submitted && isSuccess}
                    onClick={() => setInputProfitOrLoss('breakeven')}
                    className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center ${
                      inputProfitOrLoss === 'breakeven'
                        ? 'bg-sky-500 text-white border-sky-400'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    Impas
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Compare Net Revenue vs Total Cost
                </span>
              </div>

              {/* 6. Difference Amount */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  6. Profit / Loss Difference Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    disabled={submitted && isSuccess}
                    value={inputMarginAmount}
                    onChange={(e) => setInputMarginAmount(e.target.value)}
                    placeholder="e.g. 8000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Formula: |Net Revenue - Total Cost|
                </span>
              </div>
            </div>

            {/* Error or Success feedback */}
            {submitted && (
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  isSuccess
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-600 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Ledger Verified! Excellent Social Arithmetic calculation!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Calculation Discrepancy! Review and adjust your numbers:</span>
                    </>
                  )}
                </div>
                <p className="text-slate-300">
                  {isSuccess
                    ? `Result: ${round.profitOrLoss.toUpperCase()} of ${formatIDR(round.marginAmount)} (${round.marginPercent}% margin). Customer satisfied!`
                    : errorMessage}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {!isSuccess ? (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg"
                >
                  Verify & Process Transaction
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextCustomer}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg flex items-center gap-1.5"
                >
                  <span>Serve Next Customer</span>
                  <span>→</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
