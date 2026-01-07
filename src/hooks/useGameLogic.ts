import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Cell, 
  GameState, 
  GameSnapshot, 
  Difficulty, 
  DIFFICULTY_CONFIGS,
  GameStatus 
} from '@/types/game';

const SNAPSHOT_INTERVAL = 500; // 每500ms保存一次快照
const MAX_SNAPSHOTS = 6; // 保留最近3秒的快照

// 创建空棋盘
const createEmptyBoard = (rows: number, cols: number): Cell[][] => {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
      isDanger: false,
    }))
  );
};

// 放置地雷（避开首次点击位置）
const placeMines = (
  board: Cell[][],
  mineCount: number,
  safeRow: number,
  safeCol: number
): Cell[][] => {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  
  let placed = 0;
  while (placed < mineCount) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    
    // 避开安全区域（首次点击位置及其周围）
    const isSafeZone = Math.abs(row - safeRow) <= 1 && Math.abs(col - safeCol) <= 1;
    
    if (!newBoard[row][col].isMine && !isSafeZone) {
      newBoard[row][col].isMine = true;
      placed++;
    }
  }
  
  // 计算每个格子周围的地雷数
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!newBoard[r][c].isMine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
              count++;
            }
          }
        }
        newBoard[r][c].adjacentMines = count;
      }
    }
  }
  
  return newBoard;
};

// 递归揭开空白区域
const revealEmptyArea = (board: Cell[][], row: number, col: number): Cell[][] => {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  
  const queue: [number, number][] = [[row, col]];
  
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
    if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) continue;
    
    newBoard[r][c].isRevealed = true;
    
    if (newBoard[r][c].adjacentMines === 0 && !newBoard[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            queue.push([r + dr, c + dc]);
          }
        }
      }
    }
  }
  
  return newBoard;
};

// 检查是否胜利
const checkWin = (board: Cell[][], mineCount: number): boolean => {
  let revealedCount = 0;
  let flaggedMines = 0;
  const totalCells = board.length * board[0].length;
  
  for (const row of board) {
    for (const cell of row) {
      if (cell.isRevealed) revealedCount++;
      if (cell.isFlagged && cell.isMine) flaggedMines++;
    }
  }
  
  // 所有非雷格子都被揭开
  return revealedCount === totalCells - mineCount;
};

// 深拷贝棋盘
const cloneBoard = (board: Cell[][]): Cell[][] => {
  return board.map(row => row.map(cell => ({ ...cell })));
};

export const useGameLogic = (initialDifficulty: Difficulty = 'easy') => {
  const config = DIFFICULTY_CONFIGS[initialDifficulty];
  
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(config.rows, config.cols),
    status: 'idle',
    difficulty: initialDifficulty,
    mineCount: config.mines,
    flagCount: 0,
    revealedCount: 0,
    rewindCount: config.initialRewinds,
    safeClickStreak: 0,
    elapsedTime: 0,
    isFirstClick: true,
    lastMinePosition: null,
    snapshots: [],
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const snapshotTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 保存快照
  const saveSnapshot = useCallback(() => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev;
      
      const snapshot: GameSnapshot = {
        board: cloneBoard(prev.board),
        timestamp: Date.now(),
        flagCount: prev.flagCount,
        revealedCount: prev.revealedCount,
      };
      
      const newSnapshots = [...prev.snapshots, snapshot].slice(-MAX_SNAPSHOTS);
      
      return { ...prev, snapshots: newSnapshots };
    });
  }, []);
  
  // 开始游戏计时器
  const startTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (snapshotTimerRef.current) clearInterval(snapshotTimerRef.current);
    
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.status !== 'playing') return prev;
        return { ...prev, elapsedTime: prev.elapsedTime + 1 };
      });
    }, 1000);
    
    snapshotTimerRef.current = setInterval(saveSnapshot, SNAPSHOT_INTERVAL);
  }, [saveSnapshot]);
  
  // 停止计时器
  const stopTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (snapshotTimerRef.current) {
      clearInterval(snapshotTimerRef.current);
      snapshotTimerRef.current = null;
    }
  }, []);
  
  // 组件卸载时清理
  useEffect(() => {
    return () => stopTimers();
  }, [stopTimers]);
  
  // 开始新游戏
  const startNewGame = useCallback((difficulty?: Difficulty) => {
    stopTimers();
    const diff = difficulty || gameState.difficulty;
    const newConfig = DIFFICULTY_CONFIGS[diff];
    
    setGameState({
      board: createEmptyBoard(newConfig.rows, newConfig.cols),
      status: 'idle',
      difficulty: diff,
      mineCount: newConfig.mines,
      flagCount: 0,
      revealedCount: 0,
      rewindCount: newConfig.initialRewinds,
      safeClickStreak: 0,
      elapsedTime: 0,
      isFirstClick: true,
      lastMinePosition: null,
      snapshots: [],
    });
  }, [gameState.difficulty, stopTimers]);
  
  // 点击格子
  const revealCell = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.status === 'won' || prev.status === 'lost' || prev.status === 'rewind-prompt') {
        return prev;
      }
      
      const cell = prev.board[row][col];
      if (cell.isRevealed || cell.isFlagged) return prev;
      
      let newBoard = cloneBoard(prev.board);
      let newStatus: GameStatus = prev.status === 'idle' ? 'playing' : prev.status;
      let newSafeStreak = prev.safeClickStreak;
      let newRewindCount = prev.rewindCount;
      let lastMinePos = prev.lastMinePosition;
      
      // 首次点击：放置地雷并开始计时
      if (prev.isFirstClick) {
        newBoard = placeMines(newBoard, prev.mineCount, row, col);
        startTimers();
      }
      
      // 点击地雷
      if (newBoard[row][col].isMine) {
        newBoard[row][col].isRevealed = true;
        
        if (prev.rewindCount > 0) {
          // 有回溯机会，显示选择
          newStatus = 'rewind-prompt';
          lastMinePos = { row, col };
        } else {
          // 没有回溯机会，游戏结束
          newStatus = 'lost';
          stopTimers();
          // 揭示所有地雷
          newBoard = newBoard.map(r => 
            r.map(c => c.isMine ? { ...c, isRevealed: true } : c)
          );
        }
        newSafeStreak = 0;
      } else {
        // 安全点击
        newBoard = revealEmptyArea(newBoard, row, col);
        newSafeStreak++;
        
        // 检查是否恢复回溯次数
        const config = DIFFICULTY_CONFIGS[prev.difficulty];
        if (newSafeStreak >= config.safeClicksToRestore && 
            newRewindCount < config.initialRewinds) {
          newRewindCount++;
          newSafeStreak = 0;
        }
        
        // 检查胜利
        if (checkWin(newBoard, prev.mineCount)) {
          newStatus = 'won';
          stopTimers();
        }
      }
      
      // 计算已揭开数量
      let revealedCount = 0;
      for (const r of newBoard) {
        for (const c of r) {
          if (c.isRevealed) revealedCount++;
        }
      }
      
      return {
        ...prev,
        board: newBoard,
        status: newStatus,
        isFirstClick: false,
        safeClickStreak: newSafeStreak,
        rewindCount: newRewindCount,
        revealedCount,
        lastMinePosition: lastMinePos,
      };
    });
  }, [startTimers, stopTimers]);
  
  // 标记旗帜
  const toggleFlag = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.status !== 'playing' && prev.status !== 'idle') return prev;
      
      const cell = prev.board[row][col];
      if (cell.isRevealed) return prev;
      
      const newBoard = cloneBoard(prev.board);
      const newFlagged = !cell.isFlagged;
      newBoard[row][col].isFlagged = newFlagged;
      
      return {
        ...prev,
        board: newBoard,
        flagCount: prev.flagCount + (newFlagged ? 1 : -1),
      };
    });
  }, []);
  
  // 执行回溯
  const performRewind = useCallback(() => {
    setGameState(prev => {
      if (prev.status !== 'rewind-prompt' || prev.snapshots.length === 0) return prev;
      
      // 找到3秒前的快照
      const targetTime = Date.now() - 3000;
      let targetSnapshot = prev.snapshots[0];
      
      for (const snapshot of prev.snapshots) {
        if (snapshot.timestamp <= targetTime) {
          targetSnapshot = snapshot;
        }
      }
      
      // 恢复状态并标记危险区域
      const newBoard = cloneBoard(targetSnapshot.board);
      if (prev.lastMinePosition) {
        const { row, col } = prev.lastMinePosition;
        newBoard[row][col].isDanger = true;
      }
      
      return {
        ...prev,
        board: newBoard,
        status: 'playing',
        rewindCount: prev.rewindCount - 1,
        flagCount: targetSnapshot.flagCount,
        revealedCount: targetSnapshot.revealedCount,
        lastMinePosition: null,
        safeClickStreak: 0,
      };
    });
  }, []);
  
  // 放弃回溯（游戏结束）
  const skipRewind = useCallback(() => {
    stopTimers();
    setGameState(prev => {
      const newBoard = prev.board.map(r => 
        r.map(c => c.isMine ? { ...c, isRevealed: true } : c)
      );
      
      return {
        ...prev,
        board: newBoard,
        status: 'lost',
        lastMinePosition: null,
      };
    });
  }, [stopTimers]);
  
  return {
    gameState,
    revealCell,
    toggleFlag,
    startNewGame,
    performRewind,
    skipRewind,
  };
};
