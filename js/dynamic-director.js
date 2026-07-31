/**
 * KAHANIVERSE — DYNAMIC DIRECTOR AI
 * Adaptive difficulty, forgiving streaks, boss checks
 * Privacy note: difficulty changes are SILENT to the child
 */

const DynamicDirector = (function() {

  // Difficulty levels: 1=easiest, 3=standard, 5=hardest
  let currentDifficulty = 3;
  let roundAccuracies   = [];  // per-session
  let wrongStreak       = 0;
  let correctStreak     = 0;
  let bossRoundDone     = false;

  /* ── Adjust difficulty based on recent performance ── */
  function recordAnswer(isCorrect) {
    roundAccuracies.push(isCorrect ? 1 : 0);
    if (isCorrect) {
      correctStreak++;
      wrongStreak = 0;
      // Increase difficulty gently after 3 consecutive correct
      if (correctStreak >= 3 && currentDifficulty < 5) {
        currentDifficulty = Math.min(5, currentDifficulty + 1);
        correctStreak = 0;
      }
    } else {
      wrongStreak++;
      correctStreak = 0;
      // Silently ease difficulty after 2 consecutive wrong (therapy-safe)
      if (wrongStreak >= 2 && currentDifficulty > 1) {
        currentDifficulty = Math.max(1, currentDifficulty - 1);
        wrongStreak = 0;
      }
    }
  }

  /* ── Get timer for current difficulty ── */
  function getTimer() {
    const timers = { 1: 25, 2: 20, 3: 15, 4: 12, 5: 10 };
    return timers[currentDifficulty] || 15;
  }

  /* ── Get number of answer options ── */
  function getOptionCount() {
    // Easier = fewer options (2), Harder = more (4)
    if (currentDifficulty <= 2) return 2;
    if (currentDifficulty === 3) return 3;
    return 4;
  }

  /* ── Is this the boss round? (round 5 = last round) ── */
  function isBossRound(roundIndex, totalRounds) {
    return roundIndex === totalRounds - 1 && !bossRoundDone;
  }

  /* ── Boss round result ── */
  function completeBossRound(passed) {
    bossRoundDone = true;
    return {
      passed,
      gemBonus:  passed ? 20 : 5,
      badgeId:   passed ? 'boss_'+Date.now() : null,
      message:   passed ? 'Boss Challenge Conquered! 🏆' : 'Great try! You\'ll get it next time! 💙',
    };
  }

  /* ── Forgiving streak: 1 grace day per week ── */
  function updateStreak(profile) {
    if (!profile) return profile;
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const twoDays   = new Date(Date.now() - 172800000).toDateString();
    const lastPlay  = profile.lastPlayed ? new Date(profile.lastPlayed).toDateString() : null;

    if (lastPlay === today) return profile;  // Already played today

    if (lastPlay === yesterday) {
      // Perfect — extend streak
      profile.streak = (profile.streak || 0) + 1;
      profile.graceUsedThisWeek = false;
    } else if (lastPlay === twoDays && !profile.graceUsedThisWeek) {
      // Grace day: skipped 1 day, forgive it
      profile.streak = (profile.streak || 0) + 1;
      profile.graceUsedThisWeek = true;
      profile.graceNote = 'Rest day taken';
    } else {
      // Streak resets — but gently
      profile.streak = 1;
      profile.graceUsedThisWeek = false;
    }

    profile.lastPlayed = new Date().toISOString();
    return profile;
  }

  /* ── Session summary for clinician ── */
  function getSessionReport() {
    const total   = roundAccuracies.length;
    const correct = roundAccuracies.filter(Boolean).length;
    return {
      difficulty:   currentDifficulty,
      accuracy:     total ? correct / total : 0,
      totalRounds:  total,
      correctCount: correct,
      bossCleared:  bossRoundDone,
    };
  }

  /* ── Reset for new session ── */
  function reset() {
    currentDifficulty = 3;
    roundAccuracies   = [];
    wrongStreak       = 0;
    correctStreak     = 0;
    bossRoundDone     = false;
  }

  return { recordAnswer, getTimer, getOptionCount, isBossRound, completeBossRound, updateStreak, getSessionReport, reset,
    get difficulty() { return currentDifficulty; },
  };
})();

window.DynamicDirector = DynamicDirector;
