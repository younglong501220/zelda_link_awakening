import React from 'react';

interface VirtualControlsProps {
  onDirectionChange: (dir: { x: number; y: number }) => void;
  onAction: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onDirectionChange,
  onAction,
}) => {
  const [activeDirs, setActiveDirs] = React.useState({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const updateDir = (newDirs: typeof activeDirs) => {
    setActiveDirs(newDirs);
    let x = 0;
    let y = 0;
    if (newDirs.left) x -= 1;
    if (newDirs.right) x += 1;
    if (newDirs.up) y -= 1;
    if (newDirs.down) y += 1;
    onDirectionChange({ x, y });
  };

  const handleTouchStart = (dir: 'up' | 'down' | 'left' | 'right') => {
    const next = { ...activeDirs, [dir]: true };
    updateDir(next);
  };

  const handleTouchEnd = (dir: 'up' | 'down' | 'left' | 'right') => {
    const next = { ...activeDirs, [dir]: false };
    updateDir(next);
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-30 select-none md:opacity-85 hover:opacity-100 transition-opacity">
      {/* Directional Pad */}
      <div className="relative w-36 h-36 pointer-events-auto">
        {/* Background cross */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-36 bg-black/40 backdrop-blur-md rounded-xl border border-amber-500/20"></div>
          <div className="absolute h-12 w-36 bg-black/40 backdrop-blur-md rounded-xl border border-amber-500/20"></div>
        </div>

        {/* Up */}
        <button
          onMouseDown={() => handleTouchStart('up')}
          onMouseUp={() => handleTouchEnd('up')}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('up'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('up'); }}
          className={`absolute top-0 left-12 w-12 h-12 flex items-center justify-center rounded-t-xl text-amber-200 text-lg font-bold transition-colors ${
            activeDirs.up ? 'bg-amber-500/40 text-white' : 'hover:bg-amber-500/20'
          }`}
        >
          ▲
        </button>

        {/* Down */}
        <button
          onMouseDown={() => handleTouchStart('down')}
          onMouseUp={() => handleTouchEnd('down')}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('down'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('down'); }}
          className={`absolute bottom-0 left-12 w-12 h-12 flex items-center justify-center rounded-b-xl text-amber-200 text-lg font-bold transition-colors ${
            activeDirs.down ? 'bg-amber-500/40 text-white' : 'hover:bg-amber-500/20'
          }`}
        >
          ▼
        </button>

        {/* Left */}
        <button
          onMouseDown={() => handleTouchStart('left')}
          onMouseUp={() => handleTouchEnd('left')}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('left'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('left'); }}
          className={`absolute top-12 left-0 w-12 h-12 flex items-center justify-center rounded-l-xl text-amber-200 text-lg font-bold transition-colors ${
            activeDirs.left ? 'bg-amber-500/40 text-white' : 'hover:bg-amber-500/20'
          }`}
        >
          ◀
        </button>

        {/* Right */}
        <button
          onMouseDown={() => handleTouchStart('right')}
          onMouseUp={() => handleTouchEnd('right')}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('right'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('right'); }}
          className={`absolute top-12 right-0 w-12 h-12 flex items-center justify-center rounded-r-xl text-amber-200 text-lg font-bold transition-colors ${
            activeDirs.right ? 'bg-amber-500/40 text-white' : 'hover:bg-amber-500/20'
          }`}
        >
          ▶
        </button>

        {/* Center hub */}
        <div className="absolute top-12 left-12 w-12 h-12 bg-amber-900/30 rounded-md pointer-events-none flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-amber-400/40"></div>
        </div>
      </div>

      {/* Action Button: Sword / Interact */}
      <div className="pointer-events-auto">
        <button
          onMouseDown={onAction}
          onTouchStart={(e) => { e.preventDefault(); onAction(); }}
          className="w-20 h-20 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border-4 border-amber-300 shadow-[0_6px_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center font-bold transition-transform active:scale-95"
        >
          <span className="text-2xl">⚔️</span>
          <span className="text-[10px] tracking-tight mt-0.5">揮劍 / 互動</span>
        </button>
      </div>
    </div>
  );
};
