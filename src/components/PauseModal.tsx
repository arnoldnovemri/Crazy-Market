import React from 'react';
import { Play, RotateCcw, Home, Flag, Volume2, VolumeX, X } from 'lucide-react';
import { sounds } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onEndGame: () => void;
  onRestart: () => void;
  onGoHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onEndGame,
  onRestart,
  onGoHome,
}) => {
  const [isMuted, setIsMuted] = React.useState(sounds.getMuted());

  const toggleMute = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl p-6 text-white shadow-2xl animate-in zoom-in-95">
        <button
          onClick={() => {
            sounds.playClick();
            onResume();
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold font-mono">⏸️</span>
          </div>
          <h2 className="text-2xl font-black font-display tracking-tight text-white">
            GAME PAUSED
          </h2>
          <p className="text-xs text-slate-400 mt-1">Take a breath or manage your session</p>
        </div>

        <div className="space-y-2.5">
          {/* Resume */}
          <button
            onClick={() => {
              sounds.playClick();
              onResume();
            }}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume (Lanjutkan)</span>
          </button>

          {/* End Game */}
          <button
            onClick={() => {
              sounds.playClick();
              onEndGame();
            }}
            className="w-full py-3 bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Flag className="w-4 h-4" />
            <span>End Game (Akhiri Sesi)</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sounds.playClick();
              onRestart();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Restart Current Level</span>
          </button>

          {/* Home */}
          <button
            onClick={() => {
              sounds.playClick();
              onGoHome();
            }}
            className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-300 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>Main Menu / Home</span>
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Audio Sound Effects:</span>
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-lg hover:text-white transition-colors"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
