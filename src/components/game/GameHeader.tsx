import { Bomb, Clock, RotateCcw } from 'lucide-react';
import { DIFFICULTY_CONFIGS, Difficulty } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameHeaderProps {
  mineCount: number;
  flagCount: number;
  rewindCount: number;
  elapsedTime: number;
  safeClickStreak: number;
  difficulty: Difficulty;
  showRewindRestore?: boolean;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const GameHeader = ({
  mineCount,
  flagCount,
  rewindCount,
  elapsedTime,
  safeClickStreak,
  difficulty,
  showRewindRestore = false,
}: GameHeaderProps) => {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const remainingMines = mineCount - flagCount;
  const progressToRestore = safeClickStreak / config.safeClicksToRestore;
  const canRestore = rewindCount < config.initialRewinds;
  
  return (
    <div className="flex items-center justify-between w-full max-w-md px-4 py-3 bg-card/80 backdrop-blur-sm rounded-2xl border-2 border-border cute-shadow">
      {/* 剩余地雷 */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-destructive/20 rounded-xl">
          <Bomb className="text-destructive" size={20} />
        </div>
        <span className="text-xl font-bold text-foreground">
          {remainingMines}
        </span>
      </div>
      
      {/* 回溯次数 */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          <div className={cn(
            "p-2 rounded-xl transition-all",
            rewindCount > 0 ? "bg-game-rewind-glow/30" : "bg-muted",
            showRewindRestore && "rewind-restore"
          )}>
            <RotateCcw 
              className={cn(
                "transition-colors",
                rewindCount > 0 ? "text-game-rewind-glow" : "text-muted-foreground"
              )} 
              size={20} 
            />
          </div>
          <span className={cn(
            "text-xl font-bold transition-colors",
            rewindCount > 0 ? "text-foreground" : "text-muted-foreground"
          )}>
            {rewindCount}
          </span>
        </div>
        
        {/* 恢复进度条 */}
        {canRestore && (
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-game-rewind-pulse rounded-full transition-all duration-300"
              style={{ width: `${progressToRestore * 100}%` }}
            />
          </div>
        )}
      </div>
      
      {/* 计时器 */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-foreground">
          {formatTime(elapsedTime)}
        </span>
        <div className="p-2 bg-accent/30 rounded-xl">
          <Clock className="text-accent-foreground" size={20} />
        </div>
      </div>
    </div>
  );
};
