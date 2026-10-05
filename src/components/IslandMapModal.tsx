import React from 'react';
import { SirenInstrument, Position } from '../types/game';
import { X } from 'lucide-react';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../game/worldData';

interface IslandMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerPos: Position;
  instruments: SirenInstrument[];
}

export const IslandMapModal: React.FC<IslandMapModalProps> = ({
  isOpen,
  onClose,
  playerPos,
  instruments,
}) => {
  if (!isOpen) return null;

  // Relative player coordinates (percentage)
  const playerPercentX = (playerPos.x / WORLD_WIDTH) * 100;
  const playerPercentY = (playerPos.y / WORLD_HEIGHT) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#f7eed7] border-[6px] border-[#7d562b] rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_3px_#eed7a1] text-amber-950">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-[#b89569]/40 mb-3">
          <div>
            <h2 className="text-xl font-bold tracking-wide text-[#7d3b1e] flex items-center gap-2">
              🗺️ 可湖霖島全覽圖 (Koholint Island Map)
            </h2>
            <p className="text-xs text-[#876a4b]">夢幻島嶼的各個區域與沉睡樂器分佈</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-amber-200/60 text-[#7d3b1e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Canvas Visual Box */}
        <div className="relative w-full aspect-[11/8] bg-[#4ba3e3] rounded-xl overflow-hidden border-2 border-[#b89569]/60 shadow-inner">
          {/* Island Landmass shape */}
          <div className="absolute inset-[6%] bg-[#83c545] rounded-3xl overflow-hidden shadow-md">
            {/* North Mountain & Egg Area */}
            <div className="absolute top-0 left-[25%] right-[25%] h-[32%] bg-[#8d7b68] rounded-b-[40px] flex items-center justify-center border-b-2 border-stone-600/30">
              <div className="text-center">
                <span className="text-2xl drop-shadow">🥚</span>
                <p className="text-[10px] font-bold text-stone-100">塔瑪蘭奇山頂 / 風之魚巨蛋</p>
              </div>
            </div>

            {/* Northwest Mysterious Forest */}
            <div className="absolute top-[28%] left-0 w-[42%] h-[40%] bg-[#569b32] rounded-r-3xl p-2 border-r border-green-800/30">
              <span className="text-xs text-green-100 font-bold block">迷失之森 🌲</span>
              <p className="text-[9px] text-green-200/90 leading-tight">古木參天的薄霧森林</p>
            </div>

            {/* Center Mabe Village */}
            <div className="absolute top-[48%] left-[28%] w-[44%] h-[32%] bg-[#9bd75b] rounded-2xl p-2 border border-green-700/20 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-xs text-amber-950 font-bold">瑪貝村 🏡</span>
              <p className="text-[9px] text-amber-900/80">瑪琳的故鄉 · 風車廣場</p>
            </div>

            {/* East Ancient Ruins & Sand */}
            <div className="absolute top-[32%] right-0 w-[30%] h-[48%] bg-[#e3be7b] rounded-l-3xl p-2 border-l border-amber-700/30">
              <span className="text-xs text-amber-950 font-bold block">古代遺跡 🏛️</span>
              <p className="text-[9px] text-amber-900/90">沙岩柱石古殿</p>
            </div>

            {/* South Toronbo Beach */}
            <div className="absolute bottom-0 left-0 right-0 h-[26%] bg-[#fae58c] border-t-2 border-amber-300/60 p-2 flex items-center justify-between">
              <div className="pl-2">
                <span className="text-xs text-amber-900 font-bold block">托隆波海灘 🐚</span>
                <p className="text-[9px] text-amber-800/80">浪潮拍岸 · 漂流醒來之處</p>
              </div>
              <span className="text-base pr-2">🌊</span>
            </div>

            {/* Siren Instruments Markers */}
            {instruments.map((inst) => {
              const ix = (inst.x / WORLD_WIDTH) * 100;
              const iy = (inst.y / WORLD_HEIGHT) * 100;
              return (
                <div
                  key={inst.id}
                  style={{ left: `${ix}%`, top: `${iy}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md border transition-transform duration-300 ${
                      inst.taken
                        ? 'bg-amber-400 border-amber-100 text-stone-900 ring-2 ring-amber-500 scale-110'
                        : 'bg-stone-800/80 border-stone-400 text-white animate-bounce'
                    }`}
                  >
                    {inst.taken ? '✓' : inst.icon}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-black/80 text-white text-[9px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {inst.name} ({inst.taken ? '已得' : '未尋'})
                  </div>
                </div>
              );
            })}

            {/* Player Marker (Link) */}
            <div
              style={{ left: `${playerPercentX}%`, top: `${playerPercentY}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none transition-all duration-300"
            >
              <div className="relative flex items-center justify-center">
                <span className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg animate-ping absolute"></span>
                <span className="w-3.5 h-3.5 bg-emerald-600 rounded-full border-2 border-white shadow-md relative z-10 flex items-center justify-center text-[8px] text-white font-bold">
                  ▲
                </span>
              </div>
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 px-1 py-0.2 bg-emerald-800 text-emerald-100 text-[8px] font-bold rounded shadow whitespace-nowrap">
                林克
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap justify-between items-center text-xs text-[#6e4e2a] px-1 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white inline-block"></span> 林克所在位置
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> 樂器已獲得
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-800 inline-block"></span> 沉睡樂器神龕
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#7d562b] hover:bg-[#684620] text-amber-50 font-bold rounded-lg text-xs transition-colors shadow"
          >
            關閉地圖
          </button>
        </div>
      </div>
    </div>
  );
};
