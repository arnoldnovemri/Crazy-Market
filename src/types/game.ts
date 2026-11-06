export type Gender = 'boy' | 'girl' | 'neutral';
export type HairStyle = 'short' | 'curly' | 'ponytail' | 'spiky' | 'bob';
export type ShirtStyle = 'tshirt' | 'hoodie' | 'striped' | 'vest';
export type Accessory = 'none' | 'glasses' | 'sunglasses' | 'headphones' | 'cap' | 'goldWatch';

export interface CharacterConfig {
  name: string;
  gender: Gender;
  skinTone: string;
  hairStyle: HairStyle;
  hairColor: string;
  shirtColor: string;
  shirtStyle: ShirtStyle;
  pantsColor: string;
  shoesColor: string;
  accessory: Accessory;
  trolleyColor: string;
}

export type PlayerRole = 'buyer' | 'seller';

export interface ProductItem {
  id: string;
  name: string;
  category: 'produce' | 'dairy' | 'breakfast' | 'snacks' | 'stationery';
  emoji: string;
  description: string;
  unit: string;
}

export type DiscountType = 'percentage' | 'bogo' | 'double_game' | 'flat_voucher';

export interface StallOffer {
  itemId: string;
  basePrice: number;
  discountType: DiscountType;
  discountPercent?: number; // e.g. 20%
  gameExtraPercent?: number; // e.g. +20% if mini-game is solved
  minSpend?: number; // for flat voucher
  flatDiscount?: number; // e.g. 15000 off
  bogoQty?: number; // buy 1 get 1
  tagText: string;
}

export interface MarketStall {
  id: string;
  name: string;
  tagline: string;
  color: string;
  accentColor: string;
  x: number;
  z: number;
  clerkName: string;
  offers: StallOffer[];
}

export interface ShoppingListItem {
  itemId: string;
  requiredQty: number;
  boughtQty: number;
  bestPotentialPrice: number;
  totalSpent: number;
}

export interface BuyerState {
  budget: number;
  wallet: number;
  shoppingList: ShoppingListItem[];
  totalSaved: number;
  unlockedMiniGameDiscounts: Record<string, boolean>; // key: `${stallId}_${itemId}`
  cartItems: {
    itemId: string;
    qty: number;
    unitPrice: number;
    stallName: string;
  }[];
}

export interface SellerRound {
  id: string;
  customerName: string;
  customerGreeting: string;
  item: ProductItem;
  quantity: number;
  unitCostPrice: number; // Cost Price / Modal (Rp)
  unitNormalPrice: number; // Regular Selling Price (Rp)
  discountType: 'percentage' | 'bogo' | 'coupon';
  discountPercent: number;
  couponValue: number;
  // Solution details
  totalCost: number;
  grossRevenue: number;
  discountAmount: number;
  netRevenue: number;
  profitOrLoss: 'profit' | 'loss' | 'breakeven';
  marginAmount: number;
  marginPercent: number;
}

export interface SellerPerformance {
  roundsCompleted: number;
  correctMathCount: number;
  totalProfitGenerated: number;
  reputationStars: number;
}

export function formatIDR(amount: number): string {
  const rounded = Math.round(amount);
  return 'Rp ' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
