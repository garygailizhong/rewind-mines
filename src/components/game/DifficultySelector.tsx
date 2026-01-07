import { Button } from '@/components/ui/button';
import { Difficulty, DIFFICULTY_CONFIGS } from '@/types/game';
import { cn } from '@/lib/utils';

interface DifficultySelectorProps {
  selected: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

export const DifficultySelector = ({
  selected,
  onSelect,
}: DifficultySelectorProps) => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  
  const difficultyEmoji: Record<Difficulty, string> = {
    easy: '🌸',
    medium: '🌟',
    hard: '🔥',
  };
  
  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      {difficulties.map((diff) => {
        const config = DIFFICULTY_CONFIGS[diff];
        const isSelected = selected === diff;
        
        return (
          <Button
            key={diff}
            variant="outline"
            className={cn(
              "flex items-center justify-between w-full h-auto p-4",
              "border-2 rounded-2xl transition-all duration-200",
              "cute-shadow-sm press-effect",
              isSelected && [
                "border-primary bg-primary/10",
                "scale-105",
              ],
              !isSelected && [
                "border-border bg-card",
                "hover:border-primary/50 hover:bg-primary/5",
              ]
            )}
            onClick={() => onSelect(diff)}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{difficultyEmoji[diff]}</span>
              <div className="text-left">
                <div className="font-bold text-foreground">{config.nameZh}</div>
                <div className="text-xs text-muted-foreground">
                  {config.rows}×{config.cols} · {config.mines}颗雷
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 px-2 py-1 bg-game-rewind-glow/20 rounded-lg">
              <span className="text-sm">🔄</span>
              <span className="text-sm font-bold text-game-rewind-glow">
                ×{config.initialRewinds}
              </span>
            </div>
          </Button>
        );
      })}
    </div>
  );
};
