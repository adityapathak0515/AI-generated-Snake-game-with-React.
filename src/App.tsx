/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, Trophy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const SPEED = 150;

const TRACKS = [
  {
    id: 1,
    title: "SIGNAL_01",
    artist: "CYBER_GEN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "SIGNAL_02",
    artist: "RETRO_MIND",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "SIGNAL_03",
    artist: "VAPOR_BOT",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

export default function App() {
  // --- Music Player State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  // --- Snake Game State ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const lastMoveTimeRef = useRef(0);

  // --- Music Logic ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  // --- Snake Logic ---
  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    generateFood();
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setDirection(nextDirection);
    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + nextDirection.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + nextDirection.y + GRID_SIZE) % GRID_SIZE,
      };

      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [nextDirection, food, gameOver, gameStarted, score, highScore, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setNextDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setNextDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setNextDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setNextDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const interval = setInterval(moveSnake, 120); // Faster tick for smoother feel
      return () => clearInterval(interval);
    }
  }, [moveSnake, gameStarted, gameOver]);

  return (
    <div className="min-h-screen bg-black text-cyan font-pixel selection:bg-magenta selection:text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* CRT Effects */}
      <div className="crt-overlay" />
      <div className="scanline" />

      {/* Background Static Noise (Subtle) */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />

      <header className="mb-12 text-center z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl font-black tracking-tighter uppercase glitch-text"
          data-text="NEON_SNAKE.SYS"
        >
          NEON_SNAKE.SYS
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5 }}
          className="text-xs tracking-[0.4em] uppercase mt-4 font-bold text-magenta"
        >
          [ STATUS: ENCRYPTED // SIGNAL: STABLE ]
        </motion.p>
      </header>

      <main className="w-full max-w-6xl flex flex-col items-center z-10">
        
        {/* Game Window */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-square bg-black border-2 border-cyan/30 w-[500px] max-w-full overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.1)]"
        >
          {/* Grid Lines */}
          <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 opacity-20 pointer-events-none">
            {Array.from({ length: 400 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-cyan/10" />
            ))}
          </div>

          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <motion.button
                whileHover={{ scale: 1.05, color: '#ff00ff', borderColor: '#ff00ff' }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="px-12 py-6 border-2 border-cyan bg-black text-3xl font-black uppercase tracking-widest glitch-text"
                data-text="INITIALIZE_CORE"
              >
                INITIALIZE_CORE
              </motion.button>
              <p className="mt-6 text-xs opacity-50 animate-pulse">PRESS_START_TO_BEGIN_SEQUENCE</p>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-8 border-2 border-magenta shadow-[0_0_30px_rgba(255,0,255,0.2)]"
              >
                <h2 className="text-5xl font-black text-magenta mb-2 glitch-text" data-text="CRITICAL_FAILURE">CRITICAL_FAILURE</h2>
                <p className="text-sm opacity-60 mb-8 tracking-widest">MEMORY_DUMP_COMPLETE // SCORE: {score}</p>
                
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: '#00ffff', color: '#000' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="w-full py-4 border-2 border-cyan font-black uppercase text-xl"
                >
                  REBOOT_SYSTEM
                </motion.button>
              </motion.div>
            </div>
          )}

          {/* Render Snake */}
          {snake.map((segment, i) => (
            <div
              key={`${i}-${segment.x}-${segment.y}`}
              className="absolute w-[5%] h-[5%] p-[1px]"
              style={{ 
                left: `${(segment.x / GRID_SIZE) * 100}%`,
                top: `${(segment.y / GRID_SIZE) * 100}%`,
              }}
            >
              <div 
                className={`w-full h-full ${i === 0 ? 'bg-white shadow-[0_0_15px_#fff]' : 'bg-cyan/80'}`}
                style={{ 
                  boxShadow: i === 0 ? '0 0 10px #fff, 0 0 20px #00ffff' : 'none',
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                }}
              />
            </div>
          ))}

          {/* Render Food */}
          <div
            className="absolute w-[5%] h-[5%] p-[1px] animate-pulse"
            style={{ 
              left: `${(food.x / GRID_SIZE) * 100}%`,
              top: `${(food.y / GRID_SIZE) * 100}%`,
            }}
          >
            <div className="w-full h-full bg-magenta shadow-[0_0_15px_#ff00ff]" />
          </div>

          {/* Score Overlay */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
            <div className="bg-black/80 border border-cyan/30 px-4 py-2">
              <p className="text-[10px] opacity-50 uppercase">DATA_UNITS</p>
              <p className="text-xl font-bold text-cyan">{score.toString().padStart(4, '0')}</p>
            </div>
            <div className="bg-black/80 border border-magenta/30 px-4 py-2">
              <p className="text-[10px] opacity-50 uppercase">PEAK_SIGNAL</p>
              <p className="text-xl font-bold text-magenta">{highScore.toString().padStart(4, '0')}</p>
            </div>
          </div>
        </motion.section>

        {/* Music Player Sidebar - Vertical Rail */}
        <motion.aside 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed right-0 top-0 h-full w-24 bg-black border-l-2 border-magenta/20 flex flex-col items-center py-12 gap-16 z-50"
        >
          <div className="flex flex-col items-center gap-4 text-[10px] font-black tracking-[0.3em] text-magenta uppercase vertical-rl rotate-180">
            <Music size={14} className="rotate-90 mb-2" />
            AUDIO_DECODER_v4.0
          </div>

          <div className="flex flex-col gap-2">
            {[0, 0.1, 0.2, 0.3].map((delay, i) => (
              <motion.div 
                key={i}
                animate={{ width: isPlaying ? [10, 24, 10] : 10 }}
                transition={{ repeat: Infinity, duration: 0.5, delay }}
                className="h-1 bg-cyan" 
              />
            ))}
          </div>

          {/* Compact Music Controls - Vertical Layout */}
          <div className="flex flex-col items-center gap-10">
            <button onClick={prevTrack} className="text-cyan/40 hover:text-cyan transition-colors">
              <SkipBack size={24} fill="currentColor" className="rotate-90" />
            </button>
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: '#00ffff', color: '#000' }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="w-14 h-14 border-2 border-cyan flex items-center justify-center transition-all shadow-[0_0_20px_rgba(0,255,255,0.2)]"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </motion.button>
            <button onClick={nextTrack} className="text-cyan/40 hover:text-cyan transition-colors">
              <SkipForward size={24} fill="currentColor" className="rotate-90" />
            </button>
          </div>

          <div className="mt-auto flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-4 opacity-40">
              <Volume2 size={14} />
              <div className="w-1 h-32 bg-cyan/10 relative">
                <div className="absolute bottom-0 left-0 w-full bg-cyan h-1/2 shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Trophy size={20} className="text-magenta" />
              <span className="text-[10px] text-magenta font-bold">RANK: S</span>
            </div>
          </div>

          <div className="absolute bottom-4 text-[8px] opacity-20 uppercase tracking-widest">
            CORE_v2.4
          </div>
          
          <audio 
            ref={audioRef}
            src={currentTrack.url}
            onEnded={nextTrack}
          />
        </motion.aside>
      </main>

      {/* Mobile Controls Hint */}
      <div className="lg:hidden mt-8 text-center text-[10px] opacity-40 uppercase tracking-[0.3em] font-bold">
        [ INPUT_DEVICE_MISMATCH // KEYBOARD_REQUIRED ]
      </div>
    </div>
  );
}
