import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, RotateCcw } from 'lucide-react';

interface VirtualControlsProps {
  onDirectionPress: (dir: 'forward' | 'backward' | 'left' | 'right' | 'turnLeft' | 'turnRight', active: boolean) => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({ onDirectionPress }) => {
  return (
    <div className="fixed bottom-24 right-4 z-20 flex flex-col items-center gap-1.5 pointer-events-auto sm:hidden select-none">
      <div className="flex items-center gap-1.5">
        <button
          onTouchStart={() => onDirectionPress('turnLeft', true)}
          onTouchEnd={() => onDirectionPress('turnLeft', false)}
          onMouseDown={() => onDirectionPress('turnLeft', true)}
          onMouseUp={() => onDirectionPress('turnLeft', false)}
          className="w-11 h-11 bg-slate-900/90 active:bg-amber-400 active:text-slate-950 border border-slate-700 rounded-xl flex items-center justify-center text-slate-300 shadow-lg"
          title="Turn Left"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onTouchStart={() => onDirectionPress('forward', true)}
          onTouchEnd={() => onDirectionPress('forward', false)}
          onMouseDown={() => onDirectionPress('forward', true)}
          onMouseUp={() => onDirectionPress('forward', false)}
          className="w-12 h-12 bg-slate-900/90 active:bg-amber-400 active:text-slate-950 border border-slate-700 rounded-xl flex items-center justify-center text-slate-300 shadow-lg"
          title="Forward"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <button
          onTouchStart={() => onDirectionPress('turnRight', true)}
          onTouchEnd={() => onDirectionPress('turnRight', false)}
          onMouseDown={() => onDirectionPress('turnRight', true)}
          onMouseUp={() => onDirectionPress('turnRight', false)}
          className="w-11 h-11 bg-slate-900/90 active:bg-amber-400 active:text-slate-950 border border-slate-700 rounded-xl flex items-center justify-center text-slate-300 shadow-lg"
          title="Turn Right"
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onTouchStart={() => onDirectionPress('left', true)}
          onTouchEnd={() => onDirectionPress('left', false)}
          onMouseDown={() => onDirectionPress('left', true)}
          onMouseUp={() => onDirectionPress('left', false)}
          className="w-11 h-11 bg-slate-900/90 active:bg-amber-400 active:text-slate-950 border border-slate-700 rounded-xl flex items-center justify-center text-slate-300 shadow-lg"
          title="Strafe Left"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onTouchStart={() => onDirectionPress('backward', true)}
          onTouchEnd={() => onDirectionPress('backward', false)}
          onMouseDown={() => onDirectionPress('backward', true)}
          onMouseUp={() => onDirectionPress('backward', false)}
          className="w-12 h-12 bg-slate-900/90 active:bg-amber-400 active:text-slate-950 border border-slate-700 rounded-xl flex items-center justify-center text-slate-300 shadow-lg"
          title="Backward"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <button
          onTouchStart={() => onDirectionPress('right', true)}
          onTouchEnd={() => onDirectionPress('right', false)}
          onMouseDown={() => onDirectionPress('right', true)}
          onMouseUp={() => onDirectionPress('right', false)}
          className="w-11 h-11 bg-slate-900/90 active:bg-amber-400 active:text-slate-950 border border-slate-700 rounded-xl flex items-center justify-center text-slate-300 shadow-lg"
          title="Strafe Right"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
