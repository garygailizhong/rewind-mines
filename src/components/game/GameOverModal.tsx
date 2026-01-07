import { Button } from '@/components/ui/button';
import { Trophy, Clock, RotateCcw, RefreshCw, Home } from 'lucide-react';
import { Difficulty, DIFFICULTY_CONFIGS } from '@/types/game';

interface GameOverModalProps {
  isWin: boolean;
  elapsedTime: number;
  rewindsUsed: number;
  difficulty: Difficulty;
  onRestart: () => void;
  onHome: () => void;
  bestTime: number | null;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const GameOverModal = ({
  isWin,
  elapsedTime,
  rewindsUsed,
  difficulty,
  onRestart,
  onHome,
  bestTime,
}: GameOverModalProps) => {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const totalRewinds = config.initialRewinds;
  const isNewRecord = isWin && (bestTime === null || elapsedTime < bestTime);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
      {/* 胜利时的彩带效果 */}
      {isWin && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="confetti-fall absolute w-3 h-3 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['hsl(340,82%,65%)', 'hsl(160,60%,75%)', 'hsl(200,85%,70%)', 'hsl(45,90%,60%)'][i % 4],
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
      
      <div className={`
        flex flex-col items-center gap-6 p-8 mx-4 
        bg-card rounded-3xl border-2 border-border cute-shadow bounce-pop
        ${isWin ? 'border-success' : 'border-destructive'}
      `}>
        {/* 结果图标 */}
        <div className="relative">
          <div className={`
            absolute inset-0 rounded-full blur-xl animate-pulse
            ${isWin ? 'bg-success/30' : 'bg-destructive/30'}
          `} />
          <div className={`
            relative p-6 rounded-full border-4
            ${isWin ? 'bg-success/20 border-success' : 'bg-destructive/20 border-destructive'}
          `}>
            <span className="text-5xl">{isWin ? '🎉' : '💥'}</span>
          </div>
        </div>
        
        {/* 结果文字 */}
        <div className="text-center">
          <h2 className={`
            text-3xl font-bold mb-2
            ${isWin ? 'text-success' : 'text-destructive'}
          `}>
            {isWin ? '恭喜胜利！' : '游戏结束'}
          </h2>
          
          {isNewRecord && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-warning/20 rounded-xl mb-2">
              <Trophy className="text-warning" size={18} />
              <span className="text-warning font-bold">新纪录！</span>
            </div>
          )}
          
          <p className="text-muted-foreground">
            难度：{config.nameZh}
          </p>
        </div>
        
        {/* 统计数据 */}
        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-1">
            <div className="p-3 bg-accent/30 rounded-xl">
              <Clock className="text-accent-foreground" size={24} />
            </div>
            <span className="text-xl font-bold text-foreground">
              {formatTime(elapsedTime)}
            </span>
            <span className="text-xs text-muted-foreground">用时</span>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <div className="p-3 bg-game-rewind-glow/30 rounded-xl">
              <RotateCcw className="text-game-rewind-glow" size={24} />
            </div>
            <span className="text-xl font-bold text-foreground">
              {rewindsUsed}/{totalRewinds}
            </span>
            <span className="text-xs text-muted-foreground">回溯</span>
          </div>
        </div>
        
        {/* 按钮组 */}
        <div className="flex gap-4 w-full">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 gap-2 border-2 rounded-xl cute-shadow-sm press-effect"
            onClick={onHome}
          >
            <Home size={20} />
            主页
          </Button>
          
          <Button
            size="lg"
            className="flex-1 gap-2 bg-primary hover:bg-primary/80 rounded-xl cute-shadow-sm press-effect"
            onClick={onRestart}
          >
            <RefreshCw size={20} />
            再来一局
          </Button>
        </div>
      </div>
    </div>
  );
};
