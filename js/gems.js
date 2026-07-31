/**
 * KAHANIVERSE — SIGN-GEMS CURRENCY
 * Second track alongside XP, earned per gesture + stars
 */

const Gems = (function() {

  function getGems(profileId) {
    const p = KV.getProfile(profileId || KV.state.currentProfileId);
    return p?.signGems || 0;
  }

  function addGems(amount, reason, profileId) {
    const p = KV.getProfile(profileId || KV.state.currentProfileId);
    if (!p) return 0;
    p.signGems = (p.signGems || 0) + amount;
    KV.save();
    if (amount > 0) {
      KV.showToast('+' + amount + ' 💎 Sign-Gems — ' + reason, 'success', 2000);
    }
    return p.signGems;
  }

  function spendGems(amount, profileId) {
    const p = KV.getProfile(profileId || KV.state.currentProfileId);
    if (!p || (p.signGems || 0) < amount) return false;
    p.signGems -= amount;
    KV.save();
    return true;
  }

  // Gems awarded per event
  const REWARDS = {
    correct_sign:   5,
    correct_answer: 8,
    world_1_star:  15,
    world_2_star:  25,
    world_3_star:  30,
    boss_cleared:  20,
    daily_login:   10,
    streak_7:      50,
  };

  function award(eventId, profileId) {
    const amount = REWARDS[eventId] || 5;
    return addGems(amount, eventId.replace(/_/g, ' '), profileId);
  }

  function updateNavGems(profileId) {
    const gems = getGems(profileId);
    document.querySelectorAll('.nav-gems').forEach(el => {
      el.textContent = '💎 ' + gems;
    });
  }

  return { getGems, addGems, spendGems, award, updateNavGems, REWARDS };
})();

window.Gems = Gems;
