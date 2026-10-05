import React from 'react';
import { X, Sword, Compass, Music, Heart } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#fef9eb] border-[6px] border-[#7d562b] rounded-2xl p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_3px_#eed7a1] text-amber-950 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-amber-800/20 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h2 className="text-xl font-bold text-[#7d3b1e]">可湖霖島冒險指南</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-amber-200/60 text-[#7d3b1e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Island Quest */}
        <div className="space-y-3 text-sm text-[#4a3525]">
          <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300/50">
            <h3 className="font-bold text-[#8d3b17] flex items-center gap-1.5 mb-1 text-sm">
              <Compass className="w-4 h-4" /> 冒險目標
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed text-[#5c432d]">
              <li>在美麗的可湖霖島上自由漫步，與瑪琳（Marin）對話了解島嶼的祕密。</li>
              <li>尋找散落各地的三件海妖樂器：
                <span className="font-semibold text-amber-900 block pl-4">
                  🎻 滿月大提琴（托隆波海灘） · 🐚 海螺號角（迷失之森） · 🔔 海百合之鈴（古代遺跡）
                </span>
              </li>
              <li>前往北方山頂的【神聖巨蛋】，奏響喚醒風之魚的終章曲。</li>
            </ul>
          </div>

          {/* Section 2: Controls */}
          <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300/50">
            <h3 className="font-bold text-[#8d3b17] flex items-center gap-1.5 mb-2 text-sm">
              <Sword className="w-4 h-4" /> 操作方式
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
                <span className="font-bold text-stone-800 block mb-0.5">移動方向</span>
                <span className="text-[#6d5138]">WASD 或 方向鍵 (↑↓←→)</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
                <span className="font-bold text-stone-800 block mb-0.5">揮劍 / 對話 / 互動</span>
                <span className="text-[#6d5138]">空白鍵 [Space] 或 [J] 鍵</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
                <span className="font-bold text-stone-800 block mb-0.5">觸控設備</span>
                <span className="text-[#6d5138]">螢幕左下虛擬搖桿 + 右下揮劍鈕</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
                <span className="font-bold text-stone-800 block mb-0.5">全島地圖</span>
                <span className="text-[#6d5138]">點擊頂部地圖鈕 或 [M] 鍵</span>
              </div>
            </div>
          </div>

          {/* Section 3: Exploration Tips */}
          <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300/50">
            <h3 className="font-bold text-[#8d3b17] flex items-center gap-1.5 mb-1 text-sm">
              <Heart className="w-4 h-4 text-red-500" /> 探險小提示
            </h3>
            <p className="text-xs leading-relaxed text-[#5c432d]">
              揮劍割除草叢除了能清理道路，還有機會收穫翠綠的盧比寶石 💎 與恢復生命值的愛心 ❤️！遇到跳躍的章魚怪也可以揮劍驅趕。
            </p>
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#7d562b] hover:bg-[#684620] text-amber-50 font-bold rounded-xl text-sm transition-colors shadow"
          >
            返回可湖霖島
          </button>
        </div>
      </div>
    </div>
  );
};
