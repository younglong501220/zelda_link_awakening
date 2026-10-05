/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bush,
  DialogueLine,
  Enemy,
  GameScreen,
  Player,
  Position,
  SirenInstrument,
  WeatherMode,
} from './types/game';
import {
  createWorldBushes,
  createWorldEnemies,
  createWorldObstacles,
  EGG_ALTAR,
  FOREST_BOUNDS,
  INITIAL_INSTRUMENTS,
  MARIN_INITIAL,
  TARIN_INITIAL,
} from './game/worldData';
import {
  getEggAltarDialogue,
  getInstrumentFoundDialogue,
  getMarinDialogue,
  TARIN_DIALOGUE,
} from './game/dialogues';
import { sound } from './audio/soundEngine';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { DialogueBox } from './components/DialogueBox';
import { IslandMapModal } from './components/IslandMapModal';
import { HelpModal } from './components/HelpModal';
import { VirtualControls } from './components/VirtualControls';
import { EndingSequence } from './components/EndingSequence';
import { Play, Sparkles } from 'lucide-react';

export default function App() {
  // Game screen state
  const [screen, setScreen] = useState<GameScreen>('TITLE');

  // Player state
  const [player, setPlayer] = useState<Player>({
    x: 630,
    y: 910,
    vx: 0,
    vy: 0,
    width: 26,
    height: 26,
    speed: 3.5,
    facing: 'down',
    isAttacking: false,
    attackTimer: 0,
    stepCycle: 0,
    hearts: 3,
    maxHearts: 3,
    rupees: 0,
    invincibleTimer: 0,
  });

  // World objects
  const [instruments, setInstruments] = useState<SirenInstrument[]>(INITIAL_INSTRUMENTS);
  const [bushes, setBushes] = useState<Bush[]>(createWorldBushes());
  const [enemies, setEnemies] = useState<Enemy[]>(createWorldEnemies());
  const obstacles = useRef(createWorldObstacles()).current;

  // Dialogues state
  const [dialogueQueue, setDialogueQueue] = useState<DialogueLine[]>([]);
  const [currentDialogue, setCurrentDialogue] = useState<DialogueLine | null>(null);

  // Modals state
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [weatherMode, setWeatherMode] = useState<WeatherMode>('rain_and_fog');

  // Virtual controls direction
  const [virtualDir, setVirtualDir] = useState<Position>({ x: 0, y: 0 });

  // Statistics
  const [bushesCutCount, setBushesCutCount] = useState(0);
  const [playTimeSeconds, setPlayTimeSeconds] = useState(0);

  // Play timer
  useEffect(() => {
    if (screen !== 'PLAYING') return;
    const timer = setInterval(() => {
      setPlayTimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [screen]);

  // Main game loop environmental audio system:
  // Random chirps play when the player's position is within the 'forest' coordinate bounds
  const lastForestBirdChirpTimeRef = useRef<number>(0);
  const nextForestBirdChirpDelayRef = useRef<number>(3500);

  useEffect(() => {
    if (screen !== 'PLAYING') return;

    const forestAudioLoop = setInterval(() => {
      // Check if player position is within the 'forest' coordinate bounds
      const isWithinForest =
        player.x >= FOREST_BOUNDS.minX &&
        player.x <= FOREST_BOUNDS.maxX &&
        player.y >= FOREST_BOUNDS.minY &&
        player.y <= FOREST_BOUNDS.maxY;

      if (isWithinForest && !isMuted) {
        const now = Date.now();
        if (now - lastForestBirdChirpTimeRef.current > nextForestBirdChirpDelayRef.current) {
          lastForestBirdChirpTimeRef.current = now;
          // Randomize next chirp delay between 4.5s and 9.5s
          nextForestBirdChirpDelayRef.current = 4500 + Math.random() * 5000;
          sound.ambientBirdChirp();
        }
      }
    }, 300);

    return () => clearInterval(forestAudioLoop);
  }, [player.x, player.y, screen, isMuted]);

  // Global key shortcuts (M for map, Escape for closing modals)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (screen !== 'PLAYING') return;
      if (e.key.toLowerCase() === 'm' && !currentDialogue) {
        setIsMapOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsMapOpen(false);
        setIsHelpOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [currentDialogue, screen]);

  // Start dialogue helper
  const triggerDialogue = useCallback((lines: DialogueLine[]) => {
    if (lines.length === 0) return;
    const [first, ...rest] = lines;
    setCurrentDialogue(first);
    setDialogueQueue(rest);
  }, []);

  // Next dialogue step
  const handleNextDialogue = useCallback(() => {
    if (dialogueQueue.length > 0) {
      const [next, ...rest] = dialogueQueue;
      setCurrentDialogue(next);
      setDialogueQueue(rest);
    } else {
      // Check if this was the final egg dialogue triggering the ending
      if (currentDialogue?.speaker === '命運的破曉') {
        setCurrentDialogue(null);
        setScreen('ENDING');
      } else {
        setCurrentDialogue(null);
      }
    }
  }, [currentDialogue, dialogueQueue]);

  // Start game from title
  const handleStartGame = () => {
    sound.init();
    sound.startLullaby();
    setScreen('PLAYING');

    // Initial wake-up dialogue with Marin
    triggerDialogue([
      {
        speaker: '少女的聲音',
        speakerRole: '可湖霖島的村民',
        portrait: 'marin_smile',
        text: '……林克？你醒了嗎？\n太好了，你終於張開眼睛了。',
      },
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_smile',
        text: '這裡是可湖霖島的瑪貝村。你在海灘上昏迷了很久，快過來跟我聊聊吧！',
      },
    ]);
  };

  // Sound mute toggle
  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  // Weather atmosphere mode toggle (Rain & Fog -> Fog Only -> Clear -> Rain & Fog)
  const handleToggleWeather = () => {
    setWeatherMode((prev) => {
      if (prev === 'rain_and_fog') return 'fog_only';
      if (prev === 'fog_only') return 'clear';
      return 'rain_and_fog';
    });
  };

  // Gain Rupees
  const handleGainRupee = useCallback((amount: number) => {
    setPlayer((prev) => ({ ...prev, rupees: prev.rupees + amount }));
  }, []);

  // Heal Heart
  const handleHealHeart = useCallback(() => {
    setPlayer((prev) => ({
      ...prev,
      hearts: Math.min(prev.maxHearts, prev.hearts + 1),
    }));
  }, []);

  // Bush cut counter
  const handleBushCut = useCallback(() => {
    setBushesCutCount((prev) => prev + 1);
  }, []);

  // Action key pressed (Space / J / Virtual Button)
  const handleActionTriggered = useCallback(() => {
    // If dialogue is active, advance dialogue
    if (currentDialogue) {
      handleNextDialogue();
      return;
    }

    // Trigger sword attack
    setPlayer((prev) => {
      if (prev.attackTimer > 0) return prev;
      sound.playSlash();
      return {
        ...prev,
        isAttacking: true,
        attackTimer: 12,
      };
    });

    const p = player;

    // Check interaction with Marin
    const distToMarin = Math.hypot(p.x - MARIN_INITIAL.x, p.y - MARIN_INITIAL.y);
    if (distToMarin < 50) {
      const takenCount = instruments.filter((i) => i.taken).length;
      triggerDialogue(getMarinDialogue(takenCount));
      return;
    }

    // Check interaction with Tarin
    const distToTarin = Math.hypot(p.x - TARIN_INITIAL.x, p.y - TARIN_INITIAL.y);
    if (distToTarin < 48) {
      triggerDialogue(TARIN_DIALOGUE);
      return;
    }

    // Check interaction with Siren Shrines
    instruments.forEach((shrine) => {
      if (!shrine.taken) {
        const dist = Math.hypot(p.x - shrine.x, p.y - shrine.y);
        if (dist < 46) {
          // Collect Instrument!
          sound.playFanfare();
          setInstruments((prev) =>
            prev.map((inst) =>
              inst.id === shrine.id ? { ...inst, taken: true } : inst
            )
          );
          triggerDialogue(
            getInstrumentFoundDialogue(
              shrine.name,
              shrine.region,
              shrine.poeticNote
            )
          );
        }
      }
    });

    // Check interaction with Mt. Tamaranch Egg
    const distToEgg = Math.hypot(p.x - EGG_ALTAR.x, p.y - EGG_ALTAR.y);
    if (distToEgg < 100) {
      const takenCount = instruments.filter((i) => i.taken).length;
      triggerDialogue(getEggAltarDialogue(takenCount));
    }
  }, [
    currentDialogue,
    handleNextDialogue,
    instruments,
    player,
    triggerDialogue,
  ]);

  // Restart adventure cleanly without reload
  const handleRestart = () => {
    setPlayer({
      x: 630,
      y: 910,
      vx: 0,
      vy: 0,
      width: 26,
      height: 26,
      speed: 3.5,
      facing: 'down',
      isAttacking: false,
      attackTimer: 0,
      stepCycle: 0,
      hearts: 3,
      maxHearts: 3,
      rupees: 0,
      invincibleTimer: 0,
    });
    setInstruments(INITIAL_INSTRUMENTS.map((inst) => ({ ...inst, taken: false })));
    setBushes(createWorldBushes());
    setEnemies(createWorldEnemies());
    setCurrentDialogue(null);
    setDialogueQueue([]);
    setBushesCutCount(0);
    setPlayTimeSeconds(0);
    setScreen('PLAYING');
    sound.startLullaby();
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#11131b] flex items-center justify-center font-sans">
      {/* Outer Diorama Frame for Desktop Presentation */}
      <div className="relative w-full h-full md:w-[94vw] md:h-[90vh] md:max-w-6xl md:rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_0_10px_#e5c58a,0_0_0_14px_#8c6838] bg-black">
        {/* Active Game Canvas */}
        <GameCanvas
          player={player}
          setPlayer={setPlayer}
          instruments={instruments}
          bushes={bushes}
          setBushes={setBushes}
          enemies={enemies}
          setEnemies={setEnemies}
          obstacles={obstacles}
          isDialogueActive={!!currentDialogue}
          virtualDir={virtualDir}
          weatherMode={weatherMode}
          onActionTriggered={handleActionTriggered}
          onGainRupee={handleGainRupee}
          onHealHeart={handleHealHeart}
          onBushCut={handleBushCut}
        />

        {/* HUD Elements */}
        {screen === 'PLAYING' && (
          <HUD
            hearts={player.hearts}
            maxHearts={player.maxHearts}
            rupees={player.rupees}
            instruments={instruments}
            isMuted={isMuted}
            weatherMode={weatherMode}
            onToggleWeather={handleToggleWeather}
            onToggleMute={handleToggleMute}
            onOpenMap={() => setIsMapOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
          />
        )}

        {/* Dialogue Box */}
        {screen === 'PLAYING' && currentDialogue && (
          <DialogueBox
            dialogue={currentDialogue}
            onNext={handleNextDialogue}
            onClose={() => setCurrentDialogue(null)}
          />
        )}

        {/* Virtual On-Screen Controls for Mobile/Touch */}
        {screen === 'PLAYING' && !currentDialogue && (
          <VirtualControls
            onDirectionChange={setVirtualDir}
            onAction={handleActionTriggered}
          />
        )}

        {/* TITLE SCREEN OVERLAY */}
        {screen === 'TITLE' && (
          <div className="absolute inset-0 z-50 bg-[#161a26]/90 backdrop-blur-md flex flex-col justify-center items-center text-center p-6 text-[#f7eed7] select-none">
            <div className="max-w-xl animate-in zoom-in-95 duration-500">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                致敬《薩爾達傳說：織夢島》黏土微縮童話
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-[#fed876] tracking-wider mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                可湖霖島的搖籃曲
              </h1>
              <h2 className="text-sm md:text-base text-amber-200/90 font-medium mb-6 tracking-widest">
                KOHOLINT'S LULLABY · BALLAD OF THE WIND FISH
              </h2>

              <p className="text-xs md:text-sm text-[#d4c5b3] leading-relaxed mb-8 max-w-lg mx-auto">
                你因風暴漂流到了這座綠意盎然的小島。<br />
                村民說，只要在北方山頂的巨蛋前集齊三件海妖樂器，風之魚就會甦醒。<br />
                ……但醒來之後，這個美麗的世界會怎樣呢？
              </p>

              <button
                onClick={handleStartGame}
                className="group px-8 py-3.5 bg-[#6bb343] hover:bg-[#5da037] active:bg-[#46792a] text-white text-base md:text-lg font-bold rounded-full shadow-[0_6px_0_#46792a,0_10px_25px_rgba(0,0,0,0.4)] transition-all transform active:translate-y-1 flex items-center gap-2.5 mx-auto cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                點擊進入夢境
              </button>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap justify-center gap-4 text-xs text-[#a39482]">
                <span>【移動: WASD / 方向鍵 / 虛擬搖桿】</span>
                <span>【揮劍 / 互動: 空白鍵 / J 鍵】</span>
                <span>【全島地圖: M 鍵】</span>
              </div>
            </div>
          </div>
        )}

        {/* ENDING SEQUENCE OVERLAY */}
        {screen === 'ENDING' && (
          <EndingSequence
            instruments={instruments}
            rupees={player.rupees}
            bushesCutCount={bushesCutCount}
            playTimeSeconds={playTimeSeconds}
            onRestart={handleRestart}
          />
        )}

        {/* ISLAND MAP MODAL */}
        <IslandMapModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          playerPos={{ x: player.x, y: player.y }}
          instruments={instruments}
        />

        {/* HELP & CONTROLS MODAL */}
        <HelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      </div>
    </main>
  );
}
