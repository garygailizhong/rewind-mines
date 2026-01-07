// 游戏难度类型
export type Difficulty = 'easy' | 'medium' | 'hard';

// 难度配置
export interface DifficultyConfig {
  name: string;
  nameZh: string;
  rows: number;
  cols: number;
  mines: number;
  initialRewinds: number;
  safeClicksToRestore: number;
}

// 难度配置表
export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: 'easy',
    nameZh: '简单',
    rows: 8,
    cols: 8,
    mines: 10,
    initialRewinds: 5,
    safeClicksToRestore: 4,
  },
  medium: {
    name: 'medium',
    nameZh: '中等',
    rows: 12,
    cols: 12,
    mines: 25,
    initialRewinds: 3,
    safeClicksToRestore: 5,
  },
  hard: {
    name: 'hard',
    nameZh: '困难',
    rows: 16,
    cols: 16,
    mines: 45,
    initialRewinds: 2,
    safeClicksToRestore: 6,
  },
};

// 单元格状态
export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
  isDanger: boolean; // 回溯后标记的危险区域
}

// 游戏状态
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost' | 'rewind-prompt';

// 游戏快照（用于回溯）
export interface GameSnapshot {
  board: Cell[][];
  timestamp: number;
  flagCount: number;
  revealedCount: number;
}

// 游戏状态
export interface GameState {
  board: Cell[][];
  status: GameStatus;
  difficulty: Difficulty;
  mineCount: number;
  flagCount: number;
  revealedCount: number;
  rewindCount: number;
  safeClickStreak: number;
  elapsedTime: number;
  isFirstClick: boolean;
  lastMinePosition: { row: number; col: number } | null;
  snapshots: GameSnapshot[];
}

// 游戏统计
export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  bestTimes: Record<Difficulty, number | null>;
  totalRewindsUsed: number;
  longestWinStreak: number;
  currentWinStreak: number;
}

// 默认统计数据
export const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  bestTimes: {
    easy: null,
    medium: null,
    hard: null,
  },
  totalRewindsUsed: 0,
  longestWinStreak: 0,
  currentWinStreak: 0,
};
