import React, { useState } from 'react';
import { X, Sparkles, ShoppingBag, Check, Gift, Tag, Store } from 'lucide-react';
import { MarketStall, formatIDR, BuyerState, StallOffer } from '../types/game';
import { PRODUCT_CATALOG } from '../utils/gameData';
import { sounds } from '../utils/audio';

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
      finalTotal = baseTotal * (1 - discountRate);
      savings = baseTotal - finalTotal;
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
        finalTotal = Math.max(0, baseTotal - discount);
        savings = discount;
      }
      effectiveUnitPrice = finalTotal / qty;
    } else if (offer.discountType === 'double_game') {
      const d1 = (offer.discountPercent || 0) / 100;
      let afterFirst = baseTotal * (1 - d1);

      if (isDoubleDiscountUnlocked) {
        const d2 = (offer.gameExtraPercent || 0) / 100;
        finalTotal = afterFirst * (1 - d2);
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

  const handlePurchase = () => {
    if (!canAfford) {
      sounds.playError();
      return;
    }
    sounds.playCashRegister();
    onBuyItem(selectedOffer.itemId, purchaseQty, effectiveUnitPrice, stall.name, savings);
    setPurchaseQty(1);
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
                    onClick={() => {
                      sounds.playClick();
                      setSelectedOffer(offer);
                      setPurchaseQty(1);
                    }}
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

          {/* Selected Product Math Deep Dive & Purchase Controls */}
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
                <span className="text-[11px] text-slate-400 block">Base Regular Price</span>
                <span className="text-sm font-mono line-through text-slate-500">
                  {formatIDR(selectedOffer.basePrice)}
                </span>
                <span className="text-base font-mono font-bold text-emerald-400 block">
                  {formatIDR(effectiveUnitPrice)} <span className="text-[10px] font-normal text-slate-400">/ unit</span>
                </span>
              </div>
            </div>

            {/* Shopping List Status */}
            {listItem && (
              <div className="flex items-center justify-between text-xs p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                <span className="text-slate-300">
                  Shopping List: {listItem.boughtQty} / {listItem.requiredQty} acquired
                </span>
                {stillNeeded > 0 ? (
                  <span className="text-amber-400 font-semibold">Still need {stillNeeded} more</span>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Requirement Met!
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
                        ? 'Double Discount Unlocked (+20% Successive Discount!)'
                        : `Unlock Extra +${selectedOffer.gameExtraPercent}% Double Discount!`}
                    </h5>
                    <p className="text-[11px] text-slate-300">
                      {isDoubleDiscountUnlocked
                        ? 'Applied! Successive formula: Base × 0.8 × 0.8 = 36% total savings!'
                        : 'Solve a quick 20-second Social Arithmetic arithmetic puzzle to unlock!'}
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
                    Play Mini-Game
                  </button>
                )}
              </div>
            )}

            {/* BOGO Banner */}
            {selectedOffer.discountType === 'bogo' && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center gap-2.5 text-xs text-indigo-200">
                <Gift className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <span className="font-bold block">Buy 1 Get 1 Free Deal Active</span>
                  <span className="text-slate-300">
                    If you buy 2 cartons, you only pay for 1! Effective cost is 50% off per carton!
                  </span>
                </div>
              </div>
            )}

            {/* Quantity Selector & Bill Calculation */}
            <div className="pt-2 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400">Quantity:</span>
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                  <button
                    disabled={purchaseQty <= 1}
                    onClick={() => {
                      sounds.playClick();
                      setPurchaseQty(Math.max(1, purchaseQty - 1));
                    }}
                    className="px-3 py-1.5 text-xs font-bold hover:bg-slate-800 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-mono font-bold text-white">
                    {purchaseQty}
                  </span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setPurchaseQty(purchaseQty + 1);
                    }}
                    className="px-3 py-1.5 text-xs font-bold hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>
                {stillNeeded > 0 && purchaseQty !== stillNeeded && (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setPurchaseQty(stillNeeded);
                    }}
                    className="text-[11px] text-sky-400 hover:underline"
                  >
                    Set to needed ({stillNeeded})
                  </button>
                )}
              </div>

              {/* Total & Savings tally */}
              <div className="text-right">
                <div className="text-xs text-slate-400">
                  Total Bill: <span className="font-mono text-base font-bold text-white">{formatIDR(finalTotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    Saved: {formatIDR(savings)} ({Math.round((savings / baseTotal) * 100)}% off)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Your Wallet: <span className="font-mono font-bold text-amber-300">{formatIDR(buyerState.wallet)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors"
            >
              Exit Stall
            </button>
            <button
              disabled={!canAfford}
              onClick={handlePurchase}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors shadow-md flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{canAfford ? 'Add to Cart & Purchase' : 'Not Enough Money'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
