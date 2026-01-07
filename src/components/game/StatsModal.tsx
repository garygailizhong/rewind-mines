import { GameStats, Difficulty, DIFFICULTY_CONFIGS } from '@/types/game';
import { Trophy, Clock, RotateCcw, Target, Flame, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatsModalProps {
  stats: GameStats;
  winRate: number;
  onClose: () => void;
  onReset: () => void;
}

const formatTime = (seconds: number | null): string => {
  if (seconds === null) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const StatsModal = ({
  stats,
  winRate,
  onClose,
  onReset,
}: StatsModalProps) => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col gap-6 p-6 mx-4 bg-card rounded-3xl border-2 border-border cute-shadow bounce-pop max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="text-warning" size={28} />
            游戏统计
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>
        
        {/* 总览 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 bg-muted/50 rounded-2xl">
            <Target className="text-primary mb-2" size={24} />
            <span className="text-2xl font-bold text-foreground">{stats.totalGames}</span>
            <span className="text-xs text-muted-foreground">总局数</span>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-success/10 rounded-2xl">
            <Trophy className="text-success mb-2" size={24} />
            <span className="text-2xl font-bold text-success">{winRate}%</span>
            <span className="text-xs text-muted-foreground">胜率</span>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-game-rewind-glow/10 rounded-2xl">
            <RotateCcw className="text-game-rewind-glow mb-2" size={24} />
            <span className="text-2xl font-bold text-foreground">{stats.totalRewindsUsed}</span>
            <span className="text-xs text-muted-foreground">回溯使用</span>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-warning/10 rounded-2xl">
            <Flame className="text-warning mb-2" size={24} />
            <span className="text-2xl font-bold text-foreground">{stats.longestWinStreak}</span>
            <span className="text-xs text-muted-foreground">最长连胜</span>
          </div>
        </div>
        
        {/* 最佳时间 */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Clock className="text-accent" size={20} />
            最佳用时
          </h3>
          
          <div className="flex flex-col gap-2">
            {difficulties.map((diff) => {
              const config = DIFFICULTY_CONFIGS[diff];
              const bestTime = stats.bestTimes[diff];
              
              return (
                <div 
                  key={diff}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                >
                  <span className="font-medium text-foreground">{config.nameZh}</span>
                  <span className={`font-bold ${bestTime !== null ? 'text-success' : 'text-muted-foreground'}`}>
                    {formatTime(bestTime)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 胜负统计 */}
        <div className="flex items-center justify-center gap-8 p-4 bg-muted/30 rounded-2xl">
          <div className="text-center">
            <span className="text-2xl font-bold text-success">{stats.wins}</span>
            <p className="text-xs text-muted-foreground">胜利</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <span className="text-2xl font-bold text-destructive">{stats.losses}</span>
            <p className="text-xs text-muted-foreground">失败</p>
          </div>
        </div>
        
        {/* 重置按钮 */}
        <Button
          variant="outline"
          className="border-destructive/50 text-destructive hover:bg-destructive/10 rounded-xl"
          onClick={onReset}
        >
          重置统计数据
        </Button>
      </div>
    </div>
  );
};
