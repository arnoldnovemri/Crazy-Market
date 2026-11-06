import React, { useState } from 'react';
import { X, Sparkles, ShoppingBag, Check, Gift, Tag, Store, Calculator, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { MarketStall, formatIDR, BuyerState, StallOffer } from '../types/game';
import { PRODUCT_CATALOG } from '../utils/gameData';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface StallModalProps {
  stall: MarketStall;
  buyerState: BuyerState;
  onBuyItem: (itemId: string, qty: number, unitCost: number, stallName: string, savings: number) => void;
  onOpenMiniGame: (stallId: string, itemId: string, bonusPercent: number, itemName: string) => void;
  onClose: () => void;
}

export const StallModal: React.FC<StallModalProps> = ({
  stall,
  buyerState,
  onBuyItem,
  onOpenMiniGame,
  onClose,
}) => {
  const [selectedOffer, setSelectedOffer] = useState<StallOffer>(stall.offers[0]);
  const [purchaseQty, setPurchaseQty] = useState<number>(1);
  const [userCalculation, setUserCalculation] = useState<string>('');
  const [calculationFeedback, setCalculationFeedback] = useState<{
    status: 'correct' | 'incorrect';
    title: string;
    details: string;
  } | null>(null);
  const [showFormulaHint, setShowFormulaHint] = useState<boolean>(false);

  const product = PRODUCT_CATALOG[selectedOffer.itemId];
  const miniGameKey = `${stall.id}_${selectedOffer.itemId}`;
  const isDoubleDiscountUnlocked = !!buyerState.unlockedMiniGameDiscounts[miniGameKey];

  // Calculate pricing
  const calculateFinalPrice = (offer: StallOffer, qty: number) => {
    let baseTotal = offer.basePrice * qty;
    let finalTotal = baseTotal;
    let savings = 0;
    let effectiveUnitPrice = offer.basePrice;

    if (offer.discountType === 'percentage') {
      const discountRate = (offer.discountPercent || 0) / 100;
      savings = Math.round(baseTotal * discountRate);
      finalTotal = baseTotal - savings;
      effectiveUnitPrice = finalTotal / qty;
    } else if (offer.discountType === 'bogo') {
      // Buy 1 Get 1 Free: Every 2 items only charges for 1 item!
      const chargedUnits = Math.ceil(qty / 2);
      finalTotal = chargedUnits * offer.basePrice;
      savings = baseTotal - finalTotal;
      effectiveUnitPrice = finalTotal / qty;
    } else if (offer.discountType === 'flat_voucher') {
      const discount = (offer.flatDiscount || 0);
      if (baseTotal >= (offer.minSpend || 0)) {
        savings = Math.min(baseTotal, discount);
        finalTotal = Math.max(0, baseTotal - savings);
      }
      effectiveUnitPrice = finalTotal / qty;
    } else if (offer.discountType === 'double_game') {
      const d1 = (offer.discountPercent || 0) / 100;
      let afterFirst = Math.round(baseTotal * (1 - d1));

      if (isDoubleDiscountUnlocked) {
        const d2 = (offer.gameExtraPercent || 0) / 100;
        finalTotal = Math.round(afterFirst * (1 - d2));
      } else {
        finalTotal = afterFirst;
      }
      savings = baseTotal - finalTotal;
      effectiveUnitPrice = finalTotal / qty;
    }

    return { baseTotal, finalTotal, savings, effectiveUnitPrice };
  };

  const { baseTotal, finalTotal, savings, effectiveUnitPrice } = calculateFinalPrice(selectedOffer, purchaseQty);

  // Check shopping list status for this product
  const listItem = buyerState.shoppingList.find((item) => item.itemId === selectedOffer.itemId);
  const stillNeeded = listItem ? Math.max(0, listItem.requiredQty - listItem.boughtQty) : 0;

  const canAfford = buyerState.wallet >= finalTotal;

  const handleOfferChange = (offer: StallOffer) => {
    sounds.playClick();
    setSelectedOffer(offer);
    setPurchaseQty(1);
    setUserCalculation('');
    setCalculationFeedback(null);
    setShowFormulaHint(false);
  };

  const handleQtyChange = (newQty: number) => {
    sounds.playClick();
    setPurchaseQty(newQty);
    setUserCalculation('');
    setCalculationFeedback(null);
  };

  // Student must calculate the payment amount themselves!
  const handleVerifyCalculationAndPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = parseInt(userCalculation.replace(/\D/g, '') || '0', 10);

    if (!userCalculation.trim() || entered <= 0) {
      sounds.playError();
      setCalculationFeedback({
        status: 'incorrect',
        title: 'Masukkan Hasil Hitunganmu!',
        details: 'Ketik nominal rupiah yang harus dibayarkan setelah diskon agar barang bisa masuk ke keranjang.',
      });
      return;
    }

    const isCorrect = Math.abs(entered - finalTotal) <= 50;

    if (isCorrect) {
      if (!canAfford) {
        sounds.playError();
        setCalculationFeedback({
          status: 'incorrect',
          title: 'Hitungan Tepat, Tapi Saldo Kurang!',
          details: `Hitunganmu benar (${formatIDR(finalTotal)}), tetapi uang di dompetmu hanya ${formatIDR(buyerState.wallet)}. Silakan kurangi quantity barang.`,
        });
        return;
      }

      sounds.playSuccess();
      sounds.playCashRegister();
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.6 },
      });

      setCalculationFeedback({
        status: 'correct',
        title: 'Perhitunganmu Tepat! 🎉',
        details: `Harga Normal ${formatIDR(baseTotal)} - Hemat Diskon ${formatIDR(savings)} = Bayar ${formatIDR(finalTotal)}. Barang berhasil masuk ke keranjang belanja!`,
      });

      onBuyItem(selectedOffer.itemId, purchaseQty, effectiveUnitPrice, stall.name, savings);
      setUserCalculation('');
    } else {
      sounds.playError();
      let hint = '';
      if (selectedOffer.discountType === 'percentage') {
        hint = `Harga Normal Total: ${purchaseQty} × ${formatIDR(selectedOffer.basePrice)} = ${formatIDR(baseTotal)}. Nilai Diskon: ${selectedOffer.discountPercent}% × ${formatIDR(baseTotal)} = ${formatIDR(savings)}. Total yang dibayar: ${formatIDR(baseTotal)} - ${formatIDR(savings)}.`;
      } else if (selectedOffer.discountType === 'bogo') {
        hint = `Beli 1 Gratis 1: Dari ${purchaseQty} barang, kamu hanya perlu membayar ${Math.ceil(purchaseQty / 2)} barang! Total: ${Math.ceil(purchaseQty / 2)} × ${formatIDR(selectedOffer.basePrice)}.`;
      } else if (selectedOffer.discountType === 'flat_voucher') {
        hint = `Voucher Potongan: Total Normal ${formatIDR(baseTotal)} dikurangi Voucher ${formatIDR(savings)}.`;
      } else {
        hint = `Diskon Bertingkat: Hitung diskon pertama ${selectedOffer.discountPercent}%, lalu hitung diskon kedua dari sisa harga tersebut.`;
      }

      setCalculationFeedback({
        status: 'incorrect',
        title: `Hasilmu Rp ${formatIDR(entered)} Belum Tepat`,
        details: hint,
      });
    }
  };

  const handleUseHelpAutoFill = () => {
    sounds.playClick();
    setUserCalculation(finalTotal.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden text-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Stall Header Banner */}
        <div
          className="p-5 border-b border-slate-800 flex items-center justify-between"
          style={{ backgroundColor: `${stall.color}22` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: stall.color }}
            >
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display text-white">{stall.name}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                  Clerk: {stall.clerkName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{stall.tagline}</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Selectable Items at this Stall */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
              Available Items & Discounts
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stall.offers.map((offer) => {
                const prod = PRODUCT_CATALOG[offer.itemId];
                const isSelected = selectedOffer.itemId === offer.itemId;
                const isMiniUnlocked = !!buyerState.unlockedMiniGameDiscounts[`${stall.id}_${offer.itemId}`];

                return (
                  <button
                    key={offer.itemId}
                    onClick={() => handleOfferChange(offer)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/30'
                        : 'bg-slate-850/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-2xl">{prod.emoji}</span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-100 truncate">{prod.name}</h4>
                        <span className="text-[11px] text-slate-400 block">{prod.unit}</span>
                      </div>
                    </div>

                        <div className="mt-2 pt-2 border-t border-slate-700/60">
                          <span className="text-xs font-mono font-bold text-amber-300 block">
                            {formatIDR(offer.basePrice)}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold block truncate mt-0.5">
                            {offer.discountType === 'double_game' && isMiniUnlocked
                              ? '⚡ DOUBLE DISCOUNT ACTIVE!'
                              : offer.tagText}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Product Math Deep Dive & Student Calculation Section */}
              <div className="p-5 bg-slate-800/80 border border-slate-700 rounded-xl space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{product.emoji}</span>
                      <div>
                        <h3 className="text-base font-bold text-white">{product.name}</h3>
                        <p className="text-xs text-slate-400">{product.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Harga Normal Satuan</span>
                    <span className="text-base font-mono font-bold text-amber-300 block">
                      {formatIDR(selectedOffer.basePrice)} <span className="text-[10px] font-normal text-slate-400">/ unit</span>
                    </span>
                  </div>
                </div>

                {/* Shopping List Status */}
                {listItem && (
                  <div className="flex items-center justify-between text-xs p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                    <span className="text-slate-300">
                      Target Shopping List: {listItem.boughtQty} / {listItem.requiredQty} terpenuhi
                    </span>
                    {stillNeeded > 0 ? (
                      <span className="text-amber-400 font-semibold">Masih butuh {stillNeeded} unit lagi</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Target Terpenuhi!
                      </span>
                    )}
                  </div>
                )}

                {/* Special Double Discount Unlock Banner */}
                {selectedOffer.discountType === 'double_game' && (
                  <div className="p-3 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-transparent border border-amber-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <h5 className="text-xs font-bold text-amber-300">
                          {isDoubleDiscountUnlocked
                            ? 'Double Discount Aktif (+20% Diskon Bertingkat!)'
                            : `Buka Ekstra Diskon +${selectedOffer.gameExtraPercent}% Double Discount!`}
                        </h5>
                        <p className="text-[11px] text-slate-300">
                          {isDoubleDiscountUnlocked
                            ? 'Diskon ganda bertingkat diterapkan: Base × 0.8 × 0.8!'
                            : 'Selesaikan teka-teki aritmetika sosial 20 detik untuk membuka diskon ganda!'}
                        </p>
                      </div>
                    </div>

                    {!isDoubleDiscountUnlocked && (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          onOpenMiniGame(
                            stall.id,
                            selectedOffer.itemId,
                            selectedOffer.gameExtraPercent || 20,
                            product.name
                          );
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm shrink-0"
                      >
                        Mainkan Mini-Game
                      </button>
                    )}
                  </div>
                )}

                {/* BOGO Banner */}
                {selectedOffer.discountType === 'bogo' && (
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center gap-2.5 text-xs text-indigo-200">
                    <Gift className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Promo Spesial: Beli 1 Gratis 1 (BOGO)</span>
                      <span className="text-slate-300">
                        Beli 2 barang, kamu cukup bayar seharga 1 barang! Beli 4 bayar 2!
                      </span>
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="pt-2 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400">Jumlah Beli (Qty):</span>
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        disabled={purchaseQty <= 1}
                        onClick={() => handleQtyChange(Math.max(1, purchaseQty - 1))}
                        className="px-3 py-1.5 text-xs font-bold hover:bg-slate-800 disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 text-xs font-mono font-bold text-white">
                        {purchaseQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(purchaseQty + 1)}
                        className="px-3 py-1.5 text-xs font-bold hover:bg-slate-800"
                      >
                        +
                      </button>
                    </div>
                    {stillNeeded > 0 && purchaseQty !== stillNeeded && (
                      <button
                        type="button"
                        onClick={() => handleQtyChange(stillNeeded)}
                        className="text-[11px] text-sky-400 hover:underline"
                      >
                        Sesuai daftar ({stillNeeded})
                      </button>
                    )}
                  </div>

                  {/* Regular gross reference */}
                  <div className="text-right text-xs text-slate-400">
                    Total Normal (Sebelum Diskon):{' '}
                    <span className="font-mono font-bold text-slate-200">{formatIDR(baseTotal)}</span>
                    <span className="block text-[11px] text-amber-400 font-semibold mt-0.5">
                      Promo: {selectedOffer.tagText}
                    </span>
                  </div>
                </div>

                {/* STUDENT CASHIER CALCULATION CHALLENGE */}
                <form
                  onSubmit={handleVerifyCalculationAndPurchase}
                  className="mt-4 p-4 bg-slate-900/90 border-2 border-amber-400/50 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-amber-400" />
                      <label className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                        Hitung Sendiri Total yang Harus Kamu Bayar
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFormulaHint(!showFormulaHint)}
                      className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showFormulaHint ? 'Tutup Petunjuk' : 'Bantuan Rumus'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Agar barang bisa dimasukkan ke dalam keranjang, hitung total rupiah yang harus kamu bayarkan setelah memanfaatkan diskon/promo toko!
                  </p>

                  {/* Formula Hint Box */}
                  {showFormulaHint && (
                    <div className="p-3 bg-sky-950/40 border border-sky-600/50 rounded-lg text-xs space-y-1.5 text-sky-200 animate-in fade-in duration-150">
                      <div className="font-bold flex items-center gap-1.5 text-sky-300">
                        <span>💡 Rumus Aritmetika Sosial:</span>
                      </div>
                      <p>
                        • <strong>Harga Bersih (Total Bayar)</strong> = Total Normal - Nilai Diskon
                      </p>
                      {selectedOffer.discountType === 'percentage' && (
                        <p>
                          • <strong>Nilai Diskon</strong> = {selectedOffer.discountPercent}% × {formatIDR(baseTotal)} = {formatIDR(savings)}
                        </p>
                      )}
                      {selectedOffer.discountType === 'bogo' && (
                        <p>
                          • <strong>Beli 1 Gratis 1</strong> = Setiap 2 barang hanya bayar 1 barang. ({Math.ceil(purchaseQty / 2)} unit bayar).
                        </p>
                      )}
                      {selectedOffer.discountType === 'flat_voucher' && (
                        <p>
                          • <strong>Potongan Voucher</strong> = Kurangkan voucher {formatIDR(savings)} dari total normal.
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={handleUseHelpAutoFill}
                        className="text-[11px] text-amber-300 underline font-semibold mt-1 block"
                      >
                        Klik di sini untuk mengisi jawaban otomatis ({formatIDR(finalTotal)})
                      </button>
                    </div>
                  )}

                  {/* Calculation Input & Verify Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-amber-400">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={userCalculation}
                        onChange={(e) => setUserCalculation(e.target.value)}
                        placeholder="Contoh: 36000"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-sm font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Hitung & Masukkan ke Keranjang</span>
                    </button>
                  </div>

                  {/* Calculation Feedback (Success or Step-by-Step Educational Error) */}
                  {calculationFeedback && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-150 ${
                        calculationFeedback.status === 'correct'
                          ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200'
                          : 'bg-rose-950/60 border-rose-500/80 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        {calculationFeedback.status === 'correct' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-emerald-300">{calculationFeedback.title}</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span className="text-rose-300">{calculationFeedback.title}</span>
                          </>
                        )}
                      </div>
                      <p className="text-slate-200">{calculationFeedback.details}</p>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Saldo Dompetmu: <span className="font-mono font-bold text-amber-300">{formatIDR(buyerState.wallet)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                  }}
                  className="px-5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors"
                >
                  Tutup Toko
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };
