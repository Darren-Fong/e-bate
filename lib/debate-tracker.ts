// Utility to track debate participation
export function trackDebate(userId: string, debateType: 'ai' | 'realtime' | 'team' | 'mun') {
  const storageKey = `debate_stats_${userId}`;
  const savedStats = localStorage.getItem(storageKey);
  
  const stats = savedStats ? JSON.parse(savedStats) : {
    totalDebates: 0,
    aiDebates: 0,
    realtimeDebates: 0,
    teamDebates: 0,
    munDebates: 0,
    lastDebateDate: null,
  };

  // Increment counters
  stats.totalDebates += 1;
  stats.lastDebateDate = new Date().toISOString();

  switch (debateType) {
    case 'ai':
      stats.aiDebates += 1;
      break;
    case 'realtime':
      stats.realtimeDebates += 1;
      break;
    case 'team':
      stats.teamDebates += 1;
      break;
    case 'mun':
      stats.munDebates += 1;
      break;
  }

  localStorage.setItem(storageKey, JSON.stringify(stats));
}
