const KEY = 'cafe_business_game_v3_state';

export function saveGame(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.error('保存に失敗しました', e);
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearGame() {
  localStorage.removeItem(KEY);
}
