import { useState, useEffect, useCallback } from 'react';
import { GameStats, DEFAULT_STATS, Difficulty } from '@/types/game';

const STORAGE_KEY = 'minesweeper-rewind-stats';

export const useGameStats = () => {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  
  // 从localStorage加载统计
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setStats({ ...DEFAULT_STATS, ...parsed });
      }
    } catch (e) {
      console.error('Failed to load game stats:', e);
    }
  }, []);
  
  // 保存到localStorage
  const saveStats = useCallback((newStats: GameStats) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    } catch (e) {
      console.error('Failed to save game stats:', e);
    }
  }, []);
  
  // 记录游戏胜利
  const recordWin = useCallback((difficulty: Difficulty, time: number, rewindsUsed: number) => {
    setStats(prev => {
      const currentBest = prev.bestTimes[difficulty];
      const newBestTime = currentBest === null ? time : Math.min(currentBest, time);
      
      const newStats: GameStats = {
        ...prev,
        totalGames: prev.totalGames + 1,
        wins: prev.wins + 1,
        bestTimes: {
          ...prev.bestTimes,
          [difficulty]: newBestTime,
        },
        totalRewindsUsed: prev.totalRewindsUsed + rewindsUsed,
        currentWinStreak: prev.currentWinStreak + 1,
        longestWinStreak: Math.max(prev.longestWinStreak, prev.currentWinStreak + 1),
      };
      
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);
  
  // 记录游戏失败
  const recordLoss = useCallback((rewindsUsed: number) => {
    setStats(prev => {
      const newStats: GameStats = {
        ...prev,
        totalGames: prev.totalGames + 1,
        losses: prev.losses + 1,
        totalRewindsUsed: prev.totalRewindsUsed + rewindsUsed,
        currentWinStreak: 0,
      };
      
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);
  
  // 重置统计
  const resetStats = useCallback(() => {
    setStats(DEFAULT_STATS);
    saveStats(DEFAULT_STATS);
  }, [saveStats]);
  
  // 计算胜率
  const winRate = stats.totalGames > 0 
    ? Math.round((stats.wins / stats.totalGames) * 100) 
    : 0;
  
  return {
    stats,
    recordWin,
    recordLoss,
    resetStats,
    winRate,
  };
};
