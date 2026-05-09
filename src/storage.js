const SAVE_KEY = 'bizgame_save';

export function saveGame(gameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  } catch (e) {
    console.warn('saveGame failed:', e);
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('loadGame failed:', e);
    return null;
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    console.warn('clearGame failed:', e);
  }
}
