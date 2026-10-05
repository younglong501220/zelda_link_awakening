import React, { useEffect, useState } from 'react';
import { SirenInstrument } from '../types/game';
import { sound } from '../audio/soundEngine';

interface EndingSequenceProps {
  instruments: SirenInstrument[];
  rupees: number;
  bushesCutCount: number;
  playTimeSeconds: number;
  onRestart: () => void;
}

export const EndingSequence: React.FC<EndingSequenceProps> = ({
  rupees,
  bushesCutCount,
  playTimeSeconds,
  onRestart,
}) => {
  const [phase, setPhase] = useState<'AWAKENING' | 'FAREWELL' | 'SEAGULL' | 'SUMMARY'>('AWAKENING');
  const [fadeAlpha, setFadeAlpha] = useState(0);

  useEffect(() => {
    // Sound awakening effect
    sound.playEggAwaken();

    // Sequence timing
    const t1 = setTimeout(() => {
      setPhase('FAREWELL');
    }, 4500);

    const t2 = setTimeout(() => {
      sound.playSeagull();
      setPhase('SEAGULL');
    }, 11000);

    const t3 = setTimeout(() => {
      setPhase('SUMMARY');
    }, 17500);

    // Fade in animation
    const interval = setInterval(() => {
      setFadeAlpha((prev) => Math.min(1, prev + 0.02));
    }, 30);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins} 分 ${remaining} 秒`;
  };

  return (
    <div
      style={{ opacity: fadeAlpha }}
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-1000 select-none overflow-hidden"
    >
      {/* Background layer */}
      {phase === 'SEAGULL' || phase === 'SUMMARY' ? (
        // Open endless blue ocean sky
        <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8] via-[#7dd3fc] to-[#0284c7] transition-all duration-1000">
          {/* Distant horizon sun */}
          <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-amber-100/90 shadow-[0_0_120px_#fef08a] blur-[1px]"></div>
          {/* Gentle water shimmer */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0369a1] to-[#0ea5e9]/70 border-t-2 border-white/40"></div>
        </div>
      ) : (
        // Warm golden dream dissolution
        <div className="absolute inset-0 bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#fed7aa] transition-all duration-1000">
          {/* Golden dream motes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                style={{
                  left: `${(i * 19) % 100}%`,
                  top: `${(i * 23) % 100}%`,
                  animationDuration: `${3 + (i % 4)}s`,
                }}
                className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-bounce opacity-70"
              />
            ))}
          </div>
        </div>
      )}

      {/* PHASE 1: Awakening */}
      {phase === 'AWAKENING' && (
        <div className="relative text-center p-8 max-w-xl mx-auto z-10 animate-in zoom-in-95 duration-1000">
          <div className="text-6xl mb-6 animate-pulse">🥚✨</div>
          <h2 className="text-2xl md:text-3xl font-bold text-amber-950 mb-3 tracking-wide">
            海妖之音齊聚 · 風之魚甦醒
          </h2>
          <p className="text-sm md:text-base text-amber-900 leading-relaxed font-medium">
            滿月大提琴、海螺號角、海百合之鈴在山頂交織成溫暖的旋律……<br />
            神聖巨蛋在萬丈金光中破曉，沈寂已久的夢境悄然揭開了帷幕。
          </p>
        </div>
      )}

      {/* PHASE 2: Marin's Farewell */}
      {phase === 'FAREWELL' && (
        <div className="relative text-center p-8 max-w-xl mx-auto z-10 animate-in fade-in duration-1000">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-100 border-4 border-amber-600/40 shadow-2xl flex items-center justify-center text-5xl">
            🌺
          </div>
          <div className="bg-amber-950/20 backdrop-blur-md p-6 rounded-2xl border border-amber-600/30 shadow-xl">
            <p className="text-xl md:text-2xl font-bold text-amber-950 mb-4 tracking-wider leading-relaxed">
              『林克……請不要忘記我。』
            </p>
            <p className="text-base md:text-lg text-amber-900 font-semibold mb-4 leading-relaxed">
              『只要你還記得這首微風中的歌，可湖霖島就永遠不會消失。』
            </p>
            <p className="text-xs text-amber-800/80 italic">
              瑪琳溫柔地微笑著，身影逐漸化作萬千閃爍的星塵，隨風散入天際……
            </p>
          </div>
        </div>
      )}

      {/* PHASE 3: Seagull Awakening */}
      {phase === 'SEAGULL' && (
        <div className="relative text-center p-8 max-w-xl mx-auto z-10 animate-in fade-in duration-1000">
          {/* Seagull gliding silhouette */}
          <div className="relative w-36 h-20 mx-auto mb-8 animate-pulse">
            <span className="text-6xl drop-shadow-lg">🕊️</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-sky-950 mb-3 drop-shadow-sm">
            海鷗展翅 · 蔚藍長空
          </h3>
          <p className="text-base text-sky-900 font-medium leading-relaxed mb-2">
            耳畔傳來浪濤輕柔的拍打聲與悠遠的海鷗長鳴。<br />
            你於浩瀚無垠的汪洋浮木上緩緩睜開雙眸。
          </p>
          <p className="text-sm text-sky-800 font-semibold">
            那隻白色的海鷗盤旋在陽光中，朝著自由的遠方翱翔而去。
          </p>
        </div>
      )}

      {/* PHASE 4: Summary & Restart Card */}
      {phase === 'SUMMARY' && (
        <div className="relative bg-[#fef9eb] border-[6px] border-[#7d562b] rounded-2xl p-6 md:p-8 max-w-lg w-[90%] shadow-[0_25px_60px_rgba(0,0,0,0.6),0_0_0_3px_#eed7a1] text-amber-950 z-20 animate-in zoom-in-95 duration-700">
          <div className="text-center pb-4 border-b-2 border-amber-800/20 mb-5">
            <span className="text-3xl block mb-1">🎼</span>
            <h2 className="text-2xl font-bold text-[#7d3b1e]">織夢島之歌 · 通關結語</h2>
            <p className="text-xs text-amber-800 mt-1">致敬《薩爾達傳說：織夢島》與風之魚的搖籃曲</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300/60 text-center">
              <span className="text-xs text-amber-800 block mb-0.5">海妖樂器</span>
              <span className="text-lg font-bold text-amber-900">3 / 3 全收集 🎻</span>
            </div>
            <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300/60 text-center">
              <span className="text-xs text-amber-800 block mb-0.5">獲得盧比</span>
              <span className="text-lg font-bold text-emerald-700">💎 {rupees}</span>
            </div>
            <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300/60 text-center">
              <span className="text-xs text-amber-800 block mb-0.5">揮砍割草</span>
              <span className="text-lg font-bold text-amber-900">{bushesCutCount} 叢</span>
            </div>
            <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300/60 text-center">
              <span className="text-xs text-amber-800 block mb-0.5">探索時長</span>
              <span className="text-lg font-bold text-amber-900">{formatTime(playTimeSeconds)}</span>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={onRestart}
              className="w-full py-3 bg-[#6bb343] hover:bg-[#5aa034] active:bg-[#46792a] text-white font-bold rounded-xl shadow-[0_6px_0_#46792a,0_10px_20px_rgba(0,0,0,0.3)] transition-transform active:translate-y-1 text-base tracking-wide"
            >
              再次入夢 · 重啟冒險
            </button>
            <p className="text-[11px] text-amber-800/80 mt-3">
              只要樂聲在心中響起，可湖霖島的微風就永不消逝。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
