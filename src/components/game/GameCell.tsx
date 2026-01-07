import { memo } from 'react';
import { Cell } from '@/types/game';
import { cn } from '@/lib/utils';
import { Flag, Bomb } from 'lucide-react';

interface GameCellProps {
  cell: Cell;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
  disabled?: boolean;
  cellSize: number;
}

const numberColors: Record<number, string> = {
  1: 'text-game-number-1',
  2: 'text-game-number-2',
  3: 'text-game-number-3',
  4: 'text-game-number-4',
  5: 'text-game-number-5',
  6: 'text-game-number-6',
  7: 'text-game-number-7',
  8: 'text-game-number-8',
};

export const GameCell = memo(function GameCell({
  cell,
  onReveal,
  onFlag,
  disabled = false,
  cellSize,
}: GameCellProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled || cell.isFlagged) return;
    onReveal(cell.row, cell.col);
  };
  
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled || cell.isRevealed) return;
    onFlag(cell.row, cell.col);
  };
  
  const handleLongPress = (e: React.TouchEvent) => {
    e.preventDefault();
    if (disabled || cell.isRevealed) return;
    onFlag(cell.row, cell.col);
  };
  
  // 长按检测
  let longPressTimer: NodeJS.Timeout | null = null;
  
  const handleTouchStart = () => {
    longPressTimer = setTimeout(() => {
      if (!disabled && !cell.isRevealed) {
        onFlag(cell.row, cell.col);
      }
    }, 500);
  };
  
  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };
  
  const renderContent = () => {
    if (cell.isFlagged) {
      return (
        <Flag 
          className="flag-plant text-destructive drop-shadow-sm" 
          size={cellSize * 0.5} 
          fill="currentColor"
        />
      );
    }
    
    if (!cell.isRevealed) {
      return null;
    }
    
    if (cell.isMine) {
      return (
        <Bomb 
          className="text-foreground drop-shadow-md" 
          size={cellSize * 0.55}
        />
      );
    }
    
    if (cell.adjacentMines > 0) {
      return (
        <span 
          className={cn(
            'font-extrabold select-none',
            numberColors[cell.adjacentMines] || 'text-foreground'
          )}
          style={{ fontSize: cellSize * 0.5 }}
        >
          {cell.adjacentMines}
        </span>
      );
    }
    
    return null;
  };
  
  return (
    <button
      className={cn(
        'flex items-center justify-center rounded-lg transition-all duration-150',
        'border-2 font-cute',
        // 未揭开状态
        !cell.isRevealed && [
          'bg-game-cell-unrevealed',
          'border-border',
          'cute-shadow-sm press-effect',
          'hover:bg-game-cell-hover hover:scale-105',
          'active:scale-95',
        ],
        // 已揭开状态
        cell.isRevealed && [
          'bg-game-cell-revealed',
          'border-transparent',
          'cell-reveal',
        ],
        // 地雷爆炸
        cell.isRevealed && cell.isMine && [
          'bg-destructive/20',
          'border-destructive',
        ],
        // 危险标记（回溯后）
        cell.isDanger && !cell.isRevealed && [
          'danger-pulse',
          'border-game-cell-danger',
        ],
        // 禁用状态
        disabled && 'cursor-not-allowed opacity-70',
      )}
      style={{
        width: cellSize,
        height: cellSize,
      }}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      disabled={disabled}
      aria-label={`Cell ${cell.row + 1}, ${cell.col + 1}${cell.isRevealed ? ', revealed' : ''}${cell.isFlagged ? ', flagged' : ''}`}
    >
      {renderContent()}
    </button>
  );
});
