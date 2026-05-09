export const INITIAL_CASH = 50000;
export const GAME_DAYS = 7;

export const DEFAULT_VARIATION_MAX = 40;  // 需要変動の最大幅（%）
export const DEFAULT_VARIATION_STEP = 5;  // 需要変動の刻み幅（%）

export const PRODUCTS = [
  {
    id: 'coffee',
    name: 'コーヒー',
    costPrice: 30,
    standardPrice: 100,
    baseDemand: 60,
    stockType: 'carryover',
  },
  {
    id: 'sandwich',
    name: 'サンドイッチ',
    costPrice: 180,
    standardPrice: 320,
    baseDemand: 35,
    stockType: 'daily_discard',
  },
  {
    id: 'cookie',
    name: 'クッキー',
    costPrice: 150,
    standardPrice: 300,
    baseDemand: 25,
    stockType: 'two_day',
  },
];

export const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日'];

// 仕入単価倍率: day>=3 なら1.2倍（App.jsxかgameLogic.jsで計算）
export const COST_MULTIPLIER_FROM_DAY = 3; // 3日目以降1.2倍

export const MARKET_INFO = [
  {
    day: 1, weekday: '月',
    event: '通常営業',
    eventKey: 'normal',
    memo: 'まずは標準的な需要が見込まれます。',
    eventCoeff: { default: 1.0 },
  },
  {
    day: 2, weekday: '火',
    event: '通常営業',
    eventKey: 'normal',
    memo: '前日の結果を見て、仕入れと価格を調整しましょう。',
    eventCoeff: { default: 1.0 },
  },
  {
    day: 3, weekday: '水',
    event: '仕入単価上昇',
    eventKey: 'cost_up',
    memo: '仕入単価が上がりました。利益を出すには価格と仕入数の判断が重要です。',
    eventCoeff: { default: 1.0 },
  },
  {
    day: 4, weekday: '木',
    event: '通常営業',
    eventKey: 'normal',
    memo: '週末の学園祭に向けて、SNS投稿や仕入れをどうするか考えましょう。',
    eventCoeff: { default: 1.0 },
  },
  {
    day: 5, weekday: '金',
    event: '学園祭準備',
    eventKey: 'festival_prep',
    memo: '学園祭の準備で人の動きが増えています。遅い時間までカフェ利用がありそうです。',
    eventCoeff: { default: 1.10 },
  },
  {
    day: 6, weekday: '土',
    event: '学園祭1日目',
    eventKey: 'festival1',
    memo: '学園祭が始まりました。来店の増加が見込まれますが、他の出店も多くあります。商品数や価格の判断が大切です。',
    eventCoeff: { default: 1.25 },
  },
  {
    day: 7, weekday: '日',
    event: '学園祭2日目',
    eventKey: 'festival2',
    memo: '学園祭2日目です。前日の結果を見て、仕入れと価格を調整しましょう。',
    eventCoeff: { default: 1.20 },
  },
];
