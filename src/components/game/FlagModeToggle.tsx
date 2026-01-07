import { Flag, Pickaxe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlagModeToggleProps {
  isFlagMode: boolean;
  onToggle: () => void;
}

export const FlagModeToggle = ({ isFlagMode, onToggle }: FlagModeToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "fixed bottom-6 right-6 z-40",
        "w-16 h-16 rounded-full",
        "flex items-center justify-center",
        "border-3 border-border",
        "cute-shadow press-effect",
        "transition-all duration-200",
        "md:hidden", // 只在移动端显示
        isFlagMode 
          ? "bg-destructive text-destructive-foreground border-destructive/50" 
          : "bg-card text-foreground"
      )}
      aria-label={isFlagMode ? "切换到揭开模式" : "切换到标记模式"}
    >
      {isFlagMode ? (
        <Flag size={28} fill="currentColor" className="bounce-pop" />
      ) : (
        <Pickaxe size={28} />
      )}
    </button>
  );
};
