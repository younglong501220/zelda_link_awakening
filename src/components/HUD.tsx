import React from 'react';
import { SirenInstrument, WeatherMode } from '../types/game';
import { Map, Volume2, VolumeX, HelpCircle, CloudRain, CloudFog, Sun } from 'lucide-react';

interface HUDProps {
  hearts: number;
  maxHearts: number;
  rupees: number;
  instruments: SirenInstrument[];
  isMuted: boolean;
  weatherMode: WeatherMode;
  onToggleWeather: () => void;
  onToggleMute: () => void;
  onOpenMap: () => void;
  onOpenHelp: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  hearts,
  maxHearts,
  rupees,
  instruments,
  isMuted,
  weatherMode,
  onToggleWeather,
  onToggleMute,
  onOpenMap,
  onOpenHelp,
}) => {
  return (
    <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none z-30 select-none">
      {/* Left side: Hearts & Rupees */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        {/* Hearts */}
        <div className="bg-[#241a12]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/30 flex items-center gap-1.5 shadow-lg">
          {Array.from({ length: maxHearts }).map((_, i) => (
            <span
              key={i}
              className={`text-lg transition-transform duration-300 ${
                i < hearts ? 'text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] scale-100' : 'text-stone-600 grayscale opacity-40 scale-90'
              }`}
            >
              ❤️
            </span>
          ))}
        </div>

        {/* Rupees Counter */}
        <div className="bg-[#241a12]/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-2 shadow-lg self-start">
          <span className="text-emerald-400 font-bold text-sm tracking-wider flex items-center gap-1">
            <span className="w-2.5 h-3.5 bg-emerald-400 rounded-sm inline-block shadow-[0_0_8px_#34d399] rotate-45 transform origin-center"></span>
            <span className="ml-1 text-white font-mono tabular-nums">{rupees}</span>
          </span>
        </div>
      </div>

      {/* Center / Right: Siren Instruments Bar & Quick Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Siren Instruments */}
        <div className="bg-[#241a12]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/30 flex items-center gap-3 shadow-lg">
          <span className="text-[11px] text-amber-200/80 font-medium hidden sm:inline">
            海妖樂器:
          </span>
          <div className="flex items-center gap-2">
            {instruments.map((inst) => (
              <div
                key={inst.id}
                title={`${inst.name} (${inst.region}) - ${inst.taken ? '已收集' : '尚未尋得'}`}
                className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-500 ${
                  inst.taken
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)] scale-105'
                    : 'bg-black/30 border-stone-700 text-stone-500 grayscale opacity-40'
                }`}
              >
                <span className="text-base">{inst.icon}</span>
                {inst.taken && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Map Button */}
        <button
          onClick={onOpenMap}
          title="打開可湖霖島地圖"
          className="bg-[#241a12]/80 hover:bg-[#3d2c1f] backdrop-blur-md p-2 rounded-full border border-amber-500/30 text-amber-200 shadow-lg transition-transform active:scale-90"
        >
          <Map className="w-4 h-4" />
        </button>

        {/* Weather Toggle */}
        <button
          onClick={onToggleWeather}
          title={`天氣氛圍: ${weatherMode === 'rain_and_fog' ? '微雨晨霧 (點擊切換)' : weatherMode === 'fog_only' ? '靜謐迷霧 (點擊切換)' : '晴朗晴空 (點擊切換)'}`}
          className="bg-[#241a12]/80 hover:bg-[#3d2c1f] backdrop-blur-md p-2 rounded-full border border-amber-500/30 text-amber-200 shadow-lg transition-transform active:scale-90"
        >
          {weatherMode === 'rain_and_fog' ? (
            <CloudRain className="w-4 h-4 text-sky-400" />
          ) : weatherMode === 'fog_only' ? (
            <CloudFog className="w-4 h-4 text-indigo-300" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? '開啟音樂音效' : '靜音'}
          className="bg-[#241a12]/80 hover:bg-[#3d2c1f] backdrop-blur-md p-2 rounded-full border border-amber-500/30 text-amber-200 shadow-lg transition-transform active:scale-90"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Help Button */}
        <button
          onClick={onOpenHelp}
          title="操作說明與目標"
          className="bg-[#241a12]/80 hover:bg-[#3d2c1f] backdrop-blur-md p-2 rounded-full border border-amber-500/30 text-amber-200 shadow-lg transition-transform active:scale-90"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
