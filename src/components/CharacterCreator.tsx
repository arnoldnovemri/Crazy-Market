import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Store,
  User,
  Palette,
  Shirt,
  Glasses,
  Play,
  Check,
} from 'lucide-react';
import { CharacterConfig, Gender, HairStyle, ShirtStyle, Accessory, PlayerRole } from '../types/game';
import { sounds } from '../utils/audio';

interface CharacterCreatorProps {
  initialConfig: CharacterConfig;
  onStartGame: (config: CharacterConfig, role: PlayerRole) => void;
}

const SKIN_TONES = [
  { label: 'Peach', value: '#fed7aa' },
  { label: 'Fair', value: '#fcd34d' },
  { label: 'Tan', value: '#f59e0b' },
  { label: 'Deep', value: '#b45309' },
  { label: 'Ebony', value: '#78350f' },
];

const HAIR_STYLES: { label: string; value: HairStyle }[] = [
  { label: 'Short', value: 'short' },
  { label: 'Curly', value: 'curly' },
  { label: 'Ponytail', value: 'ponytail' },
  { label: 'Spiky', value: 'spiky' },
  { label: 'Bob', value: 'bob' },
];

const HAIR_COLORS = [
  { label: 'Black', value: '#1e293b' },
  { label: 'Brown', value: '#451a03' },
  { label: 'Blonde', value: '#d97706' },
  { label: 'Red', value: '#b91c1c' },
  { label: 'Cyan', value: '#0891b2' },
];

const SHIRT_COLORS = [
  { label: 'Emerald', value: '#059669' },
  { label: 'Royal Blue', value: '#2563eb' },
  { label: 'Crimson', value: '#dc2626' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Pink', value: '#db2777' },
];

const PANTS_COLORS = [
  { label: 'Denim', value: '#1e3a8a' },
  { label: 'Charcoal', value: '#1e293b' },
  { label: 'Khaki', value: '#78716c' },
  { label: 'White', value: '#f8fafc' },
];

const SHOES_COLORS = [
  { label: 'White', value: '#f8fafc' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Black', value: '#0f172a' },
  { label: 'Yellow', value: '#eab308' },
];

const ACCESSORIES: { label: string; value: Accessory; icon: string }[] = [
  { label: 'None', value: 'none', icon: '👤' },
  { label: 'Glasses', value: 'glasses', icon: '👓' },
  { label: 'Sunglasses', value: 'sunglasses', icon: '🕶️' },
  { label: 'Headphones', value: 'headphones', icon: '🎧' },
  { label: 'Cap', value: 'cap', icon: '🧢' },
];

const TROLLEY_COLORS = [
  { label: 'Orange', value: '#f97316' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Rose', value: '#f43f5e' },
];

interface CharacterCreatorProps {
  initialConfig: CharacterConfig;
  onChangeConfig?: (config: CharacterConfig) => void;
  onStartGame: (config: CharacterConfig, role: PlayerRole) => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  initialConfig,
  onChangeConfig,
  onStartGame,
}) => {
  const [config, setConfig] = useState<CharacterConfig>(initialConfig);
  const [name, setName] = useState('Alex');
  const [selectedRole, setSelectedRole] = useState<PlayerRole>('buyer');
  const [activeTab, setActiveTab] = useState<'profile' | 'clothes' | 'trolley'>('profile');

  const handleUpdate = <K extends keyof CharacterConfig>(key: K, value: CharacterConfig[K]) => {
    sounds.playClick();
    const next = { ...config, [key]: value };
    setConfig(next);
    onChangeConfig?.(next);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    const next = { ...config, name: val };
    setConfig(next);
    onChangeConfig?.(next);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    sounds.playSuccess();
    onStartGame({ ...config, name: name.trim() }, selectedRole);
  };

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar with Title & Character Status Pill */}
      <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-6xl mx-auto">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-semibold mb-1 shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grade 7 Social Arithmetic 3D Game</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-display drop-shadow-md">
            CRAZY MARKET
          </h1>
        </div>

        {/* Live Character Tag */}
        <div className="flex items-center gap-3 p-2 px-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl backdrop-blur-md text-xs">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-inner"
            style={{ backgroundColor: config.shirtColor }}
          >
            {name.charAt(0).toUpperCase() || 'P'}
          </div>
          <div className="text-left">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{name || 'Shopper'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold uppercase">
                {config.gender}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              3D Character Customizer
            </div>
          </div>
        </div>
      </div>

      {/* Main Customization Card (Pinned Right on Desktop so 3D character is fully visible) */}
      <div className="pointer-events-auto w-full max-w-xl md:max-w-md md:ml-auto bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md text-white max-h-[75vh] overflow-y-auto">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('profile');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Character & Hair</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('clothes');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'clothes'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Outfits & Style</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('trolley');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'trolley'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Props & Trolley</span>
          </button>
        </div>

        {/* Tab 1: Profile & Face & Hair */}
        {activeTab === 'profile' && (
          <div className="mt-4 space-y-4">
            {/* Gender */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Gender / Character Base
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['boy', 'girl', 'neutral'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleUpdate('gender', g)}
                    className={`py-2 text-xs font-bold capitalize rounded-xl border transition-all ${
                      config.gender === g
                        ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/30'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {g === 'boy' ? '👦 Boy' : g === 'girl' ? '👧 Girl' : '🧑 Star'}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Tone */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Skin Tone
              </label>
              <div className="flex items-center gap-2">
                {SKIN_TONES.map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => handleUpdate('skinTone', st.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                      config.skinTone === st.value ? 'border-amber-400 scale-110 ring-2 ring-amber-400/40' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: st.value }}
                    title={st.label}
                  >
                    {config.skinTone === st.value && <Check className="w-4 h-4 text-slate-900" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Style & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Hair Style
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {HAIR_STYLES.map((hs) => (
                    <button
                      key={hs.value}
                      type="button"
                      onClick={() => handleUpdate('hairStyle', hs.value)}
                      className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                        config.hairStyle === hs.value
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {hs.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Hair Color
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {HAIR_COLORS.map((hc) => (
                    <button
                      key={hc.value}
                      type="button"
                      onClick={() => handleUpdate('hairColor', hc.value)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                        config.hairColor === hc.value ? 'border-amber-400 scale-110' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: hc.value }}
                      title={hc.label}
                    >
                      {config.hairColor === hc.value && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Outfits & Style */}
        {activeTab === 'clothes' && (
          <div className="mt-4 space-y-4">
            {/* Shirt Color */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Shirt / Clothes Color
              </label>
              <div className="flex items-center gap-2">
                {SHIRT_COLORS.map((sc) => (
                  <button
                    key={sc.value}
                    type="button"
                    onClick={() => handleUpdate('shirtColor', sc.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                      config.shirtColor === sc.value ? 'border-white scale-110 ring-2 ring-white/50' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: sc.value }}
                    title={sc.label}
                  >
                    {config.shirtColor === sc.value && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Pants Color */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Pants / Trousers Color
              </label>
              <div className="flex items-center gap-2">
                {PANTS_COLORS.map((pc) => (
                  <button
                    key={pc.value}
                    type="button"
                    onClick={() => handleUpdate('pantsColor', pc.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                      config.pantsColor === pc.value ? 'border-amber-400 scale-110' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: pc.value }}
                    title={pc.label}
                  >
                    {config.pantsColor === pc.value && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Shoes Color */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Shoes / Sneakers Color
              </label>
              <div className="flex items-center gap-2">
                {SHOES_COLORS.map((shc) => (
                  <button
                    key={shc.value}
                    type="button"
                    onClick={() => handleUpdate('shoesColor', shc.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                      config.shoesColor === shc.value ? 'border-amber-400 scale-110' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: shc.value }}
                    title={shc.label}
                  >
                    {config.shoesColor === shc.value && <Check className="w-4 h-4 text-slate-900" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Props & Trolley */}
        {activeTab === 'trolley' && (
          <div className="mt-4 space-y-4">
            {/* Accessories */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Face Props / Eyewear / Headset
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {ACCESSORIES.map((acc) => (
                  <button
                    key={acc.value}
                    type="button"
                    onClick={() => handleUpdate('accessory', acc.value)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      config.accessory === acc.value
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold ring-2 ring-amber-400/30'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <span className="text-xl block mb-0.5">{acc.icon}</span>
                    <span className="text-[11px] block">{acc.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trolley Color */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Shopping Trolley Grip & Bumper Color
              </label>
              <div className="flex items-center gap-2">
                {TROLLEY_COLORS.map((tc) => (
                  <button
                    key={tc.value}
                    type="button"
                    onClick={() => handleUpdate('trolleyColor', tc.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                      config.trolleyColor === tc.value ? 'border-white scale-110 ring-2 ring-white/50' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: tc.value }}
                    title={tc.label}
                  >
                    {config.trolleyColor === tc.value && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Name Input & Role Selection */}
        <form onSubmit={handleStart} className="mt-5 pt-4 border-t border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Type Your Name:
            </label>
            <input
              type="text"
              required
              maxLength={16}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter your shopper name..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-400 shadow-inner"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Choose Your Role:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Buyer Option */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedRole('buyer');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  selectedRole === 'buyer'
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-white mb-1">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Buyer (Pembeli)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Start with Rp 200.000. Push trolley, compare deals, unlock double discounts & complete shopping list!
                </p>
                {selectedRole === 'buyer' && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>

              {/* Seller Option */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedRole('seller');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  selectedRole === 'seller'
                    ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/40 text-emerald-200'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-white mb-1">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>Seller (Penjual)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Wait for customers, record cost & selling price, calculate discounts, and audit profit vs loss!
                </p>
                {selectedRole === 'seller' && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl hover:shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Enter Supermarket as {selectedRole === 'buyer' ? 'Buyer' : 'Seller'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
