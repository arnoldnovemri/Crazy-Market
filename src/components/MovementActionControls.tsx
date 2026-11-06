import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  RotateCcw,
  ShoppingBag,
  Calculator,
  EyeOff,
  Gamepad2,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface MovementActionControlsProps {
  onDirectionPress: (dir: 'forward' | 'backward' | 'left' | 'right' | 'turnLeft' | 'turnRight', active: boolean) => void;
  onAmbil: () => void;
  onHitung: () => void;
  role: 'buyer' | 'seller';
  isNearStall?: boolean;
}

export const MovementActionControls: React.FC<MovementActionControlsProps> = ({
  onDirectionPress,
  onAmbil,
  onHitung,
  role,
  isNearStall = false,
}) => {
  // In Seller mode, controls are hidden by default to keep the cash register clean
  const [isHidden, setIsHidden] = useState<boolean>(role === 'seller');

  if (isHidden) {
    return (
      <div className="fixed bottom-6 left-4 right-4 z-20 flex items-end justify-between pointer-events-none select-none">
        {/* Minimized Pill Button */}
        <div className="pointer-events-auto">
          <button
            onClick={() => {
              sounds.playClick();
              setIsHidden(false);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 rounded-xl text-xs font-bold text-amber-300 shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            title="Tampilkan kembali kontrol arah"
          >
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>Tampilkan Kontrol</span>
          </button>
        </div>

        {/* Right Pad Action Buttons "Ambil" & "Hitung" always handy */}
        <div className="pointer-events-auto flex items-center gap-2.5 p-1.5 bg-slate-900/80 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md">
          <button
            onClick={() => {
              sounds.playClick();
              onAmbil();
            }}
            className={`flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 ${
              isNearStall || role === 'seller'
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 hover:brightness-110'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
            }`}
            title={role === 'buyer' ? 'Ambil / Belanja Barang di Toko' : 'Ambil Pesanan Pelanggan'}
          >
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            <span>Ambil</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onHitung();
            }}
            className="flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 hover:brightness-110 transition-all shadow-md active:scale-95"
            title={role === 'buyer' ? 'Hitung Total & Rumus Aritmetika Sosial' : 'Hitung Kasir & Audit Untung/Rugi'}
          >
            <Calculator className="w-5 h-5 mb-0.5" />
            <span>Hitung</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-4 right-4 z-20 flex items-end justify-between pointer-events-none select-none">
      {/* Left Pad: Directional Movement (Depan, Belakang, Kiri, Kanan, Putar) */}
      <div className="pointer-events-auto flex flex-col items-center gap-1.5 p-2.5 bg-slate-900/85 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
        {/* Header bar with Hide button */}
        <div className="flex items-center justify-between w-full px-1 pb-1 border-b border-slate-800/80">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase tracking-wide">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Kontrol Gerak</span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setIsHidden(true);
            }}
            className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-750 px-2 py-0.5 rounded-md transition-colors"
            title="Sembunyikan tombol kontrol"
          >
            <EyeOff className="w-3 h-3" />
            <span>Hide</span>
          </button>
        </div>

        {/* Top row: Turn Left, Forward (Depan), Turn Right */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirectionPress('turnLeft', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirectionPress('turnLeft', false); }}
            onMouseDown={() => onDirectionPress('turnLeft', true)}
            onMouseUp={() => onDirectionPress('turnLeft', false)}
            className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 border border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-300 shadow transition-colors"
            title="Putar Kiri (Turn Left)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[9px] font-bold">Putar</span>
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); onDirectionPress('forward', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirectionPress('forward', false); }}
            onMouseDown={() => onDirectionPress('forward', true)}
            onMouseUp={() => onDirectionPress('forward', false)}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500/20 hover:bg-amber-500/30 active:bg-amber-400 active:text-slate-950 border border-amber-400/50 rounded-xl flex flex-col items-center justify-center text-amber-300 shadow-md transition-colors"
            title="Maju Depan (Forward)"
          >
            <ArrowUp className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase">Depan</span>
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); onDirectionPress('turnRight', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirectionPress('turnRight', false); }}
            onMouseDown={() => onDirectionPress('turnRight', true)}
            onMouseUp={() => onDirectionPress('turnRight', false)}
            className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 border border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-300 shadow transition-colors"
            title="Putar Kanan (Turn Right)"
          >
            <RotateCw className="w-4 h-4" />
            <span className="text-[9px] font-bold">Putar</span>
          </button>
        </div>

        {/* Bottom row: Kiri (Left), Belakang (Backward), Kanan (Right) */}
        <div className="flex items-center gap-1.5">
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirectionPress('left', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirectionPress('left', false); }}
            onMouseDown={() => onDirectionPress('left', true)}
            onMouseUp={() => onDirectionPress('left', false)}
            className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 border border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-300 shadow transition-colors"
            title="Geser Kiri (Strafe Left)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase">Kiri</span>
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); onDirectionPress('backward', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirectionPress('backward', false); }}
            onMouseDown={() => onDirectionPress('backward', true)}
            onMouseUp={() => onDirectionPress('backward', false)}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 border border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-300 shadow transition-colors"
            title="Mundur Belakang (Backward)"
          >
            <ArrowDown className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase">Belakang</span>
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); onDirectionPress('right', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirectionPress('right', false); }}
            onMouseDown={() => onDirectionPress('right', true)}
            onMouseUp={() => onDirectionPress('right', false)}
            className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 border border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-300 shadow transition-colors"
            title="Geser Kanan (Strafe Right)"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase">Kanan</span>
          </button>
        </div>
      </div>

      {/* Right Pad: Dedicated Action Buttons "Ambil" & "Hitung" */}
      <div className="pointer-events-auto flex items-center gap-3 p-2 bg-slate-900/80 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md">
        {/* Tombol Ambil */}
        <button
          onClick={() => {
            sounds.playClick();
            onAmbil();
          }}
          className={`flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
            isNearStall || role === 'seller'
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 hover:brightness-110 shadow-emerald-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
          }`}
          title={role === 'buyer' ? 'Ambil / Belanja Barang di Toko' : 'Ambil Pesanan Pelanggan'}
        >
          <ShoppingBag className="w-6 h-6 mb-1" />
          <span>Ambil</span>
        </button>

        {/* Tombol Hitung */}
        <button
          onClick={() => {
            sounds.playClick();
            onHitung();
          }}
          className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 hover:brightness-110 transition-all shadow-lg active:scale-95 shadow-amber-500/20"
          title={role === 'buyer' ? 'Hitung Total & Rumus Aritmetika Sosial' : 'Hitung Kasir & Audit Untung/Rugi'}
        >
          <Calculator className="w-6 h-6 mb-1" />
          <span>Hitung</span>
        </button>
      </div>
    </div>
  );
};
