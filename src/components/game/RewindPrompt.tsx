import { Button } from '@/components/ui/button';
import { RotateCcw, X, Clock } from 'lucide-react';

interface RewindPromptProps {
  rewindCount: number;
  onRewind: () => void;
  onSkip: () => void;
}

export const RewindPrompt = ({
  rewindCount,
  onRewind,
  onSkip,
}: RewindPromptProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-6 p-8 mx-4 bg-card rounded-3xl border-2 border-border cute-shadow bounce-pop">
        {/* 爆炸图标 */}
        <div className="relative">
          <div className="absolute inset-0 bg-destructive/30 rounded-full blur-xl animate-pulse" />
          <div className="relative p-6 bg-destructive/20 rounded-full border-4 border-destructive">
            <span className="text-5xl">💣</span>
          </div>
        </div>
        
        {/* 提示文字 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            糟糕！踩到地雷了
          </h2>
          <p className="text-muted-foreground">
            你还有 <span className="text-game-rewind-glow font-bold">{rewindCount}</span> 次回溯机会
          </p>
        </div>
        
        {/* 回溯说明 */}
        <div className="flex items-center gap-2 px-4 py-2 bg-game-rewind-glow/20 rounded-xl">
          <Clock className="text-game-rewind-glow" size={18} />
          <span className="text-sm text-foreground">
            回溯将返回3秒前的状态
          </span>
        </div>
        
        {/* 按钮组 */}
        <div className="flex gap-4 w-full">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 gap-2 border-2 rounded-xl cute-shadow-sm press-effect"
            onClick={onSkip}
          >
            <X size={20} />
            放弃
          </Button>
          
          <Button
            size="lg"
            className="flex-1 gap-2 bg-game-rewind-glow hover:bg-game-rewind-glow/80 text-white rounded-xl cute-shadow-sm press-effect"
            onClick={onRewind}
          >
            <RotateCcw size={20} />
            回溯
          </Button>
        </div>
      </div>
    </div>
  );
};
