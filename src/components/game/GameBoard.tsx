import { Cell } from '@/types/game';
import { GameCell } from './GameCell';

interface GameBoardProps {
  board: Cell[][];
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
  disabled?: boolean;
  isRewinding?: boolean;
}

export const GameBoard = ({
  board,
  onReveal,
  onFlag,
  disabled = false,
  isRewinding = false,
}: GameBoardProps) => {
  const rows = board.length;
  const cols = board[0]?.length || 0;
  
  // 根据屏幕大小和棋盘尺寸计算格子大小
  const maxBoardWidth = Math.min(window.innerWidth - 32, 500);
  const maxBoardHeight = Math.min(window.innerHeight - 280, 500);
  
  const cellSizeByWidth = Math.floor((maxBoardWidth - (cols - 1) * 4) / cols);
  const cellSizeByHeight = Math.floor((maxBoardHeight - (rows - 1) * 4) / rows);
  const cellSize = Math.min(cellSizeByWidth, cellSizeByHeight, 40);
  
  return (
    <div 
      className={`
        inline-flex flex-col gap-1 p-3 rounded-2xl
        bg-card/80 backdrop-blur-sm
        border-2 border-border
        cute-shadow
        ${isRewinding ? 'rewind-effect' : ''}
      `}
    >
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {row.map((cell) => (
            <GameCell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              onReveal={onReveal}
              onFlag={onFlag}
              disabled={disabled}
              cellSize={cellSize}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
