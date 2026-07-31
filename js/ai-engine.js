/**
 * KAHANIVERSE — AI REINFORCEMENT ENGINE
 * UCB-1 Multi-Armed Bandit + ranked reward selection
 * Generates ABA-informed reinforcement schedules
 */

const AIEngine = (function() {

  /* ── UCB-1 Bandit Score ── */
  function ucbScore(reward, profileId, totalPulls) {
    const prefs = KV.getProfile(profileId)?.prefs || [];
    const n     = Math.max(1, reward.timesDelivered || 1);
    const t     = Math.max(1, totalPulls);
    // Mean estimate: preference match = 4, else 2.5
    const mean  = prefs.includes(reward.category) ? 4.0 : 2.5;
    // Exploration bonus
    const exploration = 1.5 * Math.sqrt(Math.log(t) / n);
    return mean + exploration;
  }

  /* ── Select Top N Rewards ── */
  function selectRewards(profileId, count = 3) {
    const profile = KV.getProfile(profileId);
    if (!profile) return KV.DEFAULT_REWARDS.slice(0, count);

    const lockedCats  = new Set(JSON.parse(localStorage.getItem('kv_locked_cats') || '[]'));
    const history     = KV.state.rewardHistory.filter(h => h.profileId === profileId);
    const totalPulls  = history.length || 1;
    const recentIds   = new Set(history.slice(-5).map(h => h.rewardId));

    const scored = KV.DEFAULT_REWARDS
      .filter(r => !lockedCats.has(r.category))
      .map(r => {
        let score = ucbScore(r, profileId, totalPulls);
        if (!recentIds.has(r.id)) score += 0.3;            // novelty bonus
        if (Math.random() < 0.1) score += Math.random();   // 10% explore
        return { reward: r, score };
      });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, count).map(s => s.reward);
  }

  /* ── Generate ABA Schedule ── */
  function generateSchedule(profileId, type = 'VR') {
    const profile = KV.getProfile(profileId);
    const rewards = selectRewards(profileId, 5);
    const avgMot  = profile?.avgMotivation || 3.5;
    const slots   = [];

    for (let i = 0; i < 8; i++) {
      const r = rewards[i % rewards.length];
      let trigger = '';

      switch (type) {
        case 'FR': {
          const n = avgMot >= 4 ? 4 : avgMot >= 3 ? 3 : 2;
          trigger = `After ${n * (i + 1)} correct responses`;
          break;
        }
        case 'VR': {
          const base = avgMot >= 4 ? 4 : 3;
          const n    = Math.max(1, base + Math.floor((Math.random() - 0.5) * 2));
          trigger = `After ~${n * (i + 1)} responses`;
          break;
        }
        case 'FI': {
          const interval = Math.max(2, Math.round((profile?.attentionSpan || 8) / 3));
          trigger = `At ${interval * (i + 1)} min mark`;
          break;
        }
        case 'VI': {
          const base = Math.max(2, Math.round((profile?.attentionSpan || 8) / 3));
          const t    = Math.max(1, base + Math.floor((Math.random() - 0.5) * base));
          trigger = `Around ${t * (i + 1)} min mark`;
          break;
        }
      }

      slots.push({ trigger, reward: r.title, emoji: r.emoji, category: r.category });
    }
    return slots;
  }

  /* ── Motivation Trend ── */
  function getMotivationTrend(profileId) {
    const history = KV.state.rewardHistory.filter(h => h.profileId === profileId);
    if (history.length < 2) return { trend: 'neutral', change: 0, label: 'Not enough data yet' };
    const recent    = history.slice(-3).map(h => (h.accuracy || 0) * 5);
    const older     = history.slice(-6, -3).map(h => (h.accuracy || 0) * 5);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / (recent.length || 1);
    const olderAvg  = older.length ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
    const change    = recentAvg - olderAvg;
    return {
      trend:  change > 0.2 ? 'improving' : change < -0.2 ? 'declining' : 'stable',
      change: Math.round(change * 10) / 10,
      label:  change > 0.2 ? '📈 Improving!' : change < -0.2 ? '📉 Needs attention' : '➡️ Stable',
    };
  }

  /* ── Rule-based clinician report ── */
  function generateReport(profileId) {
    const profile  = KV.getProfile(profileId);
    const history  = KV.state.rewardHistory.filter(h => h.profileId === profileId);
    if (!profile) return null;

    const avgAcc   = history.length ? history.reduce((a, h) => a + (h.accuracy || 0), 0) / history.length : 0;
    const totalSes = profile.sessions || 0;
    const topRew   = selectRewards(profileId, 2);
    const trend    = getMotivationTrend(profileId);

    return {
      summary: `${profile.name} has completed ${totalSes} session(s) with an average accuracy of ${Math.round(avgAcc * 100)}%. Engagement is ${trend.trend}.`,
      highlights: [
        `Top reinforcers: ${topRew.map(r => r.title).join(' & ')}.`,
        `Total XP earned: ${profile.totalXP || 0}. Current streak: ${profile.streak || 0} days.`,
        `Worlds completed: ${KV.getWorlds(profileId).filter(w => (w.stars || 0) > 0).length} of 5.`,
      ],
      suggestions: [
        avgAcc < 0.6 ? 'Consider reducing task complexity to build confidence.' : 'Maintain current difficulty level.',
        trend.trend === 'declining' ? 'Introduce novel reward categories to re-engage.' : 'Continue current reinforcement strategy.',
        `Recommended schedule type: ${avgAcc >= 0.8 ? 'VR' : avgAcc >= 0.6 ? 'FR' : 'FI'}.`,
      ],
      scheduleRec: avgAcc >= 0.8 ? 'VR' : avgAcc >= 0.6 ? 'FR' : 'FI',
    };
  }

  return { selectRewards, generateSchedule, getMotivationTrend, generateReport };
})();

window.AIEngine = AIEngine;
