import React, { useEffect, useState } from 'react';
import { DialogueLine } from '../types/game';
import { sound } from '../audio/soundEngine';

interface DialogueBoxProps {
  dialogue: DialogueLine | null;
  onNext: () => void;
  onClose: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  dialogue,
  onNext,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!dialogue) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const text = dialogue.text;

    const interval = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index % 2 === 0) {
        sound.playDialogueChirp();
      }

      if (index >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [dialogue]);

  if (!dialogue) return null;

  const handleClick = () => {
    if (isTyping) {
      // Fast forward full text
      setDisplayedText(dialogue.text);
      setIsTyping(false);
    } else {
      onNext();
    }
  };

  // Render character avatar
  const renderAvatar = () => {
    if (dialogue.portrait === 'marin_sing') {
      return (
        <div className="w-14 h-14 rounded-xl bg-amber-100 border-2 border-amber-800/30 flex items-center justify-center text-3xl shadow-inner relative shrink-0">
          🌺
          <span className="absolute -top-1 -right-1 text-xs">🎶</span>
        </div>
      );
    }
    if (dialogue.portrait === 'marin_sad') {
      return (
        <div className="w-14 h-14 rounded-xl bg-sky-100 border-2 border-amber-800/30 flex items-center justify-center text-3xl shadow-inner relative shrink-0">
          🌺
          <span className="absolute -top-1 -right-1 text-xs">💧</span>
        </div>
      );
    }
    if (dialogue.portrait === 'instrument') {
      return (
        <div className="w-14 h-14 rounded-xl bg-amber-50 border-2 border-amber-600/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
          ✨
        </div>
      );
    }
    if (dialogue.portrait === 'egg') {
      return (
        <div className="w-14 h-14 rounded-xl bg-orange-50 border-2 border-orange-500/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
          🥚
        </div>
      );
    }
    // Default Marin smile
    return (
      <div className="w-14 h-14 rounded-xl bg-amber-50 border-2 border-amber-800/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
        🌺
      </div>
    );
  };

  return (
    <div
      onClick={handleClick}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-40 cursor-pointer transition-transform active:scale-[0.99]"
    >
      <div className="bg-[#fef9eb] border-[4px] border-[#7d562b] rounded-2xl p-4 md:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.55),0_0_0_2px_#eed7a1] flex gap-4 items-center">
        {renderAvatar()}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-bold text-[#b54523] tracking-wide">
              {dialogue.speaker}
            </span>
            {dialogue.speakerRole && (
              <span className="text-xs text-amber-800/60 font-medium">
                · {dialogue.speakerRole}
              </span>
            )}
          </div>

          <p className="text-sm md:text-base text-[#3d2e1f] font-medium leading-relaxed min-h-[46px] whitespace-pre-line">
            {displayedText}
          </p>

          <div className="mt-2 flex justify-between items-center text-[11px] text-[#9c8264]">
            <span>{isTyping ? '點擊跳過打字…' : '點擊或按 [空白鍵] 繼續'}</span>
            <span className="animate-pulse text-[#b54523] font-bold">▼</span>
          </div>
        </div>
      </div>
    </div>
  );
};
