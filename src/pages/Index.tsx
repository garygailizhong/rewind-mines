import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { GameBoard } from '@/components/game/GameBoard';
import { GameHeader } from '@/components/game/GameHeader';
import { RewindPrompt } from '@/components/game/RewindPrompt';
import { GameOverModal } from '@/components/game/GameOverModal';
import { DifficultySelector } from '@/components/game/DifficultySelector';
import { StatsModal } from '@/components/game/StatsModal';
import { FlagModeToggle } from '@/components/game/FlagModeToggle';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useGameStats } from '@/hooks/useGameStats';
import { useSound } from '@/hooks/useSound';
import { Difficulty, DIFFICULTY_CONFIGS } from '@/types/game';
import { Play, BarChart3, RotateCcw, Home } from 'lucide-react';

const Index = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [showStats, setShowStats] = useState(false);
  const [isRewinding, setIsRewinding] = useState(false);
  const [showRewindRestore, setShowRewindRestore] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [isFlagMode, setIsFlagMode] = useState(false);
  
  const { gameState, revealCell, toggleFlag, startNewGame, performRewind, skipRewind } = useGameLogic(selectedDifficulty);
  const { stats, recordWin, recordLoss, resetStats, winRate } = useGameStats();
  const sound = useSound();
  
  const config = DIFFICULTY_CONFIGS[gameState.difficulty];
  const rewindsUsed = config.initialRewinds - gameState.rewindCount;
  
  // 监听回溯次数恢复
  const prevRewindCount = useState(gameState.rewindCount)[0];
  useEffect(() => {
    if (gameState.rewindCount > prevRewindCount && gameState.status === 'playing') {
      setShowRewindRestore(true);
      sound.playRewindRestore();
      setTimeout(() => setShowRewindRestore(false), 500);
    }
  }, [gameState.rewindCount, gameState.status, prevRewindCount, sound]);
  
  // 记录游戏结果
  useEffect(() => {
    if (gameState.status === 'won') {
      sound.playVictory();
      recordWin(gameState.difficulty, gameState.elapsedTime, rewindsUsed);
    } else if (gameState.status === 'lost') {
      sound.playExplosion();
      recordLoss(rewindsUsed);
    }
  }, [gameState.status]);
  
  // 处理格子点击 - 根据模式决定揭开还是标记
  const handleCellClick = useCallback((row: number, col: number) => {
    if (isFlagMode) {
      sound.playFlag();
      toggleFlag(row, col);
    } else {
      sound.playReveal();
      revealCell(row, col);
    }
  }, [isFlagMode, revealCell, toggleFlag, sound]);

  const handleFlag = useCallback((row: number, col: number) => {
    sound.playFlag();
    toggleFlag(row, col);
  }, [toggleFlag, sound]);
  
  const handleRewind = useCallback(() => {
    setIsRewinding(true);
    sound.playRewind();
    performRewind();
    setTimeout(() => setIsRewinding(false), 600);
  }, [performRewind, sound]);
  
  const handleStartGame = () => {
    startNewGame(selectedDifficulty);
    setShowMenu(false);
  };
  
  const handleGoHome = () => {
    startNewGame(selectedDifficulty);
    setShowMenu(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Logo */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-1">
          扫雷<span className="text-primary">·</span>时间回溯
        </h1>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <RotateCcw size={14} className="text-game-rewind-glow" />
          点错了？回到3秒前！
        </p>
      </div>
      
      {/* 主菜单 */}
      {showMenu && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <DifficultySelector
            selected={selectedDifficulty}
            onSelect={setSelectedDifficulty}
          />
          
          <Button
            size="lg"
            className="w-full max-w-xs gap-2 text-lg h-14 bg-primary hover:bg-primary/80 rounded-2xl cute-shadow press-effect"
            onClick={handleStartGame}
          >
            <Play size={24} fill="currentColor" />
            开始游戏
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full max-w-xs gap-2 border-2 rounded-2xl cute-shadow-sm press-effect"
            onClick={() => setShowStats(true)}
          >
            <BarChart3 size={20} />
            游戏统计
          </Button>
        </div>
      )}
      
      {/* 游戏界面 */}
      {!showMenu && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <GameHeader
            mineCount={gameState.mineCount}
            flagCount={gameState.flagCount}
            rewindCount={gameState.rewindCount}
            elapsedTime={gameState.elapsedTime}
            safeClickStreak={gameState.safeClickStreak}
            difficulty={gameState.difficulty}
            showRewindRestore={showRewindRestore}
          />
          
          <GameBoard
            board={gameState.board}
            onReveal={handleCellClick}
            onFlag={handleFlag}
            disabled={gameState.status === 'won' || gameState.status === 'lost' || gameState.status === 'rewind-prompt'}
            isRewinding={isRewinding}
          />
          
          {/* 交互说明 */}
          <div className="flex flex-col items-center gap-1 mt-2 text-xs text-muted-foreground">
            <div className="hidden md:flex items-center gap-4">
              <span>🖱️ 左键点击揭开</span>
              <span>🚩 右键标记地雷</span>
            </div>
            <div className="flex md:hidden items-center gap-4">
              <span>👆 点击揭开</span>
              <span>👆💫 长按标记/取消</span>
            </div>
          </div>
          
          {/* 移动端标记模式切换按钮 */}
          <FlagModeToggle
            isFlagMode={isFlagMode}
            onToggle={() => setIsFlagMode(!isFlagMode)}
          />
        </div>
      )}
      
      {/* 回溯提示 */}
      {gameState.status === 'rewind-prompt' && (
        <RewindPrompt
          rewindCount={gameState.rewindCount}
          onRewind={handleRewind}
          onSkip={skipRewind}
        />
      )}
      
      {/* 游戏结束 */}
      {(gameState.status === 'won' || gameState.status === 'lost') && (
        <GameOverModal
          isWin={gameState.status === 'won'}
          elapsedTime={gameState.elapsedTime}
          rewindsUsed={rewindsUsed}
          difficulty={gameState.difficulty}
          onRestart={() => {
            startNewGame(gameState.difficulty);
            setShowMenu(false);
          }}
          onHome={handleGoHome}
          bestTime={stats.bestTimes[gameState.difficulty]}
        />
      )}
      
      {/* 统计弹窗 */}
      {showStats && (
        <StatsModal
          stats={stats}
          winRate={winRate}
          onClose={() => setShowStats(false)}
          onReset={resetStats}
        />
      )}
    </div>
  );
};

export default Index;
